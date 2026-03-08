/**
 * Configuração Principal da Aplicação Express
 * 
 * Este arquivo configura e exporta a aplicação Express com:
 * - Middlewares de segurança (Helmet, CORS)
 * - Parser de JSON e URL-encoded
 * - Documentação Swagger interativa
 * - Registro de todas as rotas dos módulos
 * - Tratamento global de erros
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./shared/utils/logger');

// Importação das rotas de cada módulo de negócio
const authRoutes = require('./modules/auth/auth.routes');
const pacienteRoutes = require('./modules/pacientes/paciente.routes');
const profissionalRoutes = require('./modules/profissionais/profissional.routes');
const consultaRoutes = require('./modules/consultas/consulta.routes');
const prontuarioRoutes = require('./modules/prontuarios/prontuario.routes');
const exameRoutes = require('./modules/exames/exame.routes');
const prescricaoRoutes = require('./modules/prescricoes/prescricao.routes');
const unidadeRoutes = require('./modules/unidades/unidade.routes');
const leitoRoutes = require('./modules/leitos/leito.routes');
const internacaoRoutes = require('./modules/internacoes/internacao.routes');
const suprimentoRoutes = require('./modules/suprimentos/suprimento.routes');

// Cria a instância da aplicação Express
const app = express();

// ===================================
// Middlewares Globais de Segurança
// ===================================
app.use(helmet());                          // Protege cabeçalhos HTTP contra ataques comuns
app.use(cors());                            // Habilita requisições de diferentes origens (CORS)
app.use(express.json());                    // Faz o parse de requisições com corpo JSON
app.use(express.urlencoded({ extended: true })); // Faz o parse de dados de formulários

// Log de cada requisição no console (apenas em ambiente de desenvolvimento)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        logger.debug(`${req.method} ${req.originalUrl}`);
        next();
    });
}

// ===================================
// Documentação Interativa da API (Swagger UI)
// Acessível em: http://localhost:3000/api/docs
// ===================================
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'SGHSS - Documentação da API',
}));

// ===================================
// Registro das Rotas da API
// Cada módulo é montado sob seu prefixo correspondente
// ===================================
app.use('/api/auth', authRoutes);               // Autenticação (login, registro, perfil)
app.use('/api/pacientes', pacienteRoutes);       // CRUD de pacientes
app.use('/api/profissionais', profissionalRoutes); // CRUD de profissionais + agendas
app.use('/api/consultas', consultaRoutes);       // Agendamento e gerenciamento de consultas
app.use('/api/prontuarios', prontuarioRoutes);   // Prontuários médicos (histórico clínico)
app.use('/api/exames', exameRoutes);             // Solicitação e resultados de exames
app.use('/api/prescricoes', prescricaoRoutes);   // Prescrições médicas (receitas digitais)
app.use('/api/unidades', unidadeRoutes);           // Unidades hospitalares (CRUD + dashboard)
app.use('/api/leitos', leitoRoutes);               // Leitos hospitalares (UTI, enfermaria, etc.)
app.use('/api/internacoes', internacaoRoutes);     // Internações (admissão e alta hospitalar)
app.use('/api/suprimentos', suprimentoRoutes);     // Suprimentos (estoque hospitalar)

// Rota de verificação de saúde da API (health check)
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        mensagem: 'SGHSS API está funcionando.',
        timestamp: new Date().toISOString(),
    });
});

// Rota padrão para endpoints não encontrados (404)
app.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada.' });
});

// ===================================
// Middleware de Tratamento de Erros (deve ser o último middleware registrado)
// ===================================
app.use(errorHandler);

module.exports = app;
