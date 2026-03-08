/**
 * Service do módulo de Unidades Hospitalares
 * 
 * Contém a lógica de negócio para gerenciamento de hospitais,
 * clínicas, laboratórios e equipes de home care.
 */

const prisma = require('../../shared/prisma');
const logger = require('../../shared/utils/logger');

class UnidadeService {
    /**
     * Cadastra uma nova unidade hospitalar no sistema
     */
    async criar({ nome, tipo, endereco, telefone }) {
        const unidade = await prisma.unidadeHospitalar.create({
            data: { nome, tipo, endereco, telefone },
        });
        logger.info('Unidade hospitalar criada', { id: unidade.id });
        return unidade;
    }

    /**
     * Lista unidades hospitalares com paginação e filtros
     */
    async listar({ pagina = 1, limite = 10, tipo }) {
        const where = {};
        if (tipo) where.tipo = tipo;

        const skip = (pagina - 1) * limite;
        const [unidades, total] = await Promise.all([
            prisma.unidadeHospitalar.findMany({
                where, skip, take: limite,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { leitos: true, profissionais: true, suprimentos: true } },
                },
            }),
            prisma.unidadeHospitalar.count({ where }),
        ]);

        return {
            dados: unidades,
            paginacao: { total, pagina, limite, totalPaginas: Math.ceil(total / limite) },
        };
    }

    /**
     * Busca uma unidade por ID com dados completos
     */
    async buscarPorId(id) {
        const unidade = await prisma.unidadeHospitalar.findUnique({
            where: { id },
            include: {
                leitos: { orderBy: { numero: 'asc' } },
                profissionais: { select: { id: true, nome: true, especialidade: true, tipo: true } },
                _count: { select: { leitos: true, profissionais: true, suprimentos: true } },
            },
        });
        if (!unidade) { const e = new Error('Unidade hospitalar não encontrada.'); e.statusCode = 404; throw e; }
        return unidade;
    }

    /**
     * Atualiza os dados de uma unidade existente
     */
    async atualizar(id, dados) {
        await this.buscarPorId(id);
        const unidade = await prisma.unidadeHospitalar.update({ where: { id }, data: dados });
        logger.info('Unidade hospitalar atualizada', { id });
        return unidade;
    }

    /**
     * Remove uma unidade hospitalar do sistema
     */
    async remover(id) {
        await this.buscarPorId(id);
        await prisma.unidadeHospitalar.delete({ where: { id } });
        logger.info('Unidade hospitalar removida', { id });
        return { mensagem: 'Unidade hospitalar removida com sucesso.' };
    }

    /**
     * Dashboard geral com estatísticas de todas as unidades
     */
    async dashboard() {
        const [totalUnidades, leitosPorStatus, totalProfissionais, suprimentosBaixoEstoque] = await Promise.all([
            prisma.unidadeHospitalar.count(),
            prisma.leito.groupBy({ by: ['status'], _count: { id: true } }),
            prisma.profissional.count(),
            prisma.suprimento.count({ where: { quantidade: { lte: prisma.suprimento.fields?.estoqueMinimo ?? 10 } } }).catch(() =>
                // Fallback: busca manualmente suprimentos com estoque baixo
                prisma.$queryRaw`SELECT COUNT(*)::int as total FROM suprimentos WHERE quantidade <= estoque_minimo`.then(r => r[0]?.total || 0)
            ),
        ]);

        return {
            totalUnidades,
            leitos: {
                total: leitosPorStatus.reduce((acc, l) => acc + l._count.id, 0),
                porStatus: leitosPorStatus.reduce((acc, l) => { acc[l.status] = l._count.id; return acc; }, {}),
            },
            totalProfissionais,
            suprimentosBaixoEstoque,
        };
    }
}

module.exports = new UnidadeService();
