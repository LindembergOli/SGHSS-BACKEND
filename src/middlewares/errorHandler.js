const logger = require('../shared/utils/logger');

/**
 * Middleware Global de Tratamento de Erros
 * 
 * Captura todos os erros não tratados nas rotas/controllers e retorna
 * uma resposta HTTP padronizada com o código de status adequado.
 * Também registra os erros no sistema de logs para análise posterior.
 * 
 * Tipos de erros tratados:
 * - P2002: Registro duplicado no banco (Prisma)
 * - P2025: Registro não encontrado no banco (Prisma)
 * - Erros de validação do express-validator
 * - Erros de negócio com statusCode personalizado
 * - Erros inesperados (500)
 */
const errorHandler = (err, req, res, next) => {
    // Registra o erro completo nos logs (com stack trace para debug)
    logger.error('Erro não tratado:', {
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        usuarioId: req.usuario?.id || null,
    });

    // Erro do Prisma: violação de constraint UNIQUE (registro duplicado)
    if (err.code === 'P2002') {
        return res.status(409).json({
            erro: 'Registro duplicado. Um registro com esses dados já existe.',
            campo: err.meta?.target,
        });
    }

    // Erro do Prisma: registro não encontrado para update/delete
    if (err.code === 'P2025') {
        return res.status(404).json({
            erro: 'Registro não encontrado.',
        });
    }

    // Erro de validação do express-validator
    if (err.type === 'validation') {
        return res.status(400).json({
            erro: 'Dados inválidos.',
            detalhes: err.errors,
        });
    }

    // Erro genérico: usa statusCode customizado ou 500 como padrão
    const statusCode = err.statusCode || 500;
    // Em erros 500, não expõe a mensagem interna ao cliente por segurança
    const message = statusCode === 500 ? 'Erro interno do servidor.' : err.message;

    return res.status(statusCode).json({ erro: message });
};

module.exports = errorHandler;
