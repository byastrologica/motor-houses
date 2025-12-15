// Módulo para cálculo das cúspides usando 'swisseph' (versão compatível)

let swisseph;
try {
  swisseph = require('swisseph');
} catch (err) {
  console.error('CRITICAL ERROR: Falha ao carregar a biblioteca swisseph.');
  throw err; 
}

function dmsToDec(deg, min, sec, dir) {
  let val = Math.abs(deg) + (min || 0) / 60 + (sec || 0) / 3600;
  if (dir === 'S' || dir === 'W') val = -val;
  return val;
}

function getZodiacSign(deg) {
  deg = ((deg % 360) + 360) % 360;
  const signs = [
    'Áries','Touro','Gêmeos','Câncer','Leão','Virgem',
    'Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'
  ];
  const index = Math.floor(deg / 30);
  const degInSign = deg - index * 30;
  const d = Math.floor(degInSign);
  const m = Math.floor((degInSign - d) * 60);
  const s = Math.round(((degInSign - d) * 3600) - m * 60);
  
  return { 
      sign: signs[index], 
      formatted: `${signs[index]} ${d}° ${m}' ${s}"`,
      grau_absoluto: deg
  };
}

/**
 * Calcula as cúspides de casas
 * @param {Object} inputData
 */
function calculateCusps(inputData) {
  const { sideralTime, latitude, longitude, obliquity, houseSystem } = inputData;

  // Converter Tempo Sideral para horas decimais
  const lstHours = sideralTime.h + sideralTime.m / 60 + sideralTime.s / 3600;
  
  // Converter para ARMC (Ascensão Reta do Meio do Céu) - Multiplica por 15
  const armc = lstHours * 15.0;

  // Converter Latitude para decimal
  const latDec = dmsToDec(latitude.deg, latitude.min, latitude.sec, latitude.dir);

  // Define o sistema de casas (P = Placidus)
  // A biblioteca swisseph usa o código ASCII da letra
  const hSys = houseSystem ? houseSystem.charAt(0) : 'P'; 

  // Variáveis para armazenar o resultado da biblioteca
  let housesResult = null;
  let ascmcResult = null;

  // A função swe_houses_armc da biblioteca swisseph funciona via callback
  // mas roda de forma síncrona, então podemos capturar as variáveis direto.
  swisseph.swe_houses_armc(armc, latDec, obliquity, hSys, function(result) {
      if (result && result.house) {
          housesResult = result.house; // Array com as casas
          ascmcResult = result.ascmc;  // Array com Ascendente, MC, etc.
      }
  });

  if (!housesResult) {
      throw new Error('Erro: A biblioteca swisseph não retornou dados.');
  }

  // Normalizar array de cúspides 
  // O swisseph retorna um array de 13 itens (índice 0 é vazio, casas são 1 a 12)
  const casasFinais = [];
  for (let i = 1; i <= 12; i++) {
      let grau = housesResult[i];
      casasFinais.push({
          casa: i,
          grau: grau,
          signo: getZodiacSign(grau)
      });
  }

  // Extrair Ascendente (índice 0) e MC (índice 1) do array ascmc
  let asc = ascmcResult ? ascmcResult[0] : casasFinais[0].grau;
  let mc = ascmcResult ? ascmcResult[1] : casasFinais[9].grau;

  return {
    ascendente: getZodiacSign(asc),
    mc: getZodiacSign(mc),
    casas: casasFinais
  };
}

module.exports = calculateCusps;
