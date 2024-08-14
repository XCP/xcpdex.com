export function formatTradeType(tradeType: string): string {
  if (tradeType === 'socket.dex-trade.com') return 'Dex-trade.com';

  if (tradeType.includes('_')) {
    // Convert snake case to title case
    return tradeType
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return tradeType.charAt(0).toUpperCase() + tradeType.slice(1);
}
