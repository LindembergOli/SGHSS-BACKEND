/**
 * Service do módulo de Suprimentos
 * 
 * Gerencia o estoque de medicamentos, materiais cirúrgicos,
 * EPIs e outros insumos das unidades hospitalares.
 */

const prisma = require('../../shared/prisma');
const logger = require('../../shared/utils/logger');

class SuprimentoService {
    /**
     * Cadastra um novo item de suprimento no estoque
     */
    async criar({ unidadeId, nome, categoria, quantidade, unidadeMedida, estoqueMinimo, lote, validade, fornecedor }) {
        const unidade = await prisma.unidadeHospitalar.findUnique({ where: { id: unidadeId } });
        if (!unidade) { const e = new Error('Unidade hospitalar não encontrada.'); e.statusCode = 404; throw e; }

        const suprimento = await prisma.suprimento.create({
            data: {
                unidadeId, nome, categoria, quantidade: quantidade || 0,
                unidadeMedida, estoqueMinimo: estoqueMinimo || 10,
                lote: lote || null, validade: validade ? new Date(validade) : null, fornecedor: fornecedor || null,
            },
        });
        logger.info('Suprimento cadastrado', { id: suprimento.id, nome });
        return suprimento;
    }

    /**
     * Lista suprimentos com paginação e filtros
     */
    async listar({ pagina = 1, limite = 10, unidadeId, categoria, estoqueBaixo }) {
        const where = {};
        if (unidadeId) where.unidadeId = unidadeId;
        if (categoria) where.categoria = { contains: categoria, mode: 'insensitive' };

        const skip = (pagina - 1) * limite;
        const [suprimentos, total] = await Promise.all([
            prisma.suprimento.findMany({
                where, skip, take: limite,
                orderBy: { nome: 'asc' },
                include: { unidade: { select: { nome: true, tipo: true } } },
            }),
            prisma.suprimento.count({ where }),
        ]);

        // Filtra estoque baixo após a consulta (campo calculado)
        let dados = suprimentos;
        if (estoqueBaixo === 'true') {
            dados = suprimentos.filter(s => s.quantidade <= s.estoqueMinimo);
        }

        // Adiciona alerta de estoque baixo em cada item
        dados = dados.map(s => ({
            ...s,
            alertaEstoqueBaixo: s.quantidade <= s.estoqueMinimo,
        }));

        return { dados, paginacao: { total, pagina, limite, totalPaginas: Math.ceil(total / limite) } };
    }

    /**
     * Busca suprimento por ID
     */
    async buscarPorId(id) {
        const suprimento = await prisma.suprimento.findUnique({
            where: { id },
            include: { unidade: { select: { nome: true, tipo: true } } },
        });
        if (!suprimento) { const e = new Error('Suprimento não encontrado.'); e.statusCode = 404; throw e; }
        return { ...suprimento, alertaEstoqueBaixo: suprimento.quantidade <= suprimento.estoqueMinimo };
    }

    /**
     * Atualiza informações do suprimento
     */
    async atualizar(id, dados) {
        await this.buscarPorId(id);
        if (dados.validade) dados.validade = new Date(dados.validade);
        const suprimento = await prisma.suprimento.update({ where: { id }, data: dados });
        logger.info('Suprimento atualizado', { id });
        return suprimento;
    }

    /**
     * Registra entrada de estoque (soma quantidade)
     */
    async registrarEntrada(id, { quantidade, lote, fornecedor }) {
        const suprimento = await prisma.suprimento.findUnique({ where: { id } });
        if (!suprimento) { const e = new Error('Suprimento não encontrado.'); e.statusCode = 404; throw e; }

        const atualizado = await prisma.suprimento.update({
            where: { id },
            data: {
                quantidade: suprimento.quantidade + quantidade,
                lote: lote || suprimento.lote,
                fornecedor: fornecedor || suprimento.fornecedor,
            },
        });
        logger.info('Entrada de estoque registrada', { id, quantidade, novoTotal: atualizado.quantidade });
        return { ...atualizado, mensagem: `Entrada de ${quantidade} unidades registrada. Novo total: ${atualizado.quantidade}.` };
    }

    /**
     * Registra saída de estoque (subtrai quantidade)
     */
    async registrarSaida(id, { quantidade, motivo }) {
        const suprimento = await prisma.suprimento.findUnique({ where: { id } });
        if (!suprimento) { const e = new Error('Suprimento não encontrado.'); e.statusCode = 404; throw e; }

        if (suprimento.quantidade < quantidade) {
            const e = new Error(`Estoque insuficiente. Disponível: ${suprimento.quantidade}, solicitado: ${quantidade}.`);
            e.statusCode = 400; throw e;
        }

        const atualizado = await prisma.suprimento.update({
            where: { id },
            data: { quantidade: suprimento.quantidade - quantidade },
        });

        logger.info('Saída de estoque registrada', { id, quantidade, motivo, novoTotal: atualizado.quantidade });
        return {
            ...atualizado,
            mensagem: `Saída de ${quantidade} unidades registrada. Restante: ${atualizado.quantidade}.`,
            alertaEstoqueBaixo: atualizado.quantidade <= atualizado.estoqueMinimo,
        };
    }

    /**
     * Remove suprimento do cadastro
     */
    async remover(id) {
        await this.buscarPorId(id);
        await prisma.suprimento.delete({ where: { id } });
        logger.info('Suprimento removido', { id });
        return { mensagem: 'Suprimento removido com sucesso.' };
    }
}

module.exports = new SuprimentoService();
