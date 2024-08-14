export function formatAmount(amount: string | number, usd: boolean = false, pct: boolean = false): string {
  if (amount === null || amount === undefined) {
    return 'N/A';
  }

  // Convert the amount to a number if it's a string
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Handle very large numbers with appropriate suffixes (K, M, B, etc.)
  if (num >= 1_000_000_000_000_000) {
    return (num / 1_000_000_000_000_000).toFixed(2) + 'Q';
  } else if (num >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(2) + 'T';
  } else if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + 'B';
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M';
  } else if (num >= 1_000) {
    return Math.floor(num).toLocaleString('en-US');
  }

  // Handle decimals for numbers less than 1000
  if (num < 1_000) {
    let formattedNumber: string;

    // Handle the number as a string to preserve small decimal precision
    const numStr = typeof amount === 'number' ? amount.toString() : amount;

    // Find the first significant digit after the decimal point
    const significantIndex = numStr.indexOf('.') >= 0 ? numStr.search(/[1-9]/) - numStr.indexOf('.') - 1 : 0;

    // Determine precision based on the significant digit's position
    if (usd) {
      if (num < 1 && significantIndex < 4) {
        formattedNumber = parseFloat(numStr).toPrecision(4);
      } else if (num < 1) {
        formattedNumber = parseFloat(numStr).toPrecision(2);
      } else {
        formattedNumber = parseFloat(numStr).toFixed(2);
      }
    } else if (pct && num > 1) {
      formattedNumber = parseFloat(numStr).toFixed(2);
    } else if (significantIndex < 4) {
      formattedNumber = parseFloat(numStr).toFixed(4);
    } else if (significantIndex < 6) {
      formattedNumber = parseFloat(numStr).toFixed(6);
    } else if (significantIndex < 8) {
      formattedNumber = parseFloat(numStr).toFixed(8);
    } else {
      formattedNumber = parseFloat(numStr).toPrecision(2);
    }

    // Return the formatted number as a string
    return formattedNumber.replace(/\.?0+$/, ''); // Remove trailing zeros
  }

  // Fallback for other cases
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 18,
  }).replace(/\.?0+$/, ''); // Remove trailing zeros
}
