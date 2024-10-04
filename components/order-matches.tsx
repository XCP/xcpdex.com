"use client";

import React, { useState, useEffect } from 'react';
import { Avatar } from '@/components/avatar';
import { Badge } from '@/components/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import { formatTimeAgo } from '@/utils/formatTimeAgo';
import { formatAddress } from '@/utils/formatAddress';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { 
  OrderMatch,
  getTradingDirection, 
  calculatePrice, 
  calculateAmount, 
  getBaseAssetString, 
  getQuoteAssetString 
} from '@/utils/tradingPairUtils';
import {
  Pagination,
  PaginationGap,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/components/pagination';
import { useRouter, useSearchParams } from 'next/navigation';

interface OrderMatchesProps {
  market: string;
  setTradesCount: (count: number) => void;
  direction?: string;
}

async function fetchOrderMatches(market: string, limit: number, offset: number): Promise<{ matches: OrderMatch[], count: number }> {
  const reversedMarket = market.split('/').reverse().join('/');
  const res = await fetch(`https://api.counterparty.info/v2/orders/${reversedMarket}/matches?status=completed&verbose=true&limit=${limit}&offset=${offset}`);
  const data = await res.json();
  return { matches: data.result, count: data.result_count };
}

export function OrderMatches({ market, setTradesCount, direction }: OrderMatchesProps) {
  const [matches, setMatches] = useState<OrderMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState<number>(0);
  const lastUnderscoreIndex = market.lastIndexOf('/');
  const tradingPair = market.substring(0, lastUnderscoreIndex) + '_' + market.substring(lastUnderscoreIndex + 1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 100; // Number of matches per page
  const offset = (page - 1) * limit;
  const totalPages = Math.ceil(totalResults / limit);

  useEffect(() => {
    async function loadMatches() {
      setLoading(true);
      const { matches, count } = await fetchOrderMatches(market, limit, offset);
      setMatches(matches);
      setTradesCount(count);
      setTotalResults(count);
      setLoading(false);
    }
    loadMatches();
  }, [market, setTradesCount, offset]);

  const buildNextHref = () => {
    if (page < totalPages) {
      return `/trade/${tradingPair}/history?page=${page + 1}`;
    }
    return null;
  };

  const buildPreviousHref = () => {
    if (page > 1) {
      return `/trade/${tradingPair}/history?page=${page - 1}`;
    }
    return null;
  };

  const buildPageHref = (page: number) => {
    return `/trade/${tradingPair}/history?page=${page}`;
  };

  const renderPageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationPage href={buildPageHref(i)} current={i === page} key={i}>
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
      <h2 className="sr-only">Order Matches</h2>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <ArrowPathIcon className="h-10 w-10 text-gray-500 animate-spin" />
        </div>
      ) : (
        <>
          <Table className="table-responsive order-matches">
            <TableHead>
              <TableRow>
                <TableHeader className="w-14">Side</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Price</TableHeader>
                <TableHeader>Maker</TableHeader>
                <TableHeader className="hidden 2xl:table-cell">Taker</TableHeader>
                <TableHeader>Time</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {matches.length > 0 ? (
                matches.map((match) => {
                  const orderLike = {
                    tx_index: match.tx1_index,
                    tx_hash: match.tx1_hash,
                    block_index: match.tx1_block_index,
                    source: match.tx1_address,
                    give_asset: match.backward_asset,
                    give_quantity: match.backward_quantity,
                    give_remaining: 0,
                    get_asset: match.forward_asset,
                    get_quantity: match.forward_quantity,
                    get_remaining: 0,
                    expiration: match.tx1_expiration,
                    expire_index: match.match_expire_index,
                    status: match.status,
                    confirmed: match.confirmed,
                    block_time: match.block_time,
                    give_asset_info: match.backward_asset_info,
                    get_asset_info: match.forward_asset_info,
                    give_quantity_normalized: match.backward_quantity_normalized,
                    get_quantity_normalized: match.forward_quantity_normalized,
                    get_remaining_normalized: '0', // Assuming 0 as a placeholder
                    give_remaining_normalized: '0', // Assuming 0 as a placeholder
                  };                

                  const matchDirection = direction 
                  ? direction === 'sell' 
                    ? 'buy' 
                    : direction === 'buy' 
                      ? 'sell' 
                      : getTradingDirection(orderLike)
                  : getTradingDirection(orderLike);
                
                  return (
                    <TableRow key={match.id} href={`/orders/${market === match.tx1_hash ? match.tx0_hash : match.tx1_hash}`}>
                      <TableCell>
                        <Badge color={matchDirection === 'buy' ? 'green' : 'red'} className="capitalize">
                          {matchDirection === 'buy' ? 'Buy' : 'Sell'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="ml-auto font-medium text-right">
                            {calculateAmount(orderLike)}
                          </span>
                          <Avatar src={`https://app.xcp.io/img/icon/${getBaseAssetString(orderLike)}`} className="size-6" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="ml-auto font-medium text-right">
                            {calculatePrice(orderLike)}
                          </span>
                          <Avatar src={`https://app.xcp.io/img/icon/${getQuoteAssetString(orderLike)}`} className="size-6" />
                        </div>
                      </TableCell>
                      <TableCell className="no-ligatures">
                        {formatAddress(market === match.tx1_hash ? match.tx0_address : match.tx1_address)}
                      </TableCell>
                      <TableCell className="no-ligatures hidden 2xl:table-cell">
                        {formatAddress(market === match.tx0_hash ? match.tx1_address : match.tx0_address)}
                      </TableCell>
                      <TableCell className="text-zinc-500">
                        {formatTimeAgo(match.block_time)}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell className="text-center" colSpan={6}>No matches found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {totalResults > 100 && (
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

export default OrderMatches;
