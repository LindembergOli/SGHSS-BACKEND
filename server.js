/**
 * Ponto de Entrada do Servidor SGHSS
 * 
 * Carrega as variáveis de ambiente do .env, importa a aplicação
 * Express configurada e inicia o servidor HTTP na porta definida.
 */

// Carrega variáveis de ambiente do arquivo .env para process.env
require('dotenv').config();

const app = require('./src/app');
const logger = require('./src/shared/utils/logger');

// Define a porta do servidor (padrão: 3000)
const PORT = process.env.PORT || 3000;

// Inicia o servidor HTTP e exibe as URLs de acesso
app.listen(PORT, () => {
    logger.info(`🏥 SGHSS Backend rodando na porta ${PORT}`);
    logger.info(`📄 Documentação: http://localhost:${PORT}/api/docs`);
    logger.info(`❤️  Health check: http://localhost:${PORT}/api/health`);
});
