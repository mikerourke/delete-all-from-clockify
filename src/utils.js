const { cyan, green, magenta, yellow } = require("chalk");

/**
 * Pause execution for the specified milliseconds. This is used to ensure the
 * rate limits aren't exceeded.
 */
function pause(delay) {
  return new Promise(resolve => setTimeout(resolve, delay));
}

const logger = {
  info(...args) {
    console.log(cyan(...args));
  },
  warn(...args) {
    console.log(yellow(...args));
  },
  error(...args) {
    console.log(magenta(...args));
  },
  success(...args) {
    console.log(green(...args));
  },
};

module.exports = { logger, pause };
