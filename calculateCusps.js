// Módulo para cálculo das cúspides usando 'sweph'.

let swe;
try {
  swe = require('sweph');
} catch (err) {
  // Isso vai mostrar o erro real no log do Render se falhar
  console.error('CRITICAL ERROR: Falha ao carregar a biblioteca sweph.');
  console.error('Detalhes do erro:', err);
  console.error('Stack trace:', err.stack);
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
  // Define o caminho para os arquivos de efemérides (se necessário, o padrão costuma funcionar)
  // swe.set_ephe_path(__dirname + '/ephe'); 

  const { sideralTime, latitude, longitude, obliquity, houseSystem } = inputData;

  const lstHours = sideralTime.h + sideralTime.m / 60 + sideralTime.s / 3600;
  const armc = lstHours * 15.0;
  const latDec = dmsToDec(latitude.deg, latitude.min, latitude.sec, latitude.dir);
  const hSys = houseSystem || 'P'; 

  let houseResult;
  
  if (typeof swe.houses_armc === 'function') {
    houseResult = swe.houses_armc(armc, latDec, obliquity, hSys);
  } else {
    houseResult = swe.houses(armc, latDec, obliquity, hSys);
  }

  let cusps = null;
  let ascmc = null;

  if (houseResult && houseResult.data) {
     cusps = houseResult.data.houses || houseResult.data.cusps;
     ascmc = houseResult.data.points || houseResult.data.ascmc;
  } else if (Array.isArray(houseResult)) {
     cusps = houseResult;
  }

  if (!cusps) {
      throw new Error('Não foi possível calcular as casas (retorno vazio do sweph).');
  }

  const casasFinais = [];
  for (let i = 1; i <= 12; i++) {
      let grau = cusps[i] !== undefined ? cusps[i] : cusps[i-1];
      casasFinais.push({
          casa: i,
          grau: grau,
          signo: getZodiacSign(grau)
      });
  }

  let asc = null;
  let mc = null;
  
  if (ascmc && ascmc.length >= 2) {
      asc = ascmc[0];
      mc = ascmc[1];
  } else {
      asc = casasFinais[0].grau; 
      mc = casasFinais[9].grau; 
  }

  return {
    ascendente: getZodiacSign(asc),
    mc: getZodiacSign(mc),
    casas: casasFinais
  };
}

module.exports = calculateCusps;
