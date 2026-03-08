/**
 * Service do módulo de Exames
 * 
 * Contém a lógica de negócio para solicitação, listagem
 * e registro de resultados de exames médicos.
 * Cada exame está vinculado a uma consulta realizada.
 */

const prisma = require('../../shared/prisma');
const logger = require('../../shared/utils/logger');

class ExameService {
    /**
     * Solicita um novo exame vinculado a uma consulta
     * Verifica se a consulta existe antes de criar o exame
     */
    async solicitar({ consultaId, tipo }) {
        // Verifica se a consulta existe no sistema
        const consulta = await prisma.consulta.findUnique({ where: { id: consultaId } });
        if (!consulta) { const e = new Error('Consulta não encontrada.'); e.statusCode = 404; throw e; }

        // Cria o exame com status inicial SOLICITADO
        const exame = await prisma.exame.create({ data: { consultaId, tipo } });
        logger.info('Exame solicitado', { id: exame.id });
        return exame;
    }

    /**
     * Lista exames com paginação e filtros opcionais
     * Permite filtrar por consulta e status do exame
     */
    async listar({ pagina = 1, limite = 10, consultaId, status }) {
        // Monta os filtros dinâmicos
        const where = {};
        if (consultaId) where.consultaId = consultaId;
        if (status) where.status = status;

        const skip = (pagina - 1) * limite;

        // Executa consulta e contagem em paralelo
        const [exames, total] = await Promise.all([
            prisma.exame.findMany({
                where, skip, take: limite, orderBy: { dataSolicitacao: 'desc' },
                include: { consulta: { select: { paciente: { select: { nome: true } }, profissional: { select: { nome: true } } } } },
            }),
            prisma.exame.count({ where }),
        ]);
        return { dados: exames, paginacao: { total, pagina, limite, totalPaginas: Math.ceil(total / limite) } };
    }

    /**
     * Busca um exame por ID com dados da consulta, paciente e profissional
     */
    async buscarPorId(id) {
        const exame = await prisma.exame.findUnique({
            where: { id },
            include: { consulta: { include: { paciente: { select: { nome: true, cpf: true } }, profissional: { select: { nome: true } } } } },
        });
        if (!exame) { const e = new Error('Exame não encontrado.'); e.statusCode = 404; throw e; }
        return exame;
    }

    /**
     * Registra o resultado de um exame e atualiza seu status
     * Muda o status para RESULTADO_DISPONIVEL e registra a data do resultado
     */
    async registrarResultado(id, { resultado }) {
        // Verifica se o exame existe
        await this.buscarPorId(id);

        // Atualiza o exame com o resultado, status e data
        const exame = await prisma.exame.update({
            where: { id },
            data: { resultado, status: 'RESULTADO_DISPONIVEL', dataResultado: new Date() },
        });
        logger.info('Resultado de exame registrado', { id });
        return exame;
    }
}

module.exports = new ExameService();
