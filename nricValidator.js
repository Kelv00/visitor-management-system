function validateNRIC(nric) {
    // Remove whitespace and convert to uppercase
    nric = nric.trim().toUpperCase();
    // Expected format: 1 letter (S, T, F, G), 7 digits, 1 letter.
    const regex = /^[STFG]\d{7}[A-Z]$/;
    if (!regex.test(nric)) {
      return false;
    }
    const prefix = nric[0];
    const digits = nric.substr(1, 7).split('').map(Number);
    const lastChar = nric[8];
  
    const weights = [2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 7; i++) {
      sum += digits[i] * weights[i];
    }
    // For NRICs starting with T or G, add 4 to the sum
    if (prefix === 'T' || prefix === 'G') {
      sum += 4;
    }
    const remainder = sum % 11;
  
    let validLetter;
    if (prefix === 'S' || prefix === 'T') {
      const stTable = ['J','Z','I','H','G','F','E','D','C','B','A'];
      validLetter = stTable[remainder];
    } else if (prefix === 'F' || prefix === 'G') {
      const fgTable = ['X','W','U','T','R','Q','P','N','M','L','K'];
      validLetter = fgTable[remainder];
    }
    return lastChar === validLetter;
  }
  
  module.exports = { validateNRIC };
  