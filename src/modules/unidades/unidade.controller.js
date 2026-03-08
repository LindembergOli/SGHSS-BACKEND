/**
 * Controller do módulo de Unidades Hospitalares
 * 
 * Recebe as requisições HTTP de gerenciamento de unidades,
 * valida os dados de entrada e chama o service correspondente.
 */

const { validationResult } = require('express-validator');
const unidadeService = require('./unidade.service');

class UnidadeController {
    /** POST /unidades — Cadastra nova unidade hospitalar */
    async criar(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: errors.array() });

            const { nome, tipo, endereco, telefone } = req.body;
            const unidade = await unidadeService.criar({ nome, tipo, endereco, telefone });
            return res.status(201).json(unidade);
        } catch (err) { next(err); }
    }

    /** GET /unidades — Lista unidades com paginação */
    async listar(req, res, next) {
        try {
            const { pagina, limite, tipo } = req.query;
            const resultado = await unidadeService.listar({
                pagina: parseInt(pagina) || 1, limite: parseInt(limite) || 10, tipo,
            });
            return res.status(200).json(resultado);
        } catch (err) { next(err); }
    }

    /** GET /unidades/:id — Busca por ID */
    async buscarPorId(req, res, next) {
        try {
            const unidade = await unidadeService.buscarPorId(req.params.id);
            return res.status(200).json(unidade);
        } catch (err) { next(err); }
    }

    /** PUT /unidades/:id — Atualiza dados */
    async atualizar(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: errors.array() });

            const { nome, tipo, endereco, telefone } = req.body || {};
            const dados = {};
            if (nome) dados.nome = nome;
            if (tipo) dados.tipo = tipo;
            if (endereco) dados.endereco = endereco;
            if (telefone) dados.telefone = telefone;

            const unidade = await unidadeService.atualizar(req.params.id, dados);
            return res.status(200).json(unidade);
        } catch (err) { next(err); }
    }

    /** DELETE /unidades/:id — Remove unidade */
    async remover(req, res, next) {
        try {
            const resultado = await unidadeService.remover(req.params.id);
            return res.status(200).json(resultado);
        } catch (err) { next(err); }
    }

    /** GET /unidades/dashboard — Dashboard administrativo */
    async dashboard(req, res, next) {
        try {
            const dados = await unidadeService.dashboard();
            return res.status(200).json(dados);
        } catch (err) { next(err); }
    }
}

module.exports = new UnidadeController();
