const path = require('path');
const fs = require('fs');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

const logsDir = path.resolve(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const myFormat = printf((info) => {
  const timestamp = info.timestamp.slice(0, 19).replace('T', ' ');
  return `${timestamp} [${info.level}]: ${info.message}`;
});

const logger = createLogger({
  format: combine(
    timestamp(),
    myFormat
  ),
  maxsize: 5242880,
  maxFiles: 5,
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        myFormat
      ),
    }),
    new transports.File({ filename: path.join(logsDir, 'logfile.log') }),
  ],
});

logger.stream = {
  write(message) {
    logger.info(message.substring(0, message.lastIndexOf('\n')));
  },
};

module.exports = logger;
