"use client";

import React, { useState, useEffect } from 'react';
import { Avatar } from '@/components/avatar';
import { Badge } from '@/components/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import { formatAmountTrade } from '@/utils/formatAmountTrade';
import { formatTimeAgo } from '@/utils/formatTimeAgo';
import { formatTradeType } from '@/utils/formatTradeType';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

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

async function fetchTrades(market: string): Promise<{ trades: Trade[], count: number }> {
  const res = await fetch(`https://api.xcp.io/api/v1/trading-pair/${market}/trades`);
  const data = await res.json();
  return { trades: data.result, count: data.result_count };
}

export function TradeHistory({ market, setTradesCount }: TradeHistoryProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrades() {
      setLoading(true);
      const { trades, count } = await fetchTrades(market);
      setTrades(trades);
      setTradesCount(count);
      setLoading(false);
    }
    loadTrades();
  }, [market, setTradesCount]);

  return (
    <>
      <h2 className="sr-only">Trades</h2>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <ArrowPathIcon className="h-10 w-10 text-gray-500 animate-spin" />
        </div>
      ) : (
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
                <TableCell className="text-center" colSpan={5}>No trades found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </>
  );
}

export default TradeHistory;
