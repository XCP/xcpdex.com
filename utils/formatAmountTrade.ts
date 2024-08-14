import { formatAmountSimple } from '@/utils/formatAmountSimple';

export function formatAmountTrade(amount: string | number, usd: boolean = false, pct: boolean = false): string {
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
  }

  // Handle numbers less than 1000 with up to 8 decimal places
  let formattedNumber: string;

  if (num < 1) {
    // Convert to string to handle precision
    const numStr = num.toString();

    // Find the first significant digit after the decimal point
    const significantDigits = numStr.match(/[1-9]/);
    const significantIndex = significantDigits ? significantDigits.index! - numStr.indexOf('.') - 1 : 0;

    // If more precision is needed, use it to ensure at least 2 significant digits
    if (significantIndex >= 8) {
      formattedNumber = num.toPrecision(2);
    } else {
      formattedNumber = num.toFixed(8);
    }
  } else {
    // Format numbers >= 1 with 8 decimal places
    formattedNumber = num.toFixed(8);
  }

  // Apply formatting to the integer part and return the formatted number
  return formatAmountSimple(formattedNumber);
}