"use client";

import React, { useState, useEffect } from 'react';
import { Avatar } from '@/components/avatar';
import { Badge } from '@/components/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import { formatTimeAgo } from '@/utils/formatTimeAgo';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { 
  OrderMatch,
  assetsToTradingPair, 
  getTradingPairString, 
  getBaseAssetString, 
  getQuoteAssetString, 
  getTradingDirection, 
  calculatePrice, 
  calculateAmount 
} from '@/utils/tradingPairUtils';

interface OrderMatchesProps {
  market: string;
  setTradesCount: (count: number) => void;
  direction?: string;
}

async function fetchOrderMatches(market: string): Promise<{ matches: OrderMatch[], count: number }> {
  // Split the market pair, reverse the order, and join it back
  const reversedMarket = market.split('/').reverse().join('/');

  // Use the reversed market pair in the URL
  const res = await fetch(`https://api.counterparty.info/v2/orders/${reversedMarket}/matches?status=completed&verbose=true`);
  const data = await res.json();
  return { matches: data.result, count: data.result_count };
}

export function OrderMatches({ market, setTradesCount, direction }: OrderMatchesProps) {
  const [matches, setMatches] = useState<OrderMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      setLoading(true);
      const { matches, count } = await fetchOrderMatches(market);
      setMatches(matches);
      setTradesCount(count);
      setLoading(false);
    }
    loadMatches();
  }, [market, setTradesCount]);

  return (
    <>
      <h2 className="sr-only">Order Matches</h2>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <ArrowPathIcon className="h-10 w-10 text-gray-500 animate-spin" />
        </div>
      ) : (
        <Table className="table-responsive order-matches">
          <TableHead>
            <TableRow>
              <TableHeader className="w-14">Side</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Price</TableHeader>
              <TableHeader>Maker</TableHeader>
              <TableHeader className="hidden 3xl:table-cell">Taker</TableHeader>
              <TableHeader>Time</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {matches.length > 0 ? (
              matches.map((match) => {
                // Creating an order-like object to use with utility functions
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
                        <Avatar src={`https://api.xcp.io/img/icon/${getBaseAssetString(orderLike)}`} className="size-6" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="ml-auto font-medium text-right">
                          {calculatePrice(orderLike)}
                        </span>
                        <Avatar src={`https://api.xcp.io/img/icon/${getQuoteAssetString(orderLike)}`} className="size-6" />
                      </div>
                    </TableCell>
                    <TableCell className="no-ligatures">
                      {market === match.tx1_hash ? match.tx0_address : match.tx1_address}
                    </TableCell>
                    <TableCell className="no-ligatures hidden 3xl:table-cell">
                      {market === match.tx0_hash ? match.tx1_address : match.tx0_address}
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
      )}
    </>
  );
}

export default OrderMatches;
