export function formatAddress(address: string): string {
  if (address.length <= 10) {
      return address;
  }
  const firstPart = address.slice(0, 6);
  const lastPart = address.slice(-4);
  return `${firstPart}...${lastPart}`;
}
