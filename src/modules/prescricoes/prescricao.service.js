/**
 * Service do módulo de Prescrições
 * 
 * Contém a lógica de negócio para emissão e consulta de
 * prescrições médicas (receitas digitais) vinculadas a consultas.
 * Cada prescrição registra medicamento, dosagem e instruções de uso.
 */

const prisma = require('../../shared/prisma');
const logger = require('../../shared/utils/logger');

class PrescricaoService {
    /**
     * Emite uma nova prescrição médica vinculada a uma consulta
     * Verifica se a consulta existe antes de criar a prescrição
     */
    async criar({ consultaId, usuarioId, medicamento, dosagem, instrucoes }) {
        // Verifica se a consulta existe no sistema
        const consulta = await prisma.consulta.findUnique({ where: { id: consultaId } });
        if (!consulta) { const e = new Error('Consulta não encontrada.'); e.statusCode = 404; throw e; }

        // Busca o ID real do profissional ligado a esse usuário autenticado
        const profissional = await prisma.profissional.findUnique({ where: { usuarioId } });
        if (!profissional) { const e = new Error('O usuário logado não possui um cadastro de profissional associado.'); e.statusCode = 403; throw e; }

        // Cria a prescrição no banco de dados vinculando ao id do PROFISSIONAL, não do usuário
        const prescricao = await prisma.prescricao.create({
            data: { consultaId, profissionalId: profissional.id, medicamento, dosagem, instrucoes: instrucoes || null },
        });
        logger.info('Prescrição criada', { id: prescricao.id });
        return prescricao;
    }

    /**
     * Lista prescrições com paginação e filtros opcionais
     * Permite filtrar por consulta e profissional
     */
    async listar({ pagina = 1, limite = 10, consultaId, profissionalId }) {
        // Monta os filtros dinâmicos
        const where = {};
        if (consultaId) where.consultaId = consultaId;
        if (profissionalId) where.profissionalId = profissionalId;

        const skip = (pagina - 1) * limite;

        // Executa consulta e contagem em paralelo
        const [prescricoes, total] = await Promise.all([
            prisma.prescricao.findMany({
                where, skip, take: limite, orderBy: { dataEmissao: 'desc' },
                include: {
                    consulta: { select: { paciente: { select: { nome: true } } } },
                    profissional: { select: { nome: true, registroConselho: true } },
                },
            }),
            prisma.prescricao.count({ where }),
        ]);
        return { dados: prescricoes, paginacao: { total, pagina, limite, totalPaginas: Math.ceil(total / limite) } };
    }

    /**
     * Busca uma prescrição por ID com dados do paciente e profissional
     */
    async buscarPorId(id) {
        const prescricao = await prisma.prescricao.findUnique({
            where: { id },
            include: {
                consulta: { include: { paciente: { select: { nome: true, cpf: true } } } },
                profissional: { select: { nome: true, registroConselho: true, especialidade: true } },
            },
        });
        if (!prescricao) { const e = new Error('Prescrição não encontrada.'); e.statusCode = 404; throw e; }
        return prescricao;
    }
}

module.exports = new PrescricaoService();
