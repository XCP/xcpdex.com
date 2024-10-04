"use client";

import React, { useState, useEffect } from 'react';
import { Avatar } from '@/components/avatar';
import { Heading } from '@/components/heading';
import { Button } from '@/components/button';
import { Link } from '@/components/link';
import { OrderMatches } from '@/components/order-matches';
import { TradeHistory } from '@/components/trade-history';
import { ArrowPathIcon, ChevronLeftIcon } from '@heroicons/react/16/solid';
import { Strong, Text } from '@/components/text'

interface TradeMatchesPageParams {
  params: {
    pair: string;
  };
}

interface TradingPairData {
  last_trade_type?: string;
  last_trade_link?: string;
  last_trade_date?: number;
  base_asset: {
    asset: string;
  };
  quote_asset: {
    symbol: string;
    type: string;
  };
}

export default function TradeMatchesPage({ params }: TradeMatchesPageParams) {
  const tradingPair = params.pair;
  const lastUnderscoreIndex = tradingPair.lastIndexOf('_');
  const market = tradingPair.substring(0, lastUnderscoreIndex) + '/' + tradingPair.substring(lastUnderscoreIndex + 1);
  const [pairData, setPairData] = useState<TradingPairData | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [tradesCount, setTradesCount] = useState<number>(0);

  useEffect(() => {
    const fetchPairData = async () => {
      try {
        const response = await fetch(`https://app.xcp.io/api/v1/trading-pair/${tradingPair}`);
        const json = await response.json();
        setPairData(json);
        setTotalResults(json.result_count || 0);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch trading pair data:', error);
        setLoading(false);
      }
    };

    fetchPairData();
  }, [tradingPair]);

  const isBitcoinOrFiatOrEthereum =
    pairData?.quote_asset.symbol === 'BTC' ||
    pairData?.quote_asset.type === 'fiat' ||
    pairData?.quote_asset.type === 'ethereum';

  return loading ? (
    <div className="flex flex-col justify-center items-center h-48 my-24">
      <ArrowPathIcon className="h-10 w-10 text-gray-500 animate-spin" />
    </div>
  ) : (
    <>
      <div className="max-lg:hidden">
        <Link href={`/trade/${tradingPair}`} className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Go Back
        </Link>
      </div>
      <div className="mt-4 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex sm:flex-wrap items-center gap-6">
          <div className="w-20 shrink-0">
            <img
              className="w-20 aspect-square rounded-lg shadow"
              src={`https://app.xcp.io/img/full/${pairData?.base_asset.asset}`}
              alt={tradingPair}
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
              <Heading>{market}</Heading>
              <Avatar src={`https://app.xcp.io/img/icon/${pairData?.quote_asset.symbol}`} className="size-5" />
            </div>
            {pairData?.last_trade_date && (
              <Text className="mt-2">
                Last traded on <Strong>{new Date(pairData.last_trade_date * 1000).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}</Strong>
              </Text>
            )}
          </div>
        </div>
        <div className="flex gap-4">
          <Button href="#" outline>
            Trade
          </Button>
          <Button href={`https://www.xcp.io/asset/${pairData?.base_asset.asset}`} target="_blank">
            XCP.io
          </Button>
        </div>
      </div>
      <div className="mt-8">
        {pairData &&
          (isBitcoinOrFiatOrEthereum ? (
            <TradeHistory market={tradingPair} setTradesCount={setTradesCount} />
          ) : (
            <OrderMatches market={market} setTradesCount={setTradesCount} />
          ))}
      </div>
    </>
  );
}
