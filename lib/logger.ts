type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
}

const isProduction = typeof window !== 'undefined'
  ? false
  : process.env.NODE_ENV === 'production'

const sanitize = (obj: unknown): string => {
  if (obj instanceof Error) {
    return obj.message
  }
  if (typeof obj === 'string') {
    return obj
  }
  return '[object]'
}

function shouldLog(): boolean {
  if (typeof window !== 'undefined') {
    return !isProduction
  }
  return process.env.NODE_ENV !== 'production'
}

function formatEntry(level: LogLevel, message: string): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
  }
}

export const logger = {
  debug(message: string): void {
    if (!shouldLog()) return
    const entry = formatEntry('debug', message)
    if (typeof window !== 'undefined') {
      console.debug(entry.message)
    }
  },

  info(message: string): void {
    if (!shouldLog()) return
    const entry = formatEntry('info', message)
    if (typeof window !== 'undefined') {
      console.info(entry.message)
    }
  },

  warn(message: string): void {
    const entry = formatEntry('warn', message)
    if (typeof window !== 'undefined') {
      console.warn(entry.message)
    }
  },

  error(message: string, err?: unknown): void {
    const entry = formatEntry('error', message)
    const sanitized = err ? sanitize(err) : undefined
    if (typeof window !== 'undefined') {
      if (sanitized && !isProduction) {
        console.error(entry.message, sanitized)
      } else {
        console.error(entry.message)
      }
    }
  },
}
