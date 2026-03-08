/**
 * Middleware de Controle de Acesso por Perfil (RBAC)
 * 
 * Verifica se o perfil do usuário autenticado está na lista de
 * perfis permitidos para acessar determinado recurso/rota.
 * Deve ser usado APÓS o authMiddleware.
 * 
 * Exemplo de uso: roleMiddleware(['ADMIN', 'PROFISSIONAL'])
 * Perfis disponíveis: PACIENTE, PROFISSIONAL, ADMIN
 */
const roleMiddleware = (perfisPermitidos) => {
    return (req, res, next) => {
        // Verifica se o usuário foi autenticado (authMiddleware deve ter rodado antes)
        if (!req.usuario) {
            return res.status(401).json({ erro: 'Usuário não autenticado.' });
        }

        // Verifica se o perfil do usuário está entre os perfis permitidos
        if (!perfisPermitidos.includes(req.usuario.perfil)) {
            const perfisNecessarios = perfisPermitidos.join(' ou ');
            return res.status(403).json({
                erro: `Acesso negado. Operação restrita.`,
                motivo: `O seu perfil de acesso atual é '${req.usuario.perfil}'.`,
                solucao: `Esta execução é permitida apenas para o(s) perfil(is): ${perfisNecessarios}. Por favor, faça login com uma credencial apropriada.`
            });
        }

        // Perfil autorizado, segue para o próximo middleware/controller
        return next();
    };
};

module.exports = roleMiddleware;
