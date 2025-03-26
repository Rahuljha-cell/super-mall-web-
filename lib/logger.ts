// Logging utility for the application
// This provides consistent logging across the application

type LogLevel = "info" | "warn" | "error" | "debug"

interface LogOptions {
  module?: string
  userId?: string
  data?: Record<string, any>
}

class Logger {
  private static instance: Logger

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private formatMessage(level: LogLevel, message: string, options?: LogOptions): string {
    const timestamp = new Date().toISOString()
    const module = options?.module ? `[${options.module}]` : ""
    const userId = options?.userId ? `[User: ${options.userId}]` : ""

    return `${timestamp} ${level.toUpperCase()} ${module} ${userId} ${message}`
  }

  private log(level: LogLevel, message: string, options?: LogOptions): void {
    const formattedMessage = this.formatMessage(level, message, options)

    // Log to console in development
    if (process.env.NODE_ENV !== "production") {
      switch (level) {
        case "info":
          console.info(formattedMessage, options?.data || "")
          break
        case "warn":
          console.warn(formattedMessage, options?.data || "")
          break
        case "error":
          console.error(formattedMessage, options?.data || "")
          break
        case "debug":
          console.debug(formattedMessage, options?.data || "")
          break
      }
    }

    // In production, we could send logs to a service like Firebase Analytics
    // or a dedicated logging service
    if (process.env.NODE_ENV === "production") {
      // TODO: Implement production logging
      // This could send logs to Firebase Analytics, Sentry, etc.
    }
  }

  public info(message: string, options?: LogOptions): void {
    this.log("info", message, options)
  }

  public warn(message: string, options?: LogOptions): void {
    this.log("warn", message, options)
  }

  public error(message: string, options?: LogOptions): void {
    this.log("error", message, options)
  }

  public debug(message: string, options?: LogOptions): void {
    this.log("debug", message, options)
  }
}

// Export a singleton instance
export const logger = Logger.getInstance()

