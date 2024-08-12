export function formatAmount(amount: string | number): string {
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
    // Convert number to string to easily manipulate decimals
    const numStr = num.toString();

    // Find the index of the first significant digit after the decimal point
    const decimalIndex = numStr.indexOf('.') + 1;
    const significantIndex = numStr.slice(decimalIndex).search(/[1-9]/);

    if (significantIndex >= 0 && significantIndex + 1 < 6) {
      // Calculate the number of decimal places to retain
      const decimalsToRetain = 6 - significantIndex;
      return num.toFixed(decimalsToRetain).replace(/\.?0+$/, '');
    }
  }

  // Format the number to remove insignificant zeros and return
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 18,
  }).replace(/\.?0+$/, ''); // Remove trailing zeros
}