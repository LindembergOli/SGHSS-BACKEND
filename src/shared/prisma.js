/**
 * Configuração do Prisma Client com adaptador PostgreSQL
 * 
 * Utiliza o driver adapter @prisma/adapter-pg exigido pelo Prisma v7
 * para estabelecer a conexão com o banco de dados PostgreSQL.
 * A URL de conexão é lida da variável de ambiente DATABASE_URL.
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Obtém a string de conexão das variáveis de ambiente
const connectionString = process.env.DATABASE_URL;

// Cria um pool de conexões PostgreSQL para reutilização eficiente
const pool = new Pool({ connectionString });

// Cria o adaptador do Prisma para PostgreSQL usando o pool
const adapter = new PrismaPg(pool);

// Instancia o Prisma Client com o adaptador e configuração de logs
// Em desenvolvimento: exibe erros e avisos | Em produção: apenas erros
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

module.exports = prisma;
