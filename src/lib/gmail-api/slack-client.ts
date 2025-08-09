// Slack Integration Client for Napoleon AI
// Executive-grade Slack webhook integration

interface SlackMessage {
  text: string
  channel?: string
  username?: string
  icon_emoji?: string
  attachments?: SlackAttachment[]
}

interface SlackAttachment {
  color: string
  title: string
  text: string
  fields?: SlackField[]
  footer?: string
  ts?: number
}

interface SlackField {
  title: string
  value: string
  short: boolean
}

interface EmailAlert {
  subject: string
  sender: string
  priority: 'GOLD' | 'SILVER' | 'BRONZE' | 'STANDARD'
  summary: string
  actionRequired: boolean
  threadId: string
}

export class SlackClient {
  private webhookUrl: string

  constructor(webhookUrl?: string) {
    this.webhookUrl = webhookUrl || process.env.SLACK_WEBHOOK_URL || ''
  }

  async sendExecutiveEmailAlert(emailAlert: EmailAlert): Promise<boolean> {
    if (!this.webhookUrl) {
      console.warn('Slack webhook URL not configured')
      return false
    }

    const priorityConfig = {
      GOLD: { color: '#FFD700', emoji: '👑', label: 'EXECUTIVE PRIORITY' },
      SILVER: { color: '#C0C0C0', emoji: '🥈', label: 'HIGH PRIORITY' },
      BRONZE: { color: '#CD7F32', emoji: '🥉', label: 'MEDIUM PRIORITY' },
      STANDARD: { color: '#6366f1', emoji: '📧', label: 'STANDARD' }
    }

    const config = priorityConfig[emailAlert.priority]

    const message: SlackMessage = {
      text: `${config.emoji} *Napoleon AI: Executive Email Alert*`,
      username: 'Napoleon AI',
      icon_emoji: ':crown:',
      attachments: [
        {
          color: config.color,
          title: `${config.label}: ${emailAlert.subject}`,
          text: emailAlert.summary,
          fields: [
            {
              title: 'From',
              value: emailAlert.sender,
              short: true
            },
            {
              title: 'Priority Tier',
              value: `${config.emoji} ${emailAlert.priority}`,
              short: true
            },
            {
              title: 'Action Required',
              value: emailAlert.actionRequired ? '🚨 Yes' : '✅ No',
              short: true
            },
            {
              title: 'Thread ID',
              value: `\`${emailAlert.threadId}\``,
              short: true
            }
          ],
          footer: 'Napoleon AI Executive Intelligence',
          ts: Math.floor(Date.now() / 1000)
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
      console.error('Failed to send Slack notification:', error)
      return false
    }
  }

  async sendSystemAlert(title: string, message: string, severity: 'info' | 'warning' | 'error' = 'info'): Promise<boolean> {
    const severityConfig = {
      info: { color: '#6366f1', emoji: 'ℹ️' },
      warning: { color: '#f59e0b', emoji: '⚠️' },
      error: { color: '#ef4444', emoji: '🚨' }
    }

    const config = severityConfig[severity]

    const slackMessage: SlackMessage = {
      text: `${config.emoji} *Napoleon AI System Alert*`,
      username: 'Napoleon AI System',
      icon_emoji: ':robot_face:',
      attachments: [
        {
          color: config.color,
          title: title,
          text: message,
          footer: 'Napoleon AI System Monitor',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackMessage),
      })

      return response.ok
    } catch (error) {
      console.error('Failed to send Slack system alert:', error)
      return false
    }
  }

  async testConnection(): Promise<boolean> {
    return this.sendSystemAlert(
      'Connection Test',
      'Napoleon AI Slack integration is working correctly! 🎉',
      'info'
    )
  }
}

// Singleton instance
export const slackClient = new SlackClient()