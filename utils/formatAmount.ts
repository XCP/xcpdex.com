export function formatAmount(amount: string | number, usd: boolean = false): string {
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
    // Convert number to string to manipulate decimals
    const numStr = num.toString();

    // Find the index of the first significant digit after the decimal point
    const significantIndex = numStr.search(/[1-9]/) - numStr.indexOf('.') - 1;

    let formattedNumber: string;

    // Determine precision based on the significant digit's position
    if (significantIndex < 4 && usd) {
      formattedNumber = num.toFixed(2);
    } else if (significantIndex < 4) {
      formattedNumber = num.toFixed(4);
    } else if (significantIndex < 6) {
      formattedNumber = num.toFixed(6);
    } else if (significantIndex < 8) {
      formattedNumber = num.toFixed(8);
    } else {
      formattedNumber = num.toPrecision(2);
    }

    // Convert back to a number and remove any trailing zeros
    return parseFloat(formattedNumber).toString();
  }

  // Fallback for other cases
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 18,
  }).replace(/\.?0+$/, ''); // Remove trailing zeros
}
