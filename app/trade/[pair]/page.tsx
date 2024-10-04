"use client";

import React, { useState, useEffect } from 'react';
import { Divider } from '@/components/divider';
import { Heading } from '@/components/heading';
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { Link } from '@/components/link';
import { Stat } from '@/components/stat';
import { OrderBook } from '@/components/order-book';
import { OrderMatches } from '@/components/order-matches';
import { TradeHistory } from '@/components/trade-history';
import OtherMarkets from '@/components/other-markets';
import ApexChart from '@/components/apex-chart';
import ApexAreaChart from '@/components/apex-areachart';
import AssetBalances from '@/components/asset-balances';
import { ChevronLeftIcon, PresentationChartBarIcon, PresentationChartLineIcon, CheckBadgeIcon } from '@heroicons/react/16/solid';
import { Navbar, NavbarItem, NavbarSection } from '@/components/navbar';
import { formatAmount } from '@/utils/formatAmount';
import { Strong, Text } from '@/components/text'

interface TradePageParams {
  params: {
    pair: string;
  };
}

interface TradingPairData {
  market_cap?: string;
  market_cap_usd?: string;
  volume_7d?: string;
  volume_7d_usd?: string;
  volume_30d?: string;
  volume_30d_usd?: string;
  volume_all?: string;
  volume_all_usd?: string;
  last_trade_type?: string;
  last_trade_link?: string;
  last_trade_price?: number;
  last_trade_price_usd?: number;
  last_trade_date?: number;
  base_asset: {
    asset: string;
    symbol: string;
    supply: number;
    issued?: number;
    burned?: number;
    locked: boolean;
  };
  quote_asset: {
    symbol: string;
    type: string;
  };
  other_markets?: OtherMarket[];
}

interface OtherMarket {
  name: string;
  slug: string;
  market_cap?: string;
  market_cap_usd?: string;
  last_trade_type?: string;
  last_trade_link?: string;
  last_trade_price?: number;
  last_trade_price_usd?: number;
  last_trade_date?: number;
  quote_asset: {
    symbol: string;
  };
}

export default function TradePage({ params }: TradePageParams) {
  const tradingPair = params.pair;
  const lastUnderscoreIndex = tradingPair.lastIndexOf('_');
  const market = tradingPair.substring(0, lastUnderscoreIndex) + '/' + tradingPair.substring(lastUnderscoreIndex + 1);
  const [activeInterval, setActiveInterval] = useState('1m');
  const [activeTab, setActiveTab] = useState('area');
  const [activeTable, setActiveTable] = useState('trades');
  const [pairData, setPairData] = useState<TradingPairData | null>(null);
  const [holdersCount, setHoldersCount] = useState<number>(0);
  const [tradesCount, setTradesCount] = useState<number>(0);

  useEffect(() => {
    const fetchPairData = async () => {
      try {
        const response = await fetch(`https://app.xcp.io/api/v1/trading-pair/${tradingPair}`);
        const json = await response.json();
        setPairData(json);
      } catch (error) {
        console.error('Failed to fetch trading pair data:', error);
      }
    };

    fetchPairData();
  }, [tradingPair]);

  const isBitcoinOrFiatOrEthereum = pairData?.quote_asset.symbol === 'BTC' || pairData?.quote_asset.type === 'fiat' || pairData?.quote_asset.type === 'ethereum';
  
  return (
    <>
      <div className="max-lg:hidden">
        <Link href="/" className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Markets
        </Link>
      </div>
      <div className="mt-4 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex sm:flex-wrap items-center gap-6">
          <div className="w-20 shrink-0">
            <img className="w-20 aspect-square rounded-lg shadow" src={`https://app.xcp.io/img/full/${pairData?.base_asset.asset}`} alt={tradingPair} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
              <Heading>{market}</Heading>
              <Avatar src={`https://app.xcp.io/img/icon/${pairData?.quote_asset.symbol}`} className="size-5" />
            </div>
            {
              pairData ? (
                pairData.last_trade_date ? (
                  <Text className="mt-2">
                    Last traded on{' '}
                    <Strong>
                      {new Date(pairData.last_trade_date * 1000).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Strong>
                  </Text>
                ) : (
                  <Text className="mt-2">No trades yet for this pair.</Text>
                )
              ) : null
            }
          </div>
        </div>
        <div className="flex gap-4">
          <Button href="#" outline>Trade</Button>
          <Button href={`https://www.xcp.io/asset/${pairData?.base_asset.asset}`} target="_blank">XCP.io</Button>
        </div>
      </div>
      <div className="grid gap-6 sm:gap-8 grid-cols-3 2xl:grid-cols-4">
        {pairData ? (
          <>
            <Stat
              title="Last Price"
              value={
                pairData?.last_trade_price_usd !== undefined
                  ? `$${formatAmount(pairData.last_trade_price_usd, true)}`
                  : pairData?.last_trade_price !== undefined
                    ? formatAmount(pairData.last_trade_price)
                    : 'N/A'
              }
              subvalue={
                pairData.last_trade_date
                  ? `${formatAmount(pairData.last_trade_price || 0)} ${pairData.quote_asset.symbol}`
                  : 'No Trades Yet'
              }
            />
            <Stat
              title={
                "Volume (All)"
              }
              value={
                `$${formatAmount(pairData.volume_all_usd || '0', true)}`
              }
              subvalue={
                `${formatAmount(pairData.volume_all || '0')} ${pairData.base_asset.symbol}`
              }
              className="hidden 2xl:block"
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
      {pairData?.other_markets && pairData.other_markets.length > 1 && (
        <OtherMarkets 
          other_markets={pairData.other_markets} 
        />
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
      <OrderBook market={market} />
      <Navbar className="mt-8">
        <NavbarSection>
          <NavbarItem
            as="button"
            onClick={() => setActiveTable('trades')}
            current={activeTable === 'trades'}
          >
            Trades {tradesCount > 0 && `(${formatAmount(tradesCount)})`}
          </NavbarItem>
          <NavbarItem
            as="button"
            onClick={() => setActiveTable('holders')}
            current={activeTable === 'holders'}
          >
            Holders {holdersCount > 0 && `(${formatAmount(holdersCount)})`}
          </NavbarItem>
        </NavbarSection>
      </Navbar>
      <Divider />
      <div className="mt-8">
      {activeTable === 'trades' && pairData && (
          isBitcoinOrFiatOrEthereum ? (
            <TradeHistory market={tradingPair} setTradesCount={setTradesCount} />
          ) : (
            <OrderMatches market={market} setTradesCount={setTradesCount} />
          )
        )}
        {activeTable === 'holders' && <AssetBalances asset={pairData?.base_asset?.asset} issued={pairData?.base_asset?.issued || 0} setHoldersCount={setHoldersCount} />}
      </div>
    </>
  );
}
