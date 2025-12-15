const express = require('express');
const calculateCusps = require('./calculateCusps');

const app = express();

// O Render define a porta automaticamente através da variável process.env.PORT
const PORT = process.env.PORT || 3000;

// Permite que o servidor entenda dados enviados em formato JSON
app.use(express.json());

// Rota de teste para saber se o servidor está no ar
app.get('/', (req, res) => {
  res.send('O Motor Houses está funcionando! Envie um POST para /calcular');
});

// Rota principal que faz o cálculo
app.post('/calcular', (req, res) => {
  try {
    const inputData = req.body;

    // Verifica se os dados mínimos foram enviados
    if (!inputData) {
      return res.status(400).json({ error: 'Nenhum dado enviado.' });
    }

    // Chama a sua função de cálculo
    const resultado = calculateCusps(inputData);
    
    // Devolve o resultado para quem pediu
    return res.json(resultado);

  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ 
      error: 'Erro interno no cálculo.', 
      detalhes: error.message 
    });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
