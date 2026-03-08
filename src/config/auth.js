/**
 * Configuração de Autenticação JWT
 * 
 * Exporta as configurações do JSON Web Token utilizadas
 * no login e na verificação de tokens de autenticação.
 * Os valores são lidos das variáveis de ambiente.
 */

module.exports = {
    // Chave secreta usada para assinar e verificar tokens JWT
    jwtSecret: process.env.JWT_SECRET || 'default-secret',

    // Tempo de expiração do token (ex: '24h', '7d')
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
};
