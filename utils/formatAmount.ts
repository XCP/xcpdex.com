export function formatAmount(amount: string | number): string {
  // Convert the amount to a number if it's a string
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Format the number to remove insignificant zeros
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 18,
  });

  return formatted;
}
