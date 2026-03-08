/**
 * Service do módulo de Profissionais de Saúde
 * 
 * Contém a lógica de negócio para gerenciamento de profissionais
 * (médicos, enfermeiros, técnicos) e suas agendas de atendimento.
 */

const prisma = require('../../shared/prisma');
const logger = require('../../shared/utils/logger');

class ProfissionalService {
    /**
     * Cadastra um novo profissional vinculado a um usuário do sistema
     * Verifica se o usuário já possui cadastro de profissional (evita duplicidade)
     */
    async criar({ usuarioId, nome, registroConselho, especialidade, tipo, unidadeId }) {
        // Verifica se o usuário já possui um cadastro de profissional
        const existente = await prisma.profissional.findUnique({ where: { usuarioId } });
        if (existente) {
            const error = new Error('Este usuário já possui um cadastro de profissional.');
            error.statusCode = 409;
            throw error;
        }

        // Cria o registro do profissional no banco de dados
        const profissional = await prisma.profissional.create({
            data: { usuarioId, nome, registroConselho, especialidade, tipo, unidadeId: unidadeId || null },
        });

        logger.info('Profissional criado', { id: profissional.id });
        return profissional;
    }

    /**
     * Lista profissionais com paginação e filtros opcionais
     * Permite filtrar por especialidade (busca parcial) e tipo de profissional
     */
    async listar({ pagina = 1, limite = 10, especialidade, tipo }) {
        // Monta os filtros dinâmicos
        const where = {};
        if (especialidade) where.especialidade = { contains: especialidade, mode: 'insensitive' };
        if (tipo) where.tipo = tipo;

        // Calcula o offset para paginação
        const skip = (pagina - 1) * limite;

        // Executa a consulta e contagem em paralelo para melhor performance
        const [profissionais, total] = await Promise.all([
            prisma.profissional.findMany({
                where, skip, take: limite,
                orderBy: { createdAt: 'desc' },
                include: {
                    usuario: { select: { email: true, ativo: true } },
                    unidade: { select: { nome: true, tipo: true } },
                },
            }),
            prisma.profissional.count({ where }),
        ]);

        return {
            dados: profissionais,
            paginacao: { total, pagina, limite, totalPaginas: Math.ceil(total / limite) },
        };
    }

    /**
     * Busca um profissional por ID com dados relacionados
     * Inclui: dados do usuário, unidade hospitalar, agendas e últimas consultas
     */
    async buscarPorId(id) {
        const profissional = await prisma.profissional.findUnique({
            where: { id },
            include: {
                usuario: { select: { email: true, ativo: true } },
                unidade: { select: { nome: true, tipo: true } },
                agendas: { orderBy: { diaSemana: 'asc' } },
                consultas: { orderBy: { dataHora: 'desc' }, take: 10 },
            },
        });

        if (!profissional) {
            const error = new Error('Profissional não encontrado.');
            error.statusCode = 404;
            throw error;
        }
        return profissional;
    }

    /**
     * Atualiza os dados de um profissional existente
     * Verifica se o profissional existe antes de atualizar
     */
    async atualizar(id, dados) {
        await this.buscarPorId(id);
        const profissional = await prisma.profissional.update({ where: { id }, data: dados });
        logger.info('Profissional atualizado', { id });
        return profissional;
    }

    /**
     * Remove um profissional do sistema
     * Verifica se o profissional existe antes de remover
     */
    async remover(id) {
        await this.buscarPorId(id);
        await prisma.profissional.delete({ where: { id } });
        logger.info('Profissional removido', { id });
        return { mensagem: 'Profissional removido com sucesso.' };
    }

    // =============================================
    // Métodos de gerenciamento da AGENDA
    // =============================================

    /**
     * Cria um novo horário na agenda do profissional
     * Define dia da semana, hora de início e hora de fim
     */
    async criarAgenda(profissionalId, { diaSemana, horaInicio, horaFim }) {
        // Verifica se o profissional existe
        await this.buscarPorId(profissionalId);

        // Cria o registro de horário na agenda
        const agenda = await prisma.agenda.create({
            data: { profissionalId, diaSemana, horaInicio, horaFim },
        });
        return agenda;
    }

    /**
     * Lista todos os horários ativos da agenda de um profissional
     * Retorna os horários ordenados por dia da semana
     */
    async listarAgendas(profissionalId) {
        await this.buscarPorId(profissionalId);
        return prisma.agenda.findMany({
            where: { profissionalId, ativo: true },
            orderBy: { diaSemana: 'asc' },
        });
    }

    /**
     * Remove um horário específico da agenda de um profissional
     */
    async removerAgenda(profissionalId, agendaId) {
        await this.buscarPorId(profissionalId);
        await prisma.agenda.delete({ where: { id: agendaId } });
        return { mensagem: 'Horário removido com sucesso.' };
    }
}

module.exports = new ProfissionalService();
