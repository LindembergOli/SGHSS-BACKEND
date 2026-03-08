-- CreateEnum
CREATE TYPE "StatusInternacao" AS ENUM ('ATIVA', 'ALTA_MEDICA', 'TRANSFERIDA', 'OBITO');

-- CreateTable
CREATE TABLE "internacoes" (
    "id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "leito_id" TEXT NOT NULL,
    "profissional_id" TEXT NOT NULL,
    "data_entrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_saida" TIMESTAMP(3),
    "motivo" TEXT NOT NULL,
    "diagnostico" TEXT,
    "observacoes" TEXT,
    "status" "StatusInternacao" NOT NULL DEFAULT 'ATIVA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "internacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suprimentos" (
    "id" TEXT NOT NULL,
    "unidade_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "unidade_medida" TEXT NOT NULL,
    "estoque_minimo" INTEGER NOT NULL DEFAULT 10,
    "lote" TEXT,
    "validade" TIMESTAMP(3),
    "fornecedor" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suprimentos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "internacoes" ADD CONSTRAINT "internacoes_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internacoes" ADD CONSTRAINT "internacoes_leito_id_fkey" FOREIGN KEY ("leito_id") REFERENCES "leitos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internacoes" ADD CONSTRAINT "internacoes_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suprimentos" ADD CONSTRAINT "suprimentos_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades_hospitalares"("id") ON DELETE CASCADE ON UPDATE CASCADE;
