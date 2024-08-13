"use client";

import React, { useState } from 'react';
import { Avatar } from '@/components/avatar';
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@/components/table';
import { formatAmount } from '@/utils/formatAmount';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/16/solid';

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

interface OtherMarketsProps {
  markets: OtherMarket[];
}

const OtherMarkets: React.FC<OtherMarketsProps> = ({ markets }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const displayedMarkets = isExpanded ? markets : markets.slice(0, 3);

  return (
    <div className="mt-8">
      <Table className="[--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Markets</TableHeader>
            <TableHeader>Ratio</TableHeader>
            <TableHeader>Price</TableHeader>
            <TableHeader>Market Cap</TableHeader>
            <TableHeader className="text-right">Last Trade</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayedMarkets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-zinc-500 py-24">
                No other markets available.
              </TableCell>
            </TableRow>
          ) : (
            displayedMarkets.map((market) => (
              <TableRow key={market.slug} href={`/trade/${market.slug}`} title={market.name}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar src={`https://api.xcp.io/img/icon/${market.quote_asset.symbol}`} className="size-6" />
                    <span className="font-medium">{market.name}</span>
                  </div>
                </TableCell>
                <TableCell>{market.last_trade?.price ? `${formatAmount(market.last_trade.price)} ${market.quote_asset.symbol}` : 'N/A'}</TableCell>
                <TableCell>{market.last_trade?.price_usd ? `$${formatAmount(market.last_trade.price_usd, true)}` : 'N/A'}</TableCell>
                <TableCell>{market.market_cap_usd ? `$${formatAmount(market.market_cap_usd, true)}` : 'N/A'}</TableCell>
                <TableCell className="text-right">
                  {market.last_trade?.confirmed_at 
                    ? `${new Date(Number(market.last_trade.confirmed_at) * 1000).toLocaleDateString()}` 
                    : 'N/A'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {markets.length > 3 && (
        <div className="flex justify-center">
          <button
            className="flex items-center justify-center px-10 rounded-b text-zinc-500 hover:text-zinc-950 border border-t-0 hover:bg-zinc-950/5 hover:border-b-zinc-950/10 border-zinc-950/10"
            onClick={toggleExpand}
          >
            {isExpanded ? (
              <>
                <ChevronUpIcon className="size-5" />
              </>
            ) : (
              <>
                <ChevronDownIcon className="size-5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default OtherMarkets;
