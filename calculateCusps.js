// Módulo para cálculo das cúspides usando 'sweph'.

let swe;
try {
  swe = require('sweph');
} catch (err) {
  console.error('Erro: A biblioteca sweph não foi encontrada.');
  process.exit(1);
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
      grau_absoluto: deg // útil para debug
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

  // Define o sistema de casas (padrão 'P' para Placidus se não informado)
  const hSys = houseSystem || 'P'; 

  let houseResult;
  
  // Tenta usar a função baseada em ARMC do sweph
  if (typeof swe.houses_armc === 'function') {
    // Parâmetros: armc, latitude, obliquidade, sistema de casas
    houseResult = swe.houses_armc(armc, latDec, obliquity, hSys);
  } else {
    // Fallback genérico (menos preciso se não tiver JD, mas serve de teste)
    houseResult = swe.houses(armc, latDec, obliquity, hSys);
  }

  // Tratamento do retorno da biblioteca sweph
  let cusps = null;
  let ascmc = null;

  if (houseResult && houseResult.data) {
     // Estrutura complexa de objeto
     cusps = houseResult.data.houses || houseResult.data.cusps;
     ascmc = houseResult.data.points || houseResult.data.ascmc;
  } else if (Array.isArray(houseResult)) {
     // Retorno simples de array
     cusps = houseResult;
     // O sweph geralmente retorna as cúspides começando do índice 1 até 12.
     // O índice 0 geralmente é zero.
  }

  if (!cusps) {
      throw new Error('Não foi possível calcular as casas com os dados fornecidos.');
  }

  // Normalizar array de cúspides (garantir que temos 12 casas)
  // O array do sweph geralmente tem 13 itens (índice 0 ignorado)
  const casasFinais = [];
  for (let i = 1; i <= 12; i++) {
      // Se o array for menor que 13, tentamos ajustar, mas o padrão é index 1 a 12
      let grau = cusps[i] !== undefined ? cusps[i] : cusps[i-1];
      casasFinais.push({
          casa: i,
          grau: grau,
          signo: getZodiacSign(grau)
      });
  }

  // Tentar extrair Ascendente e MC
  // Se swe.houses_armc retornar ascmc separado:
  let asc = null;
  let mc = null;
  
  // O sweph retorna ascmc como array: [0]=Asc, [1]=MC, etc.
  if (ascmc && ascmc.length >= 2) {
      asc = ascmc[0];
      mc = ascmc[1];
  } else {
      // Se não vier separado, pegamos da Cúspide 1 e Cúspide 10
      asc = casasFinais[0].grau; // Casa 1
      mc = casasFinais[9].grau;  // Casa 10
  }

  return {
    ascendente: getZodiacSign(asc),
    mc: getZodiacSign(mc),
    casas: casasFinais
  };
}

module.exports = calculateCusps;
