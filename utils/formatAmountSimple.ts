export function formatAmountSimple(amount: number | string): string {
  // Convert the amount to a string
  const amountStr = amount.toString();

  // Split the amount into whole and decimal parts
  const [wholePart, decimalPart] = amountStr.split('.');

  // Add comma separators to the whole part
  const formattedWholePart = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Return the formatted amount, ensuring to include the decimal part if it exists
  return decimalPart ? `${formattedWholePart}.${decimalPart}` : formattedWholePart;
}