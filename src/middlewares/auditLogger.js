const prisma = require('../shared/prisma');
const logger = require('../shared/utils/logger');

/**
 * Middleware de Auditoria (Conformidade LGPD)
 * 
 * Registra automaticamente no banco de dados (tabela AuditLog) todas as
 * ações realizadas pelos usuários no sistema. Isso garante rastreabilidade
 * e conformidade com a Lei Geral de Proteção de Dados (LGPD).
 * 
 * Informações registradas: usuário, ação, entidade, IP, método HTTP e URL.
 * Só registra quando a operação é bem-sucedida (status 2xx).
 * 
 * Exemplo de uso nas rotas: auditLogger('CREATE', 'Paciente')
 * 
 * @param {string} acao - Tipo da ação (CREATE, UPDATE, DELETE, LOGIN, etc.)
 * @param {string} entidade - Nome da entidade afetada (Paciente, Consulta, etc.)
 */
const auditLogger = (acao, entidade) => {
    return async (req, res, next) => {
        // Salva a função original res.json para interceptar a resposta
        const originalJson = res.json.bind(res);

        // Sobrescreve res.json para capturar o momento da resposta
        res.json = async (data) => {
            try {
                // Só registra auditoria se a operação foi bem sucedida (código 2xx)
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    // Cria o registro de auditoria no banco de dados
                    await prisma.auditLog.create({
                        data: {
                            usuarioId: req.usuario?.id || null,
                            acao,
                            entidade,
                            entidadeId: data?.id || req.params?.id || null,
                            detalhes: {
                                method: req.method,
                                url: req.originalUrl,
                                statusCode: res.statusCode,
                            },
                            ip: req.ip,
                        },
                    });

                    // Registra no log do sistema também
                    logger.info(`Audit: ${acao} em ${entidade}`, {
                        usuarioId: req.usuario?.id,
                        entidadeId: data?.id || req.params?.id,
                    });
                }
            } catch (err) {
                // Se falhar ao registrar a auditoria, apenas loga o erro
                // (não impede a resposta ao cliente)
                logger.error('Erro ao registrar auditoria:', { message: err.message });
            }

            // Envia a resposta original ao cliente
            return originalJson(data);
        };

        // Continua para o próximo middleware/controller
        next();
    };
};

module.exports = auditLogger;
