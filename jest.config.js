module.exports = {
    // Define o ambiente de execução como Node.js (necessário para APIs completas)
    testEnvironment: 'node',

    // Limpa mocks automaticamente antes de cada teste
    clearMocks: true,

    // Exibe o painel de resultados com detalhes sobre os testes executados
    verbose: true,

    // Ativa a cobertura de código
    collectCoverage: true,

    // Define o diretório onde os relatórios de cobertura serão salvos
    coverageDirectory: 'coverage',

    // Padrão que verifica onde os arquivos de teste estão (neste caso, arquivos terminando em .test.js)
    testMatch: ['**/*.test.js'],

    // Ignora a pasta node_modules
    testPathIgnorePatterns: ['/node_modules/'],
};
