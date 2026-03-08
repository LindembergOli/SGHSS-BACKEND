/**
 * Configuração do Logger (Winston)
 * 
 * Sistema de logs estruturados para o backend SGHSS.
 * - Em desenvolvimento: nível 'debug' com saída no console colorida
 * - Em produção: nível 'info' apenas em arquivos
 * 
 * Arquivos de log:
 * - logs/error.log: apenas erros críticos
 * - logs/combined.log: todos os logs (info, warn, error)
 */

const winston = require('winston');

// Cria a instância do logger com configurações padrão
const logger = winston.createLogger({
    // Define o nível mínimo de log baseado no ambiente
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',

    // Formato dos logs: timestamp legível + stack trace de erros + formato JSON
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),

    // Metadados padrão incluídos em todo log
    defaultMeta: { service: 'sghss-backend' },

    // Transportes de saída: arquivos de log persistentes
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

// Em desenvolvimento, adiciona saída no console com cores para facilitar debug
if (process.env.NODE_ENV === 'development') {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        })
    );
}

module.exports = logger;
