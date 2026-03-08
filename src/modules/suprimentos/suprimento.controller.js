/**
 * Controller do módulo de Suprimentos
 */

const { validationResult } = require('express-validator');
const suprimentoService = require('./suprimento.service');

class SuprimentoController {
    /** POST /suprimentos — Cadastra novo suprimento */
    async criar(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: errors.array() });

            const { unidadeId, nome, categoria, quantidade, unidadeMedida, estoqueMinimo, lote, validade, fornecedor } = req.body;
            const suprimento = await suprimentoService.criar({
                unidadeId, nome, categoria, quantidade, unidadeMedida, estoqueMinimo, lote, validade, fornecedor,
            });
            return res.status(201).json(suprimento);
        } catch (err) { next(err); }
    }

    /** GET /suprimentos — Lista suprimentos */
    async listar(req, res, next) {
        try {
            const { pagina, limite, unidadeId, categoria, estoqueBaixo } = req.query;
            const resultado = await suprimentoService.listar({
                pagina: parseInt(pagina) || 1, limite: parseInt(limite) || 10, unidadeId, categoria, estoqueBaixo,
            });
            return res.status(200).json(resultado);
        } catch (err) { next(err); }
    }

    /** GET /suprimentos/:id — Busca por ID */
    async buscarPorId(req, res, next) {
        try {
            const suprimento = await suprimentoService.buscarPorId(req.params.id);
            return res.status(200).json(suprimento);
        } catch (err) { next(err); }
    }

    /** PUT /suprimentos/:id — Atualiza dados */
    async atualizar(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: errors.array() });

            const { nome, categoria, unidadeMedida, estoqueMinimo, lote, validade, fornecedor } = req.body || {};
            const dados = {};
            if (nome) dados.nome = nome;
            if (categoria) dados.categoria = categoria;
            if (unidadeMedida) dados.unidadeMedida = unidadeMedida;
            if (estoqueMinimo !== undefined) dados.estoqueMinimo = estoqueMinimo;
            if (lote) dados.lote = lote;
            if (validade) dados.validade = validade;
            if (fornecedor) dados.fornecedor = fornecedor;

            const suprimento = await suprimentoService.atualizar(req.params.id, dados);
            return res.status(200).json(suprimento);
        } catch (err) { next(err); }
    }

    /** PATCH /suprimentos/:id/entrada — Registra entrada de estoque */
    async registrarEntrada(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: errors.array() });

            const { quantidade, lote, fornecedor } = req.body;
            const resultado = await suprimentoService.registrarEntrada(req.params.id, { quantidade, lote, fornecedor });
            return res.status(200).json(resultado);
        } catch (err) { next(err); }
    }

    /** PATCH /suprimentos/:id/saida — Registra saída de estoque */
    async registrarSaida(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: errors.array() });

            const { quantidade, motivo } = req.body;
            const resultado = await suprimentoService.registrarSaida(req.params.id, { quantidade, motivo });
            return res.status(200).json(resultado);
        } catch (err) { next(err); }
    }

    /** DELETE /suprimentos/:id — Remove suprimento */
    async remover(req, res, next) {
        try {
            const resultado = await suprimentoService.remover(req.params.id);
            return res.status(200).json(resultado);
        } catch (err) { next(err); }
    }
}

module.exports = new SuprimentoController();
