"use client";

import React, { useState, useEffect } from 'react';
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
}

async function fetchOrderMatches(market: string): Promise<OrderMatch[]> {
  // Split the market pair, reverse the order, and join it back
  const reversedMarket = market.split('/').reverse().join('/');

  // Use the reversed market pair in the URL
  const res = await fetch(`https://api.counterparty.info/v2/orders/${reversedMarket}/matches?status=completed&verbose=true`);
  const data = await res.json();
  return data.result;
}

export function OrderMatches({ market }: OrderMatchesProps) {
  const [matches, setMatches] = useState<OrderMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      setLoading(true);
      const fetchedMatches = await fetchOrderMatches(market);
      setMatches(fetchedMatches);
      setLoading(false);
    }
    loadMatches();
  }, [market]);

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
              <TableHeader>Side</TableHeader>
              <TableHeader>Price</TableHeader>
              <TableHeader>Quantity</TableHeader>
              <TableHeader>Maker</TableHeader>
              <TableHeader className="hidden 2xl:table-cell">Taker</TableHeader>
              <TableHeader>Time</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {matches.length > 0 ? (
              matches.map((match) => {
                // Creating an order-like object to use with utility functions
                const orderLike = {
                  tx_index: match.tx0_index,
                  tx_hash: match.tx0_hash,
                  block_index: match.tx0_block_index,
                  source: match.tx0_address,
                  give_asset: match.forward_asset,
                  give_quantity: match.forward_quantity,
                  give_remaining: 0,
                  get_asset: match.backward_asset,
                  get_quantity: match.backward_quantity,
                  get_remaining: 0,
                  expiration: match.tx0_expiration,
                  expire_index: match.match_expire_index,
                  status: match.status,
                  confirmed: match.confirmed,
                  block_time: match.block_time,
                  give_asset_info: match.forward_asset_info,
                  get_asset_info: match.backward_asset_info,
                  give_quantity_normalized: match.forward_quantity_normalized,
                  get_quantity_normalized: match.backward_quantity_normalized,
                  get_remaining_normalized: '0', // Assuming 0 as a placeholder
                  give_remaining_normalized: '0', // Assuming 0 as a placeholder
                };                

                const direction = getTradingDirection(orderLike);

                return (
                  <TableRow key={match.id}>
                    <TableCell>
                      <Badge color={direction === 'buy' ? 'green' : 'red'} className="capitalize">
                        {direction === 'buy' ? 'Buy' : 'Sell'}
                      </Badge>
                    </TableCell>
                    <TableCell>{calculatePrice(orderLike)}</TableCell>
                    <TableCell>{calculateAmount(orderLike)}</TableCell>
                    <TableCell className="no-ligatures">
                      {match.tx0_address}
                    </TableCell>
                    <TableCell className="no-ligatures hidden 2xl:table-cell">
                      {match.tx1_address}
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
