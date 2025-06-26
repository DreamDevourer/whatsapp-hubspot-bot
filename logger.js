const iso = () => new Date().toISOString();

function info(...args) {
  console.info(iso(), "[INFO]", ...args);
}

function warn(...args) {
  console.warn(iso(), "[WARN]", ...args);
}

function error(...args) {
  console.error(iso(), "[ERROR]", ...args);
}

function debug(...args) {
  console.debug(iso(), "[DEBUG]", ...args);
}

module.exports = { info, warn, error, debug };
