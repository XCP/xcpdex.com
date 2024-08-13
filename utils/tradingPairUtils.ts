import BigNumber from 'bignumber.js';

export interface AssetInfo {
  asset_longname: string | null;
  description: string;
  issuer: string | null;
  divisible: boolean;
  locked: boolean;
}

export interface Order {
  give_asset: string;
  give_quantity: number;
  give_remaining: number;
  get_asset: string;
  get_quantity: number;
  get_remaining: number;
  expiration: number;
  expire_index: number;
  fee_required: number;
  fee_required_remaining: number;
  fee_provided: number;
  fee_provided_remaining: number;
  status: string;
  confirmed: boolean;
  block_time: number;
  give_asset_info: AssetInfo;
  get_asset_info: AssetInfo;
  give_quantity_normalized: string;
  get_quantity_normalized: string;
  get_remaining_normalized: string;
  give_remaining_normalized: string;
  fee_provided_normalized: string;
  fee_required_normalized: string;
  fee_required_remaining_normalized: string;
  fee_provided_remaining_normalized: string;
}

export interface OrderMatch {
  id: string;
  market_pair: string;
  market_dir: string;
  market_price: string;
  forward_asset: string;
  forward_quantity_normalized: string;
  backward_asset: string;
  backward_quantity_normalized: string;
  block_time: number;
  tx0_address: string;
  tx1_address: string;
  forward_asset_info: AssetInfo;
  backward_asset_info: AssetInfo;
}

const quoteAssets: string[] = [
  'BTC', 'XCP', 'XBTC', 'FLDC', 'SJCX', 'BITCRYSTALS', 'LTBCOIN', 'SCOTCOIN',
  'PEPECASH', 'BITCORN', 'CORNFUTURES', 'NEWBITCORN', 'DATABITS', 'MAFIACASH',
  'PENISIUM', 'RUSTBITS', 'WILLCOIN', 'XFCCOIN', 'SOVEREIGNC', 'OLINCOIN',
  'BITROCK', 'DANKMEMECASH', 'COMMONFROG.PURCHASE', 'PEPSTEIN.HUSHMONEY',
  'SCUDOCOIN', 'GREEEEEECOIN', 'MOULACOIN', 'LICKOIN', 'IAMCOIN', 'NEOCASH',
  'RELICASH', 'SHADILAYCASH', 'BLUEBEARCASH', 'FAKEAPECASH', 'DANKROSECASH',
  'DESANTISCASH', 'DOLLARCASH', 'BOBOCASH', 'SHARPS', 'CRONOS', 'BOBOXX', 'SWARM',
  'DABC', 'KEKO', 'NVST', 'POWC', 'NOJAK', 'NOMNI', 'BASSMINT', 'RAIZER.BTC', 
  'RAIZER', 'FUUUUUH.BTC', 'FUUUUUH', 'WOOOOK', 'VACUS', 'MUUI', 'FUTURECREDIT'
];

const quoteKeywords: string[] = ['CASH', 'COIN', 'MONEY', 'BTC'];

const getQuoteRank = (symbol: string): number => {
  const index = quoteAssets.indexOf(symbol);
  return index !== -1 ? index : quoteAssets.length;
};

const isQuoteAssetDirect = (symbol: string): boolean => {
  return quoteAssets.includes(symbol);
};

const isQuoteAssetFallback = (symbol: string): boolean => {
  return quoteKeywords.some(keyword => symbol.toUpperCase().includes(keyword));
};

const getAssetSymbol = (assetInfo: AssetInfo, fallback: string): string => {
  return assetInfo.asset_longname ? assetInfo.asset_longname : fallback;
};

export function assetsToTradingPair(order: Order, useRawAssets: boolean = false): [string, string] {
  const giveSymbol = getAssetSymbol(order.give_asset_info, order.give_asset);
  const getSymbol = getAssetSymbol(order.get_asset_info, order.get_asset);

  let baseSymbol: string, quoteSymbol: string;

  if (isQuoteAssetDirect(giveSymbol) && isQuoteAssetDirect(getSymbol)) {
    [baseSymbol, quoteSymbol] = getQuoteRank(giveSymbol) < getQuoteRank(getSymbol) ? [getSymbol, giveSymbol] : [giveSymbol, getSymbol];
  } else if (isQuoteAssetDirect(giveSymbol)) {
    [baseSymbol, quoteSymbol] = [getSymbol, giveSymbol];
  } else if (isQuoteAssetDirect(getSymbol)) {
    [baseSymbol, quoteSymbol] = [giveSymbol, getSymbol];
  } else if (isQuoteAssetFallback(giveSymbol) && isQuoteAssetFallback(getSymbol)) {
    [baseSymbol, quoteSymbol] = getQuoteRank(giveSymbol) < getQuoteRank(getSymbol) ? [getSymbol, giveSymbol] : [giveSymbol, getSymbol];
  } else if (isQuoteAssetFallback(giveSymbol)) {
    [baseSymbol, quoteSymbol] = [getSymbol, giveSymbol];
  } else if (isQuoteAssetFallback(getSymbol)) {
    [baseSymbol, quoteSymbol] = [giveSymbol, getSymbol];
  } else {
    [baseSymbol, quoteSymbol] = giveSymbol < getSymbol ? [giveSymbol, getSymbol] : [getSymbol, giveSymbol];
  }

  if (useRawAssets) {
    return (baseSymbol === giveSymbol) ? [order.give_asset, order.get_asset] : [order.get_asset, order.give_asset];
  }

  return [baseSymbol, quoteSymbol];
}

export function getTradingPairString(order: Order): string {
  const [base, quote] = assetsToTradingPair(order);
  return `${base}/${quote}`;
}

export function getBaseAssetString(order: Order): string {
  const [base] = assetsToTradingPair(order);
  return base;
}

export function getQuoteAssetString(order: Order): string {
  const [quote] = assetsToTradingPair(order);
  return quote;
}

export function getTradingDirection(order: Order): 'buy' | 'sell' {
  const [, quote] = assetsToTradingPair(order, true);
  return order.give_asset === quote ? 'buy' : 'sell';
}

export function calculatePrice(order: Order): string {
  const [baseSymbol, quoteSymbol] = assetsToTradingPair(order);
  const baseQuantity = new BigNumber(order.give_asset === baseSymbol ? order.give_quantity_normalized : order.get_quantity_normalized);
  const quoteQuantity = new BigNumber(order.give_asset === quoteSymbol ? order.give_quantity_normalized : order.get_quantity_normalized);
  const price = quoteQuantity.dividedBy(baseQuantity);
  return price.toFixed(8);
}

export function calculateAmount(order: Order): string {
  const [baseSymbol] = assetsToTradingPair(order);
  const baseQuantity = new BigNumber(order.give_asset === baseSymbol ? order.give_quantity_normalized : order.get_quantity_normalized);
  return baseQuantity.toFixed(8);
}

export function calculateTotal(order: Order): string {
  const [, quoteSymbol] = assetsToTradingPair(order);
  const quoteQuantity = new BigNumber(order.give_asset === quoteSymbol ? order.give_quantity_normalized : order.get_quantity_normalized);
  return quoteQuantity.toFixed(8);
}