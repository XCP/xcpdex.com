"use client";

import React, { useState, useEffect } from 'react';
import { Divider } from '@/components/divider';
import { Heading } from '@/components/heading';
import { Button } from '@/components/button';
import { Link } from '@/components/link';
import { Stat } from '@/components/stat';
import { OrderBook } from '@/components/order-book';
import { OrderMatches } from '@/components/order-matches';
import OtherMarkets from '@/components/other-markets';
import ApexChart from '@/components/apex-chart';
import ApexAreaChart from '@/components/apex-areachart';
import { ChevronLeftIcon, PresentationChartBarIcon, PresentationChartLineIcon, CheckBadgeIcon } from '@heroicons/react/16/solid';
import { formatAmount } from '@/utils/formatAmount';

interface TradePageParams {
  params: {
    pair: string;
  };
}

interface TradingPairData {
  last_trade?: {
    confirmed_at: number;
    link: string;
    price?: number;
    price_usd?: number;
  };
  market_cap?: string;
  market_cap_usd?: string;
  base_asset: {
    supply: string;
    locked: boolean;
    issued?: number;
    burned?: number;
  };
  quote_asset: {
    symbol: string;
  };
  other_markets?: OtherMarket[];
}

interface OtherMarket {
  name: string;
  slug: string;
  market_cap?: string;
  market_cap_usd?: string;
  last_trade?: {
    price?: string;
    price_usd?: string;
    volume?: string;
    link: string;
    confirmed_at: number;
  };
  quote_asset: {
    symbol: string;
  };
}

export default function TradePage({ params }: TradePageParams) {
  const tradingPair = params.pair;
  const market = tradingPair.replace('_', '/');
  const [activeInterval, setActiveInterval] = useState('1m');
  const [activeTab, setActiveTab] = useState('area');
  const [baseAsset, setBaseAsset] = useState('');
  const [quoteAsset, setQuoteAsset] = useState('');
  const [pairData, setPairData] = useState<TradingPairData | null>(null);

  useEffect(() => {
    const fetchPairData = async () => {
      try {
        const response = await fetch(`https://api.xcp.io/api/v1/trading-pair/${tradingPair}`);
        const json = await response.json();
        setPairData(json.data);
      } catch (error) {
        console.error('Failed to fetch trading pair data:', error);
      }
    };

    fetchPairData();
  }, [tradingPair]);

  return (
    <>
      <div className="max-lg:hidden">
        <Link href="/trades" className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Markets
        </Link>
      </div>
      <div className="mt-4 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex sm:flex-wrap items-center gap-6">
          <div className="w-20 shrink-0">
            <img className="w-20 aspect-square rounded-lg shadow" src={`https://api.xcp.io/img/full/${baseAsset}`} alt={tradingPair} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
              <Heading>{market}</Heading>
              <CheckBadgeIcon className="size-5 text-blue-500"/>
            </div>
            {pairData?.last_trade && (
              <div className="mt-2 text-sm/6 text-zinc-500">
                Last traded on {new Date(pairData.last_trade.confirmed_at * 1000).toLocaleDateString()} <span aria-hidden="true">·</span>{' '}
                <a href={pairData.last_trade.link} target="_blank" rel="noopener noreferrer">
                  Counterparty
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-4">
          <Button href={`https://www.xcp.io/asset/${baseAsset}`} target="_blank" outline>XCP.io</Button>
          <Button href="#">Trade</Button>
        </div>
      </div>
      <div className="grid gap-6 sm:gap-8 grid-cols-3">
        {pairData ? (
          <>
            <Stat
              title="Last Price"
              value={
                pairData?.last_trade?.price_usd !== undefined
                  ? `$${formatAmount(pairData.last_trade.price_usd, true)}`
                  : pairData?.last_trade?.price !== undefined
                    ? formatAmount(pairData.last_trade.price)
                    : 'N/A'
              }
              subvalue={
                pairData?.last_trade
                  ? `${formatAmount(pairData.last_trade.price || 0)} ${pairData.quote_asset.symbol}`
                  : 'No Trades Yet'
              }
            />
            <Stat
              title="Market Cap"
              value={
                pairData?.market_cap_usd !== undefined
                  ? `$${formatAmount(pairData.market_cap_usd, true)}`
                  : pairData?.market_cap !== undefined
                    ? formatAmount(pairData.market_cap)
                    : 'N/A'
              }
              subvalue={
                pairData?.market_cap !== undefined
                  ? `${formatAmount(pairData.market_cap || 0)} ${pairData.quote_asset.symbol}`
                  : 'No Trades Yet'
              }
            />
            <Stat
              title="Total Supply"
              value={formatAmount(pairData?.base_asset?.supply || 0)}
              subvalue={pairData?.base_asset?.locked ? 'Locked' : 'Unlocked'}
              issued={pairData?.base_asset?.issued || 0}
              burned={pairData?.base_asset?.burned || 0}
            />
          </>
        ) : (
          <p>Loading data...</p>
        )}
      </div>
      {pairData?.other_markets && pairData.other_markets.length > 0 && (
        <OtherMarkets markets={pairData.other_markets} />
      )}
      <div className={`flex justify-between items-center ${pairData?.other_markets && pairData.other_markets.length > 3 ? 'mt-3' : 'mt-8'}`}>
        <div className="flex space-x-2 lg:space-x-4">
          {['1d', '1w', '1m', '1y'].map(interval => (
            <button
              key={interval}
              className={`h-9	px-3 py-2 text-sm font-medium ${activeInterval === interval ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveInterval(interval)}
            >
              {interval}
            </button>
          ))}
        </div>
        <div className="flex space-x-2 lg:space-x-4">
          <button
            className={`h-9	px-3 py-2 text-sm font-medium ${activeTab === 'ohlc' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('ohlc')}
          >
            <PresentationChartBarIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          </button>
          <button
            className={`h-9	px-3 py-2 text-sm font-medium ${activeTab === 'area' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('area')}
          >
            <PresentationChartLineIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          </button>
        </div>
      </div>
      <Divider />
      <div className="mt-4">
        {activeTab === 'ohlc' && <ApexChart pairSlug={tradingPair} interval={activeInterval} />}
        {activeTab === 'area' && <ApexAreaChart pairSlug={tradingPair} interval={activeInterval} />}
      </div>
      <Divider />
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="mt-3 mb-3">Buy Orders</h2>
          <OrderBook market={market} side="buy" setBaseAsset={setBaseAsset} setQuoteAsset={setQuoteAsset} />
        </div>
        <div>
          <h2 className="mt-3 mb-3">Sell Orders</h2>
          <OrderBook market={market} side="sell" setBaseAsset={setBaseAsset} setQuoteAsset={setQuoteAsset} />
        </div>
      </div>
      <Divider />
      <OrderMatches market={market} />
    </>
  );
}
