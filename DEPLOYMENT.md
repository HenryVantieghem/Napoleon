# Napoleon AI - Deployment Guide

## 🚀 Production Deployment

Napoleon AI is designed for seamless deployment to Vercel with optimal performance and security.

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Clerk Project**: Set up at [clerk.com](https://clerk.com)
3. **OpenAI API Key**: Optional, get from [platform.openai.com](https://platform.openai.com)
4. **Domain**: Premium domain like `napoleonai.com` (recommended)

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/napoleon-ai)

### Manual Deployment

#### 1. Environment Setup

Copy the environment template:
```bash
cp .env.example .env.local
```

Configure your environment variables:
```env
# Required for authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Required for AI priority scoring
OPENAI_API_KEY=sk-your-openai-key
```

#### 2. Install Vercel CLI

```bash
npm install -g vercel
```

#### 3. Deploy Using Script

```bash
./scripts/deploy.sh
```

Or deploy manually:
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### Configuration Checklist

#### Vercel Dashboard Settings

1. **Environment Variables**:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `OPENAI_API_KEY`

2. **Domain Configuration**:
   - Add custom domain (e.g., `napoleonai.com`)
   - Configure DNS records
   - Enable SSL (automatic with Vercel)

3. **Security Headers**:
   - Configured automatically via `vercel.json`
   - CSP, HSTS, and security best practices

#### Clerk Configuration

1. **OAuth Providers**:
   - In the Clerk dashboard, configure your production domain and social connection redirect URIs.

2. **Google OAuth Setup**:
   - Enable Google provider in Clerk Social Connections.
   - Configure Gmail readonly scope
   - Add authorized redirect URIs in Google Console

### Monitoring & Analytics

#### Health Check Endpoint

Monitor application health:
```
GET https://napoleonai.com/api/health
```

Response example:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00Z",
  "features": {
    "supabase": true,
    "openai": true,
    "analytics": false
  },
  "checks": {
    "envVars": "pass"
  }
}
```

#### Recommended Monitoring

1. **Uptime Monitoring**:
   - Pingdom, UptimeRobot, or StatusCake
   - Monitor `/api/health` endpoint

2. **Error Tracking**:
   - Sentry for error monitoring
   - Vercel Analytics for performance

3. **User Analytics**:
   - Google Analytics or Mixpanel
   - User flow and conversion tracking

### Performance Optimization

#### Vercel Optimizations

1. **Edge Functions**: Enabled automatically
2. **Image Optimization**: Next.js built-in
3. **CDN**: Global edge network
4. **Caching**: Optimized cache headers

#### Application Optimizations

1. **Gmail API Caching**: 5-minute cache
2. **AI Analysis Caching**: 10-minute cache
3. **Component Lazy Loading**: Implemented
4. **Bundle Optimization**: Tree shaking enabled

### Security Best Practices

#### Headers (Configured)

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

#### OAuth Security

- PKCE flow implementation
- Secure token storage
- Automatic token refresh
- Scope validation

### Troubleshooting

#### Common Issues

1. **Build Failures**:
   ```bash
   # Clear cache and rebuild
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **Environment Variables**:
   - Verify all required vars are set
   - Check Vercel dashboard configuration
   - Ensure no trailing spaces or quotes

3. **OAuth Issues**:
   - Verify redirect URLs in Supabase
   - Check Google OAuth configuration
   - Confirm site URL matches deployment

4. **API Errors**:
   - Monitor health endpoint
   - Check Vercel function logs
   - Verify third-party API keys

#### Support Commands

```bash
# Check deployment status
vercel ls

# View logs
vercel logs napoleon-ai

# Check environment
vercel env ls

# Run health check
curl https://napoleonai.com/api/health
```

### Post-Deployment Tasks

1. **Domain Setup**:
   - Configure custom domain
   - Update OAuth redirect URLs
   - Test all authentication flows

2. **Monitoring Setup**:
   - Configure uptime monitoring
   - Set up error tracking
   - Enable analytics

3. **Performance Testing**:
   - Load testing with realistic data
   - Mobile responsiveness verification
   - Cross-browser compatibility

4. **User Testing**:
   - Executive user feedback
   - A/B testing setup
   - Conversion optimization

### Scaling Considerations

#### Current Architecture

- **Serverless**: Vercel Functions
- **Database**: Supabase (PostgreSQL)
- **Caching**: In-memory + Redis (future)
- **AI**: OpenAI API with rate limiting

#### Future Scaling

- **Database**: Read replicas for scaling reads
- **Caching**: Redis for shared cache
- **CDN**: Image and asset optimization
- **Monitoring**: Advanced APM tools

---

## 🎖️ Napoleon AI is Ready for Battle!

Your executive email intelligence platform is now deployed and ready to transform communication chaos into strategic clarity.

**Next Steps**:
1. 🔗 Configure your custom domain
2. 📊 Set up monitoring and analytics  
3. 👥 Begin executive user testing
4. 📈 Monitor performance and iterate

**Support**: For deployment issues, check the troubleshooting section or create an issue in the repository.