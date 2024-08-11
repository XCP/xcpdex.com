"use client";

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import { formatDistanceToNow } from 'date-fns';
import { ArrowPathIcon } from '@heroicons/react/16/solid';

interface Match {
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
}

interface OrderMatchesProps {
  market: string;
}

async function fetchOrderMatches(market: string): Promise<Match[]> {
  // Split the market pair, reverse the order, and join it back
  const reversedMarket = market.split('/').reverse().join('/');

  // Use the reversed market pair in the URL
  const res = await fetch(`https://api.counterparty.info/v2/orders/${reversedMarket}/matches?status=completed&verbose=true`);
  const data = await res.json();
  return data.result;
}

export function OrderMatches({ market }: OrderMatchesProps) {
  const [matches, setMatches] = useState<Match[]>([]);
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
      <h2 className="mt-8 mb-4">Order Matches</h2>
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
              <TableHeader>Asset</TableHeader>
              <TableHeader>Counterparty</TableHeader>
              <TableHeader>Time</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {matches.length > 0 ? (
              matches.map((match) => (
                <TableRow key={match.id}>
                  <TableCell>
                    <Badge color={match.market_dir === 'BUY' ? 'green' : 'red'} className="capitalize">
                    {match.market_dir === 'BUY' ? 'Buy' : 'Sell'}
                    </Badge>
                  </TableCell>
                  <TableCell>{match.market_price}</TableCell>
                  <TableCell>{match.market_dir === 'BUY' ? match.backward_quantity_normalized : match.forward_quantity_normalized}</TableCell>
                  <TableCell>{match.market_dir === 'BUY' ? match.backward_asset : match.forward_asset}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <a href={`https://xcpdex.com/address/${match.tx0_address}`}>{match.tx0_address}</a>
                      <a href={`https://xcpdex.com/address/${match.tx1_address}`}>{match.tx1_address}</a>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-500">
                    {formatDistanceToNow(new Date(match.block_time * 1000), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))
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
