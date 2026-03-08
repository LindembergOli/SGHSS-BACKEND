/**
 * Validadores do módulo de Autenticação
 * 
 * Define as regras de validação dos dados recebidos nas
 * requisições de registro e login, usando express-validator.
 */

const { body } = require('express-validator');

// Validação para registro de novo usuário
const registerValidator = [
    body('email')
        .isEmail()
        .withMessage('E-mail inválido.')
        .normalizeEmail(),
    body('senha')
        .isLength({ min: 6 })
        .withMessage('A senha deve ter no mínimo 6 caracteres.'),
    body('perfil')
        .isIn(['PACIENTE', 'PROFISSIONAL', 'ADMIN'])
        .withMessage('Perfil deve ser PACIENTE, PROFISSIONAL ou ADMIN.'),
];

// Validação para login
const loginValidator = [
    body('email')
        .isEmail()
        .withMessage('E-mail inválido.')
        .normalizeEmail(),
    body('senha')
        .notEmpty()
        .withMessage('A senha é obrigatória.'),
];

module.exports = { registerValidator, loginValidator };
