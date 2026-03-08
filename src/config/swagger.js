/**
 * Configuração do Swagger / OpenAPI 3.0
 * 
 * Gera a especificação da documentação interativa da API
 * automaticamente a partir dos comentários JSDoc nos arquivos de rotas.
 * A documentação fica disponível em: http://localhost:3000/api/docs
 */

const swaggerJsdoc = require('swagger-jsdoc');

// Opções de configuração do Swagger
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SGHSS - API',
            version: '1.0.0',
            description:
                'API do Sistema de Gestão Hospitalar e de Serviços de Saúde (SGHSS) — VidaPlus',
            contact: {
                name: 'Equipe SGHSS',
            },
        },
        // Servidor padrão para testes
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Servidor de Desenvolvimento',
            },
        ],
        // Esquema de segurança: autenticação via Bearer Token (JWT)
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    // Busca anotações Swagger nos arquivos de rotas de todos os módulos
    apis: ['./src/modules/**/*.routes.js'],
};

// Gera a especificação a partir das opções e anotações
const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
