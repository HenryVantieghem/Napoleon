// Comprehensive error testing utilities for Napoleon AI
// Used for validating bulletproof error handling implementation

export interface ErrorTestScenario {
  id: string
  name: string
  description: string
  category: 'oauth' | 'api' | 'network' | 'permission' | 'system' | 'edge-case'
  service?: 'gmail' | 'slack'
  severity: 'low' | 'medium' | 'high' | 'critical'
  simulate: () => Promise<void> | void
  validate: () => Promise<boolean> | boolean
  expectedBehavior: string
  recoveryExpected: boolean
}

export class ErrorTestSuite {
  private scenarios: ErrorTestScenario[] = []
  private results: Record<string, { passed: boolean; error?: string; duration: number }> = {}

  constructor() {
    this.initializeScenarios()
  }

  private initializeScenarios() {
    // OAuth Error Scenarios
    this.addScenario({
      id: 'oauth_gmail_access_denied',
      name: 'Gmail OAuth Access Denied',
      description: 'User denies Gmail access during OAuth flow',
      category: 'oauth',
      service: 'gmail',
      severity: 'medium',
      simulate: () => {
        // Simulate by redirecting with error parameter
        const params = new URLSearchParams({
          error: 'gmail_oauth_error',
          message: 'Gmail access was denied. Please try connecting again and grant the necessary permissions.',
          code: 'access_denied'
        })
        window.history.pushState({}, '', `${window.location.pathname}?${params}`)
        window.location.reload()
      },
      validate: () => {
        // Check if error toast appears
        return document.querySelector('[data-error-type="oauth"]') !== null
      },
      expectedBehavior: 'Show user-friendly error message with retry option',
      recoveryExpected: true
    })

    this.addScenario({
      id: 'oauth_slack_expired_code',
      name: 'Slack OAuth Expired Code',
      description: 'OAuth authorization code expires before token exchange',
      category: 'oauth',
      service: 'slack',
      severity: 'medium',
      simulate: () => {
        const params = new URLSearchParams({
          error: 'slack_oauth_error',
          message: 'The authorization code has expired. Please try connecting to Slack again.',
          code: 'invalid_grant'
        })
        window.history.pushState({}, '', `${window.location.pathname}?${params}`)
        window.location.reload()
      },
      validate: () => {
        return document.querySelector('[data-error-type="oauth"]') !== null
      },
      expectedBehavior: 'Display expiration message and provide reconnection button',
      recoveryExpected: true
    })

    // API Error Scenarios
    this.addScenario({
      id: 'api_gmail_rate_limit',
      name: 'Gmail API Rate Limit',
      description: 'Gmail API returns 429 Too Many Requests',
      category: 'api',
      service: 'gmail',
      severity: 'high',
      simulate: async () => {
        // Mock fetch to return 429
        const originalFetch = window.fetch
        window.fetch = async (url, options) => {
          if (url.toString().includes('/api/messages/gmail')) {
            return new Response(JSON.stringify({
              error: 'Rate limit exceeded',
              code: 'RATE_LIMIT',
              retryAfter: 60
            }), {
              status: 429,
              headers: { 'Content-Type': 'application/json' }
            })
          }
          return originalFetch(url, options)
        }
      },
      validate: () => {
        // Check if retry mechanism is triggered
        const errorElements = document.querySelectorAll('[data-error-type="api"]')
        return errorElements.length > 0
      },
      expectedBehavior: 'Automatic retry with exponential backoff, show rate limit message',
      recoveryExpected: true
    })

    this.addScenario({
      id: 'api_slack_server_error',
      name: 'Slack API Server Error',
      description: 'Slack API returns 500 Internal Server Error',
      category: 'api',
      service: 'slack',
      severity: 'high',
      simulate: async () => {
        const originalFetch = window.fetch
        window.fetch = async (url, options) => {
          if (url.toString().includes('/api/messages/slack')) {
            return new Response(JSON.stringify({
              error: 'Internal server error',
              code: 'INTERNAL_ERROR'
            }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            })
          }
          return originalFetch(url, options)
        }
      },
      validate: () => {
        return document.querySelector('[data-error-retryable="true"]') !== null
      },
      expectedBehavior: 'Automatic retry with exponential backoff, show server error message',
      recoveryExpected: true
    })

    // Network Error Scenarios
    this.addScenario({
      id: 'network_offline',
      name: 'Network Offline',
      description: 'Device goes offline during API call',
      category: 'network',
      severity: 'critical',
      simulate: () => {
        // Mock navigator.onLine
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: false
        })
        
        // Mock fetch to simulate network error
        const originalFetch = window.fetch
        window.fetch = async () => {
          throw new Error('Network request failed')
        }
      },
      validate: () => {
        return document.querySelector('[data-error-type="network"]') !== null
      },
      expectedBehavior: 'Show offline indicator, queue requests for retry when online',
      recoveryExpected: true
    })

    this.addScenario({
      id: 'network_timeout',
      name: 'Request Timeout',
      description: 'API request times out after 30 seconds',
      category: 'network',
      severity: 'high',
      simulate: async () => {
        const originalFetch = window.fetch
        window.fetch = async (url, options) => {
          if (url.toString().includes('/api/messages')) {
            return new Promise((_, reject) => {
              setTimeout(() => {
                reject(new Error('Request timeout'))
              }, 100) // Simulate quick timeout for testing
            })
          }
          return originalFetch(url, options)
        }
      },
      validate: () => {
        const timeoutElements = document.querySelectorAll('[data-error-code*="timeout"]')
        return timeoutElements.length > 0
      },
      expectedBehavior: 'Show timeout message, automatic retry with longer timeout',
      recoveryExpected: true
    })

    // Permission Error Scenarios
    this.addScenario({
      id: 'permission_gmail_revoked',
      name: 'Gmail Permissions Revoked',
      description: 'User revokes Gmail permissions in Google account',
      category: 'permission',
      service: 'gmail',
      severity: 'high',
      simulate: async () => {
        const originalFetch = window.fetch
        window.fetch = async (url, options) => {
          if (url.toString().includes('/api/messages/gmail')) {
            return new Response(JSON.stringify({
              error: 'Insufficient permissions',
              code: 'INSUFFICIENT_PERMISSIONS'
            }), {
              status: 403,
              headers: { 'Content-Type': 'application/json' }
            })
          }
          return originalFetch(url, options)
        }
      },
      validate: () => {
        return document.querySelector('[data-error-type="permission"]') !== null
      },
      expectedBehavior: 'Show permissions error, provide reauthorization button',
      recoveryExpected: true
    })

    // Edge Case Scenarios
    this.addScenario({
      id: 'edge_case_empty_inbox',
      name: 'Empty Inbox State',
      description: 'User has no messages in connected accounts',
      category: 'edge-case',
      severity: 'low',
      simulate: async () => {
        const originalFetch = window.fetch
        window.fetch = async (url, options) => {
          if (url.toString().includes('/api/messages')) {
            return new Response(JSON.stringify({
              messages: [],
              stats: {
                priority: { urgent: 0, question: 0, normal: 0, total: 0 },
                sources: { gmail: 0, slack: 0 },
                performance: { gmailFetchTime: 100, slackFetchTime: 150, totalFetchTime: 250 }
              },
              connections: { gmail: true, slack: true },
              fetchedAt: new Date().toISOString()
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            })
          }
          return originalFetch(url, options)
        }
      },
      validate: () => {
        const emptyState = document.querySelector('[data-state="empty"]')
        return emptyState !== null && emptyState.textContent?.includes('caught up')
      },
      expectedBehavior: 'Show beautiful empty state with "You\'re all caught up" message',
      recoveryExpected: false
    })

    this.addScenario({
      id: 'edge_case_no_connections',
      name: 'No Connected Accounts',
      description: 'User has not connected any accounts',
      category: 'edge-case',
      severity: 'medium',
      simulate: async () => {
        // Mock connection status
        const originalFetch = window.fetch
        window.fetch = async (url, options) => {
          if (url.toString().includes('/api/messages/unified')) {
            return new Response(JSON.stringify({
              error: 'No accounts connected',
              code: 'NO_CONNECTIONS',
              connections: { gmail: false, slack: false }
            }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            })
          }
          return originalFetch(url, options)
        }
      },
      validate: () => {
        const welcomeState = document.querySelector('[data-state="welcome"]')
        return welcomeState !== null && welcomeState.textContent?.includes('Connect your Gmail and Slack')
      },
      expectedBehavior: 'Show welcome state with connection prompts',
      recoveryExpected: false
    })

    this.addScenario({
      id: 'system_memory_pressure',
      name: 'High Memory Usage',
      description: 'System under memory pressure during operation',
      category: 'system',
      severity: 'medium',
      simulate: () => {
        // Simulate memory pressure by creating large objects
        const memoryPressure: any[] = []
        for (let i = 0; i < 1000; i++) {
          memoryPressure.push(new Array(10000).fill('memory-pressure-test'))
        }
        (window as any).memoryPressureTest = memoryPressure
      },
      validate: () => {
        // Check if UI remains responsive
        const button = document.querySelector('button[data-testid="refresh"]') as HTMLButtonElement
        return button ? !button.disabled : true
      },
      expectedBehavior: 'Maintain UI responsiveness, graceful degradation if needed',
      recoveryExpected: true
    })
  }

  private addScenario(scenario: ErrorTestScenario) {
    this.scenarios.push(scenario)
  }

  // Run a specific test scenario
  async runScenario(scenarioId: string): Promise<boolean> {
    const scenario = this.scenarios.find(s => s.id === scenarioId)
    if (!scenario) {
      throw new Error(`Test scenario '${scenarioId}' not found`)
    }

    const startTime = Date.now()
    
    try {
      console.log(`🧪 Running test: ${scenario.name}`)
      
      // Execute the simulation
      await scenario.simulate()
      
      // Wait for effects to take place
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Validate the expected behavior
      const passed = await scenario.validate()
      const duration = Date.now() - startTime
      
      this.results[scenarioId] = { passed, duration }
      
      console.log(`${passed ? '✅' : '❌'} Test ${scenario.name}: ${passed ? 'PASSED' : 'FAILED'} (${duration}ms)`)
      
      return passed
      
    } catch (error: any) {
      const duration = Date.now() - startTime
      this.results[scenarioId] = { passed: false, error: error.message, duration }
      
      console.error(`❌ Test ${scenario.name}: ERROR - ${error.message} (${duration}ms)`)
      
      return false
    }
  }

  // Run all test scenarios
  async runAllScenarios(): Promise<{ passed: number; failed: number; results: typeof this.results }> {
    console.log(`🚀 Running ${this.scenarios.length} error handling test scenarios...`)
    
    let passed = 0
    let failed = 0
    
    for (const scenario of this.scenarios) {
      const result = await this.runScenario(scenario.id)
      if (result) {
        passed++
      } else {
        failed++
      }
      
      // Reset environment between tests
      await this.resetEnvironment()
      
      // Short delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    console.log(`📊 Test Results: ${passed} passed, ${failed} failed`)
    
    return { passed, failed, results: this.results }
  }

  // Run tests by category
  async runCategory(category: ErrorTestScenario['category']): Promise<void> {
    const categoryScenarios = this.scenarios.filter(s => s.category === category)
    console.log(`🎯 Running ${categoryScenarios.length} ${category} tests...`)
    
    for (const scenario of categoryScenarios) {
      await this.runScenario(scenario.id)
      await this.resetEnvironment()
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  // Reset environment after tests
  private async resetEnvironment(): Promise<void> {
    // Reset fetch
    if ((window as any).originalFetch) {
      window.fetch = (window as any).originalFetch
    }
    
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    })
    
    // Clear URL parameters
    if (typeof window !== 'undefined') {
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)
    }
    
    // Clean up memory pressure test
    if ((window as any).memoryPressureTest) {
      delete (window as any).memoryPressureTest
    }
    
    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc()
    }
  }

  // Get test results summary
  getResults(): typeof this.results {
    return this.results
  }

  // Get scenarios list
  getScenarios(): ErrorTestScenario[] {
    return this.scenarios
  }

  // Generate test report
  generateReport(): string {
    let report = '# Error Handling Test Report\n\n'
    
    const categories = [...new Set(this.scenarios.map(s => s.category))]
    
    for (const category of categories) {
      report += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Tests\n\n`
      
      const categoryScenarios = this.scenarios.filter(s => s.category === category)
      
      for (const scenario of categoryScenarios) {
        const result = this.results[scenario.id]
        const status = result ? (result.passed ? '✅ PASSED' : '❌ FAILED') : '⏳ PENDING'
        const duration = result ? `(${result.duration}ms)` : ''
        
        report += `- **${scenario.name}** - ${status} ${duration}\n`
        report += `  - *${scenario.description}*\n`
        report += `  - Expected: ${scenario.expectedBehavior}\n`
        
        if (result && !result.passed && result.error) {
          report += `  - Error: ${result.error}\n`
        }
        
        report += '\n'
      }
    }
    
    return report
  }
}

// Global test suite instance
export const errorTestSuite = new ErrorTestSuite()

// Developer console utilities
if (typeof window !== 'undefined') {
  (window as any).errorTestSuite = errorTestSuite
  console.log('🧪 Error Test Suite available as window.errorTestSuite')
  console.log('Run: errorTestSuite.runAllScenarios() to test all error scenarios')
  console.log('Run: errorTestSuite.runCategory("oauth") to test specific category')
}