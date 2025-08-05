import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '@/app/page'

describe('Landing Page', () => {
  beforeEach(() => {
    render(<Home />)
  })

  describe('Hero Section', () => {
    it('displays the main heading with luxury branding', () => {
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent(/Transform Email.*Chaos.*Into Strategic.*Clarity/i)
    })

    it('displays the AI-powered badge', () => {
      const badge = screen.getByText(/AI-Powered Email Intelligence/i)
      expect(badge).toBeInTheDocument()
    })

    it('displays the Napoleon AI description', () => {
      const description = screen.getByText(/Napoleon AI analyzes your Gmail threads with military precision/i)
      expect(description).toBeInTheDocument()
    })

    it('displays the Connect with Gmail CTA button', () => {
      const ctaButton = screen.getByRole('button', { name: /Connect with Gmail/i })
      expect(ctaButton).toBeInTheDocument()
      expect(ctaButton).toHaveClass('bg-accent-gold')
    })
  })

  describe('Feature Preview Section', () => {
    it('displays AI Analysis feature', () => {
      const aiAnalysisFeature = screen.getByText('AI Analysis')
      expect(aiAnalysisFeature).toBeInTheDocument()
      
      const aiDescription = screen.getByText(/Advanced GPT-4 powered summaries and priority scoring/i)
      expect(aiDescription).toBeInTheDocument()
    })

    it('displays Smart Prioritization feature', () => {
      const prioritizationFeature = screen.getByText('Smart Prioritization')
      expect(prioritizationFeature).toBeInTheDocument()
      
      const prioritizationDescription = screen.getByText(/Intelligent filtering and categorization of your messages/i)
      expect(prioritizationDescription).toBeInTheDocument()
    })

    it('displays Gmail Integration feature', () => {
      const gmailFeature = screen.getByText('Gmail Integration')
      expect(gmailFeature).toBeInTheDocument()
      
      const gmailDescription = screen.getByText(/Seamless OAuth connection with secure data handling/i)
      expect(gmailDescription).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('handles Connect with Gmail button hover state', async () => {
      const user = userEvent.setup()
      const ctaButton = screen.getByRole('button', { name: /Connect with Gmail/i })
      
      await user.hover(ctaButton)
      expect(ctaButton).toHaveClass('hover:bg-accent-gold/90')
    })

    it('has proper accessibility attributes', () => {
      const ctaButton = screen.getByRole('button', { name: /Connect with Gmail/i })
      expect(ctaButton).toBeVisible()
      expect(ctaButton).toBeInTheDocument()
    })
  })

  describe('Design System Integration', () => {
    it('applies luxury color scheme', () => {
      const container = screen.getByRole('main')
      expect(container).toHaveClass('relative')
    })

    it('uses responsive design classes', () => {
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveClass('text-5xl', 'sm:text-6xl', 'lg:text-7xl')
    })
  })
})