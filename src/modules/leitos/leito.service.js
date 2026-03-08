/**
 * Service do módulo de Leitos
 * 
 * Gerencia leitos hospitalares dentro das unidades,
 * controlando disponibilidade, ocupação e manutenção.
 */

const prisma = require('../../shared/prisma');
const logger = require('../../shared/utils/logger');

class LeitoService {
    /** Cadastra novo leito em uma unidade */
    async criar({ unidadeId, numero, tipo }) {
        // Verifica se a unidade existe
        const unidade = await prisma.unidadeHospitalar.findUnique({ where: { id: unidadeId } });
        if (!unidade) { const e = new Error('Unidade hospitalar não encontrada.'); e.statusCode = 404; throw e; }

        // Verifica duplicidade de número na mesma unidade
        const existente = await prisma.leito.findFirst({ where: { unidadeId, numero } });
        if (existente) { const e = new Error(`Já existe o leito nº ${numero} nesta unidade.`); e.statusCode = 409; throw e; }

        const leito = await prisma.leito.create({ data: { unidadeId, numero, tipo } });
        logger.info('Leito criado', { id: leito.id, unidadeId });
        return leito;
    }

    /** Lista leitos com paginação e filtros */
    async listar({ pagina = 1, limite = 10, unidadeId, status, tipo }) {
        const where = {};
        if (unidadeId) where.unidadeId = unidadeId;
        if (status) where.status = status;
        if (tipo) where.tipo = { contains: tipo, mode: 'insensitive' };

        const skip = (pagina - 1) * limite;
        const [leitos, total] = await Promise.all([
            prisma.leito.findMany({
                where, skip, take: limite,
                orderBy: { numero: 'asc' },
                include: {
                    unidade: { select: { nome: true, tipo: true } },
                    internacoes: { where: { status: 'ATIVA' }, select: { id: true, paciente: { select: { nome: true } } } },
                },
            }),
            prisma.leito.count({ where }),
        ]);

        return { dados: leitos, paginacao: { total, pagina, limite, totalPaginas: Math.ceil(total / limite) } };
    }

    /** Busca leito por ID */
    async buscarPorId(id) {
        const leito = await prisma.leito.findUnique({
            where: { id },
            include: {
                unidade: { select: { nome: true, tipo: true } },
                internacoes: {
                    orderBy: { dataEntrada: 'desc' }, take: 5,
                    include: { paciente: { select: { nome: true, cpf: true } }, profissional: { select: { nome: true, especialidade: true } } },
                },
            },
        });
        if (!leito) { const e = new Error('Leito não encontrado.'); e.statusCode = 404; throw e; }
        return leito;
    }

    /** Atualiza o status de um leito */
    async atualizarStatus(id, status) {
        await this.buscarPorId(id);
        const leito = await prisma.leito.update({ where: { id }, data: { status } });
        logger.info('Status do leito atualizado', { id, status });
        return leito;
    }

    /** Remove um leito do sistema */
    async remover(id) {
        const leito = await this.buscarPorId(id);
        if (leito.status === 'OCUPADO') {
            const e = new Error('Não é possível remover um leito ocupado. Realize a alta do paciente antes.');
            e.statusCode = 400; throw e;
        }
        await prisma.leito.delete({ where: { id } });
        logger.info('Leito removido', { id });
        return { mensagem: 'Leito removido com sucesso.' };
    }
}

module.exports = new LeitoService();
