import swe from 'sweph';

function dmsToDec(degrees, minutes, seconds, direction) {
    let dec = degrees + minutes / 60 + seconds / 3600;
    if (direction === 'S' || direction === 'W') {
        dec = -dec;
    }
    return dec;
}

function formatDegrees(deg) {
    const sign = deg < 0 ? '-' : '';
    let absDeg = Math.abs(deg);
    const d = Math.floor(absDeg);
    const m = Math.floor((absDeg - d) * 60);
    const s = Math.round(((absDeg - d) * 3600 - m * 60));
    return `${sign}${d}° ${m}' ${s}"`;
}

function getZodiacSign(degree) {
    const signs = [
        'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
        'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'
    ];
    let normalizedDegree = degree % 360;
    if (normalizedDegree < 0) {
        normalizedDegree += 360;
    }
    const signIndex = Math.floor(normalizedDegree / 30);
    const degreeInSign = normalizedDegree % 30;
    const minutes = Math.floor((degreeInSign - Math.floor(degreeInSign)) * 60);
    const seconds = Math.round(((degreeInSign - Math.floor(degreeInSign)) * 60 - minutes) * 60);
    return `${signs[signIndex]} ${Math.floor(degreeInSign)}° ${minutes}' ${seconds}"`;
}

function calculateCusps() {
    // Dados para teste
    // Sideral Time: 18:57:16
    // Latitude 23s33'09
    // Longitude 46w37'29

    const sideralTimeHours = 18 + 57 / 60 + 16 / 3600; // Tempo Sideral em horas

    const latitude = dmsToDec(23, 33, 9, 'S');
    const longitude = dmsToDec(46, 37, 29, 'W');

    const houseSystem = 'P'; 

    const armc = sideralTimeHours * 15;
    const obliquity = 23.43650; // Obliquidade da eclíptica

    const houseResult = swe.houses_armc(armc, latitude, obliquity, houseSystem);

    const cusps = houseResult.data.houses;
    const ascmc = houseResult.data.points;

    console.log('Resultado das Cúspides:');
    console.log(`Ascendente ${getZodiacSign(ascmc[0])}`);
    console.log(`Casa 2 ${getZodiacSign(cusps[1])}`);
    console.log(`Casa 3 ${getZodiacSign(cusps[2])}`);
    console.log(`Casa 4 ${getZodiacSign(ascmc[1])}`);
    console.log(`Casa 5 ${getZodiacSign(cusps[4])}`);
    console.log(`Casa 6 ${getZodiacSign(cusps[5])}`);
    console.log(`Casa 7 ${getZodiacSign(cusps[6])}`);
    console.log(`Casa 8 ${getZodiacSign(cusps[7])}`);
    console.log(`Casa 9 ${getZodiacSign(cusps[8])}`);
    console.log(`Casa 10 ${getZodiacSign(cusps[9])}`);
    console.log(`Casa 11 ${getZodiacSign(cusps[10])}`);
    console.log(`Casa 12 ${getZodiacSign(cusps[11])}`);
}

calculateCusps();