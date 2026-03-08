/**
 * Validadores do módulo de Pacientes
 * 
 * Define as regras de validação para criação, atualização
 * e busca de pacientes, usando express-validator.
 */

const { body, param } = require('express-validator');

// Validação para criação de um novo paciente
const criarPacienteValidator = [
    body('nome')
        .notEmpty()
        .withMessage('O nome é obrigatório.')
        .isLength({ min: 3 })
        .withMessage('O nome deve ter no mínimo 3 caracteres.'),
    body('cpf')
        .notEmpty()
        .withMessage('O CPF é obrigatório.')
        .matches(/^\d{11}$/)
        .withMessage('O CPF deve conter exatamente 11 dígitos numéricos.'),
    body('dataNasc')
        .notEmpty()
        .withMessage('A data de nascimento é obrigatória.')
        .isISO8601()
        .withMessage('Data de nascimento inválida. Use o formato YYYY-MM-DD.'),
    body('telefone')
        .notEmpty()
        .withMessage('O telefone é obrigatório.'),
    body('endereco')
        .notEmpty()
        .withMessage('O endereço é obrigatório.'),
    body('sexo')
        .optional()
        .isIn(['M', 'F', 'OUTRO'])
        .withMessage('Sexo deve ser M, F ou OUTRO.'),
];

// Validação para atualização parcial de um paciente
const atualizarPacienteValidator = [
    param('id').isUUID().withMessage('ID inválido.'),
    body('nome')
        .optional()
        .isLength({ min: 3 })
        .withMessage('O nome deve ter no mínimo 3 caracteres.'),
    body('cpf')
        .optional()
        .matches(/^\d{11}$/)
        .withMessage('O CPF deve conter exatamente 11 dígitos numéricos.'),
    body('dataNasc')
        .optional()
        .isISO8601()
        .withMessage('Data de nascimento inválida. Use o formato YYYY-MM-DD.'),
    body('telefone').optional(),
    body('endereco').optional(),
    body('sexo')
        .optional()
        .isIn(['M', 'F', 'OUTRO'])
        .withMessage('Sexo deve ser M, F ou OUTRO.'),
];

// Validação do parâmetro de ID na URL
const idValidator = [
    param('id').isUUID().withMessage('ID inválido.'),
];

module.exports = { criarPacienteValidator, atualizarPacienteValidator, idValidator };
