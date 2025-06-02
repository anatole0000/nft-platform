import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }), // để log error stack trace
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'nft-service' },
  transports: [
    new transports.Console(),
    // Bạn có thể add file log nếu muốn
    // new transports.File({ filename: 'error.log', level: 'error' }),
    // new transports.File({ filename: 'combined.log' }),
  ],
});

export default logger;
