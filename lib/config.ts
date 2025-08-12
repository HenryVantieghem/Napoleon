import { z } from 'zod'

// Environment variable validation schema
const envSchema = z.object({
  // Database Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),

  // Nango Configuration
  NANGO_SERVER_URL: z.string().url('Invalid Nango server URL').default('https://api.nango.dev'),
  NANGO_SECRET_KEY: z.string().min(1, 'Nango secret key is required'),
  NANGO_PUBLIC_KEY: z.string().min(1, 'Nango public key is required'),

  // Application Configuration
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL').default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Optional Performance Monitoring
  ENABLE_PERFORMANCE_MONITORING: z.string().transform(val => val === 'true').optional(),
  PERFORMANCE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Optional Cache Configuration
  CACHE_TTL_SECONDS: z.string().transform(val => parseInt(val, 10)).default('300'),
  CACHE_MAX_ENTRIES: z.string().transform(val => parseInt(val, 10)).default('1000'),
})

// Validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join('\n')
      
      throw new Error(`Environment validation failed:\n${errorMessages}`)
    }
    throw error
  }
}

// Export validated configuration
export const config = validateEnv()

// Export individual configuration objects for convenience
export const supabase = {
  url: config.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: config.SUPABASE_SERVICE_ROLE_KEY,
} as const

export const nango = {
  serverUrl: config.NANGO_SERVER_URL,
  secretKey: config.NANGO_SECRET_KEY,
  publicKey: config.NANGO_PUBLIC_KEY,
} as const

export const app = {
  url: config.NEXT_PUBLIC_APP_URL,
  env: config.NODE_ENV,
  isDevelopment: config.NODE_ENV === 'development',
  isProduction: config.NODE_ENV === 'production',
} as const

export const performance = {
  monitoring: config.ENABLE_PERFORMANCE_MONITORING ?? false,
  logLevel: config.PERFORMANCE_LOG_LEVEL,
} as const

export const cache = {
  ttlSeconds: config.CACHE_TTL_SECONDS,
  maxEntries: config.CACHE_MAX_ENTRIES,
} as const

// Type exports
export type Config = typeof config
export type SupabaseConfig = typeof supabase
export type NangoConfig = typeof nango
export type AppConfig = typeof app
export type PerformanceConfig = typeof performance
export type CacheConfig = typeof cache