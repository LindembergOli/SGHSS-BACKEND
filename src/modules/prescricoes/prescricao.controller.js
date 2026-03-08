/**
 * Controller do módulo de Prescrições
 * 
 * Recebe as requisições HTTP de prescrições médicas (receitas digitais),
 * valida os dados e chama o service correspondente.
 */

const { validationResult } = require('express-validator');
const prescricaoService = require('./prescricao.service');

class PrescricaoController {
    /**
     * POST /prescricoes
     * Emite uma nova prescrição (receita digital) vinculada a uma consulta
     */
    async criar(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: errors.array() });

            const { consultaId, medicamento, dosagem, instrucoes } = req.body;
            // req.usuario.id é o ID do Usuário e não do Profissional, o service vai tratar isso
            const prescricao = await prescricaoService.criar({
                consultaId, usuarioId: req.usuario.id, medicamento, dosagem, instrucoes,
            });
            return res.status(201).json(prescricao);
        } catch (err) { next(err); }
    }

    /**
     * GET /prescricoes
     * Lista prescrições com filtros opcionais por consulta e profissional
     */
    async listar(req, res, next) {
        try {
            const resultado = await prescricaoService.listar({
                pagina: parseInt(req.query.pagina) || 1, limite: parseInt(req.query.limite) || 10,
                consultaId: req.query.consultaId, profissionalId: req.query.profissionalId,
            });
            return res.status(200).json(resultado);
        } catch (err) { next(err); }
    }

    /**
     * GET /prescricoes/:id
     * Busca uma prescrição por ID com dados do paciente e profissional
     */
    async buscarPorId(req, res, next) {
        try {
            const prescricao = await prescricaoService.buscarPorId(req.params.id);
            return res.status(200).json(prescricao);
        } catch (err) { next(err); }
    }
}

module.exports = new PrescricaoController();
