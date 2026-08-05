type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private format(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(meta ? { metadata: meta } : {}),
    };
  }

  info(message: string, meta?: any) {
    console.info(JSON.stringify(this.format("info", message, meta)));
  }

  warn(message: string, meta?: any) {
    console.warn(JSON.stringify(this.format("warn", message, meta)));
  }

  error(message: string, error?: any, meta?: any) {
    const errorDetails = error instanceof Error 
      ? { name: error.name, message: error.message, stack: error.stack } 
      : error;
    console.error(
      JSON.stringify(
        this.format("error", message, {
          ...(errorDetails ? { error: errorDetails } : {}),
          ...meta,
        })
      )
    );
  }

  debug(message: string, meta?: any) {
    console.debug(JSON.stringify(this.format("debug", message, meta)));
  }
}

export const logger = new Logger();
