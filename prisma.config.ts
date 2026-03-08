import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Configuração global do Prisma (Requerido no Prisma v7)
 * Define a localização do schema, diretório de migrações e a URL do banco.
 */
export default defineConfig({
    schema: "prisma/schema.prisma", // Caminho para o schema
    migrations: {
        path: "prisma/migrations",  // Diretório onde as migrações SQL são salvas
    },
    datasource: {
        url: process.env.DATABASE_URL, // String de conexão com banco de dados a partir do .env
    },
});
