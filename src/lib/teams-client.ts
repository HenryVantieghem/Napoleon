// Microsoft Teams Integration Client for Napoleon AI
// Executive-grade Teams webhook integration

interface TeamsMessage {
  '@type': string
  '@context': string
  summary: string
  themeColor: string
  sections: TeamsSection[]
}

interface TeamsSection {
  activityTitle: string
  activitySubtitle?: string
  activityImage?: string
  facts?: TeamsFact[]
  text?: string
  potentialAction?: TeamsAction[]
}

interface TeamsFact {
  name: string
  value: string
}

interface TeamsAction {
  '@type': string
  name: string
  targets: { os: string; uri: string }[]
}

interface EmailAlert {
  subject: string
  sender: string
  priority: 'GOLD' | 'SILVER' | 'BRONZE' | 'STANDARD'
  summary: string
  actionRequired: boolean
  threadId: string
  dashboardUrl?: string
}

export class TeamsClient {
  private webhookUrl: string

  constructor(webhookUrl?: string) {
    this.webhookUrl = webhookUrl || process.env.TEAMS_WEBHOOK_URL || ''
  }

  async sendExecutiveEmailAlert(emailAlert: EmailAlert): Promise<boolean> {
    if (!this.webhookUrl) {
      console.warn('Teams webhook URL not configured')
      return false
    }

    const priorityConfig = {
      GOLD: { color: '#FFD700', icon: '👑', label: 'EXECUTIVE PRIORITY' },
      SILVER: { color: '#C0C0C0', icon: '🥈', label: 'HIGH PRIORITY' },
      BRONZE: { color: '#CD7F32', icon: '🥉', label: 'MEDIUM PRIORITY' },
      STANDARD: { color: '#6366f1', icon: '📧', label: 'STANDARD' }
    }

    const config = priorityConfig[emailAlert.priority]

    const message: TeamsMessage = {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      summary: `Napoleon AI: ${config.label} Email Alert`,
      themeColor: config.color.replace('#', ''),
      sections: [
        {
          activityTitle: `${config.icon} Napoleon AI Executive Alert`,
          activitySubtitle: `${config.label}: New executive communication requires attention`,
          activityImage: 'https://napoleonai.app/logo-teams.png',
          facts: [
            {
              name: 'Subject',
              value: emailAlert.subject
            },
            {
              name: 'From',
              value: emailAlert.sender
            },
            {
              name: 'Priority Tier',
              value: `${config.icon} ${emailAlert.priority}`
            },
            {
              name: 'Action Required',
              value: emailAlert.actionRequired ? '🚨 Yes' : '✅ No'
            },
            {
              name: 'AI Summary',
              value: emailAlert.summary
            }
          ],
          text: `**Thread ID:** \`${emailAlert.threadId}\``,
          potentialAction: emailAlert.dashboardUrl ? [
            {
              '@type': 'OpenUri',
              name: 'Open in Napoleon AI Dashboard',
              targets: [
                {
                  os: 'default',
                  uri: emailAlert.dashboardUrl
                }
              ]
            }
          ] : undefined
        }
      ]
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      })

      return response.ok
    } catch (error) {
      console.error('Failed to send Teams notification:', error)
      return false
    }
  }

  async sendSystemAlert(title: string, messageText: string, severity: 'info' | 'warning' | 'error' = 'info'): Promise<boolean> {
    const severityConfig = {
      info: { color: '#6366f1', icon: 'ℹ️' },
      warning: { color: '#f59e0b', icon: '⚠️' },
      error: { color: '#ef4444', icon: '🚨' }
    }

    const config = severityConfig[severity]

    const message: TeamsMessage = {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      summary: `Napoleon AI System: ${title}`,
      themeColor: config.color.replace('#', ''),
      sections: [
        {
          activityTitle: `${config.icon} Napoleon AI System Alert`,
          activitySubtitle: title,
          text: messageText,
          facts: [
            {
              name: 'Timestamp',
              value: new Date().toISOString()
            },
            {
              name: 'Severity',
              value: severity.toUpperCase()
            }
          ]
        }
      ]
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      })

      return response.ok
    } catch (error) {
      console.error('Failed to send Teams system alert:', error)
      return false
    }
  }

  async testConnection(): Promise<boolean> {
    return this.sendSystemAlert(
      'Connection Test',
      'Napoleon AI Microsoft Teams integration is working correctly! 🎉 Your executive communications are now connected.',
      'info'
    )
  }
}

// Singleton instance
export const teamsClient = new TeamsClient()