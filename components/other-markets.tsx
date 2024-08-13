"use client";

import React from 'react';
import { Avatar } from '@/components/avatar';
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@/components/table'; // Adjust the import based on your project's structure
import { formatAmount } from '@/utils/formatAmount';

interface OtherMarket {
  name: string;
  slug: string;
  last_trade?: {
    price?: string;
    price_usd?: string;
    market_cap?: string;
    market_cap_usd?: string;
    volume?: string;
    link: string;
    confirmed_at: string;
  };
  quote_asset: {
    symbol: string;
  };
  other_markets?: OtherMarket[];
}

interface OtherMarketsProps {
  markets: OtherMarket[];
}

const OtherMarkets: React.FC<OtherMarketsProps> = ({ markets }) => {
  return (
    <div className="mt-8">
      <Table className="[--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Market</TableHeader>
            <TableHeader>Last Price</TableHeader>
            <TableHeader>Last Price</TableHeader>
            <TableHeader>Market Cap</TableHeader>
            <TableHeader className="text-right">Last Traded</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {markets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-zinc-500 py-24">
                No other markets available.
              </TableCell>
            </TableRow>
          ) : (
            markets.map((market) => (
              <TableRow key={market.slug} href={`/trade/${market.slug}`} title={market.name}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar src={`https://api.xcp.io/img/icon/${market.quote_asset.symbol}`} className="size-6" />
                    <span className="font-medium">{market.name}</span>
                  </div>
                </TableCell>
                <TableCell>{market.last_trade?.price ? `${formatAmount(market.last_trade.price)} ${market.quote_asset.symbol}` : 'N/A'}</TableCell>
                <TableCell>{market.last_trade?.price_usd ? `$${formatAmount(market.last_trade.price_usd, true)}` : 'N/A'}</TableCell>
                <TableCell>{market.last_trade?.market_cap_usd ? `$${formatAmount(market.last_trade.market_cap_usd, true)}` : 'N/A'}</TableCell>
                <TableCell className="text-right">{market.last_trade?.confirmed_at ? `${new Date(market.last_trade.confirmed_at * 1000).toLocaleDateString()}` : 'N/A'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OtherMarkets;
