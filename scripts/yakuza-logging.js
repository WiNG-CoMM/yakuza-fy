/**
 * Yakuza-fy Logging Module
 * Handles all logging functionality with different verbosity levels
 */

// Set to true to enable debug logging, false for production
export const DEBUG_MODE = false;
// Override level with INFO for debug and avoid having to set the browser to verbose logs
export const OVERRIDE_INFO = false;

/**
 * Log levels
 * @enum {number}
 */
export const LOG_LEVEL = {
  NONE: 0,   // No logging
  ERROR: 1,  // Only errors
  WARN: 2,   // Errors and warnings
  INFO: 3,   // Normal information
  DEBUG: 4,  // Detailed debug information
  ALL: 5     // Everything including verbose details
};

// Current log level - determined by DEBUG_MODE
const currentLogLevel = DEBUG_MODE ? LOG_LEVEL.ALL : LOG_LEVEL.INFO;

// Helper function to get level name
function getLevelName(level) {
  switch (level) {
    case LOG_LEVEL.ERROR: return "ERROR";
    case LOG_LEVEL.WARN:  return "WARN";
    case LOG_LEVEL.INFO:  return "INFO";
    case LOG_LEVEL.DEBUG: return "DEBUG";
    case LOG_LEVEL.ALL:   return "TRACE";
    default:              return `UNKNOWN(${level})`;
  }
}

// Log module initialization
Hooks.once('init', () => {
  logDebug(`Logger initialized with DEBUG_MODE=${DEBUG_MODE}, logLevel=${currentLogLevel} (${getLevelName(currentLogLevel)})`);
});
/**
 * Log a message if the current log level allows it
 * @param {LOG_LEVEL} level - The log level of this message
 * @param {string} message - The message to log
 * @param {...any} args - Additional arguments to log
 */
export function log(level, message, ...args) {
  if (level <= currentLogLevel) {
    const levelName = getLevelName(level);
    const prefix = `Yakuza-fy | [${levelName}] | `;
    
    switch (level) {
      case LOG_LEVEL.ERROR:
        console.error(prefix + message, ...args);
        break;
      case LOG_LEVEL.WARN:
        console.warn(prefix + message, ...args);
        break;
      case LOG_LEVEL.DEBUG:
        if (OVERRIDE_INFO && DEBUG_MODE) {
          console.info(prefix + message, ...args);
        } else {
          console.debug(prefix + message, ...args);
        }
        break;
      case LOG_LEVEL.ALL:
        if (OVERRIDE_INFO && DEBUG_MODE) {
          console.info(prefix + message, ...args);
        } else {
          console.trace(prefix + message, ...args);
        }
        break;
      case LOG_LEVEL.INFO:
      default:
        console.log(prefix + message, ...args);
        break;
    }
  }
}

/**
 * Convenience method for error logs
 * @param {string} message - The message to log
 * @param {...any} args - Additional arguments to log
 */
export function logError(message, ...args) {
  log(LOG_LEVEL.ERROR, message, ...args);
}

/**
 * Convenience method for warning logs
 * @param {string} message - The message to log
 * @param {...any} args - Additional arguments to log
 */
export function logWarning(message, ...args) {
  log(LOG_LEVEL.WARN, message, ...args);
}

/**
 * Convenience method for info logs
 * @param {string} message - The message to log
 * @param {...any} args - Additional arguments to log
 */
export function logInfo(message, ...args) {
  log(LOG_LEVEL.INFO, message, ...args);
}

/**
 * Convenience method for debug logs
 * @param {string} message - The message to log
 * @param {...any} args - Additional arguments to log
 */
export function logDebug(message, ...args) {
  log(LOG_LEVEL.DEBUG, message, ...args);
}
