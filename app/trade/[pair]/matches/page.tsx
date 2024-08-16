"use client";

import React, { useState, useEffect } from 'react';
import { Divider } from '@/components/divider';
import { Heading } from '@/components/heading';
import { Button } from '@/components/button';
import { Link } from '@/components/link';
import { OrderMatches } from '@/components/order-matches';
import { TradeHistory } from '@/components/trade-history';
import { ArrowPathIcon, ChevronLeftIcon, CheckBadgeIcon } from '@heroicons/react/16/solid';
import {
  Pagination,
  PaginationGap,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/components/pagination';
import { useRouter, useSearchParams } from 'next/navigation';

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
  const market = tradingPair.replace('_', '/');
  const [pairData, setPairData] = useState<TradingPairData | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [tradesCount, setTradesCount] = useState<number>(0);

  useEffect(() => {
    const fetchPairData = async () => {
      try {
        const response = await fetch(`https://api.xcp.io/api/v1/trading-pair/${tradingPair}`);
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
              src={`https://api.xcp.io/img/full/${pairData?.base_asset.asset}`}
              alt={tradingPair}
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
              <Heading>{market}</Heading>
              <CheckBadgeIcon className="size-5 text-blue-500" />
            </div>
            {pairData?.last_trade_date && (
              <div className="mt-2 text-sm/6 text-zinc-500">
                Last traded on {new Date(pairData.last_trade_date * 1000).toLocaleDateString()}{' '}
              </div>
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
