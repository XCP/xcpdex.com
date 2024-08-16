"use client";

import React, { useState, useEffect } from 'react';
import { Avatar } from '@/components/avatar';
import { Badge } from '@/components/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import { formatAmountTrade } from '@/utils/formatAmountTrade';
import { formatTimeAgo } from '@/utils/formatTimeAgo';
import { formatTradeType } from '@/utils/formatTradeType';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import {
  Pagination,
  PaginationGap,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/components/pagination';
import { useRouter, useSearchParams } from 'next/navigation';

interface Trade {
  direction: string;
  type: string;
  price: string;
  price_usd: string | null;
  volume: string;
  link: string;
  confirmed_at: number;
}

interface TradeHistoryProps {
  market: string;
  setTradesCount: (count: number) => void;
}

async function fetchTrades(market: string, limit: number, offset: number): Promise<{ trades: Trade[], count: number }> {
  const res = await fetch(`https://api.xcp.io/api/v1/trading-pair/${market}/trades?limit=${limit}&offset=${offset}`);
  const data = await res.json();
  return { trades: data.result, count: data.result_count };
}

export function TradeHistory({ market, setTradesCount }: TradeHistoryProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState<number>(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = 100; // Number of trades per page
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalResults / limit);

  useEffect(() => {
    async function loadTrades() {
      setLoading(true);
      const { trades, count } = await fetchTrades(market, limit, offset);
      setTrades(trades);
      setTradesCount(count);
      setTotalResults(count);
      setLoading(false);
    }
    loadTrades();
  }, [market, setTradesCount, offset]);

  const buildNextHref = () => {
    if (offset + limit < totalResults) {
      return `/trade/${market}/matches?offset=${offset + limit}`;
    }
    return null;
  };

  const buildPreviousHref = () => {
    if (offset > 0) {
      return `/trade/${market}/matches?offset=${Math.max(offset - limit, 0)}`;
    }
    return null;
  };

  const buildPageHref = (page: number) => {
    return `/trade/${market}/matches?offset=${(page - 1) * limit}`;
  };

  const renderPageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationPage href={buildPageHref(i)} current={i === currentPage} key={i}>
          {i}
        </PaginationPage>
      );
    }

    if (startPage > 1) {
      pages.unshift(<PaginationGap key="start-gap" />);
      pages.unshift(
        <PaginationPage href={buildPageHref(1)} key={1}>
          1
        </PaginationPage>
      );
    }

    if (endPage < totalPages) {
      pages.push(<PaginationGap key="end-gap" />);
      pages.push(
        <PaginationPage href={buildPageHref(totalPages)} key={totalPages}>
          {totalPages}
        </PaginationPage>
      );
    }

    return pages;
  };

  return (
    <>
      <h2 className="sr-only">Trades</h2>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <ArrowPathIcon className="h-10 w-10 text-gray-500 animate-spin" />
        </div>
      ) : (
        <>
          <Table className="table-responsive trades">
            <TableHead>
              <TableRow>
                <TableHeader className="w-14">Side</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Price</TableHeader>
                <TableHeader>Link</TableHeader>
                <TableHeader>Time</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {trades.length > 0 ? (
                trades.map((trade, index) => {
                  const direction = trade.direction.toLowerCase();

                  return (
                    <TableRow key={index} href={trade.link} target="_blank">
                      <TableCell>
                        <Badge color={direction === 'buy' ? 'green' : 'red'} className="capitalize">
                          {direction === 'buy' ? 'Buy' : 'Sell'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="ml-auto font-medium text-right">
                            {formatAmountTrade(trade.volume)}
                          </span>
                          <Avatar src={`https://api.xcp.io/img/icon/${market.split('_')[0]}`} className="size-6" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="ml-auto font-medium text-right">
                            {formatAmountTrade(trade.price)}
                          </span>
                          <Avatar src={`https://api.xcp.io/img/icon/${market.split('_')[1]}`} className="size-6" />
                        </div>
                      </TableCell>
                      <TableCell className="no-ligatures">
                        {formatTradeType(trade.type)}
                      </TableCell>
                      <TableCell className="text-zinc-500">
                        {formatTimeAgo(trade.confirmed_at)}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell className="text-center" colSpan={5}>
                    No trades found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {totalResults > limit && (
            <Pagination className="mt-6">
              <PaginationPrevious href={buildPreviousHref()} />
              <PaginationList className="hidden lg:flex">
                {renderPageNumbers()}
              </PaginationList>
              <PaginationNext href={buildNextHref()} />
            </Pagination>
          )}
        </>
      )}
    </>
  );
}

export default TradeHistory;
