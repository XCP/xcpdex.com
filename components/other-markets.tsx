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
  volume_7d_usd?: string;
  volume_30d_usd?: string;
  volume_all_usd?: string;
  last_trade_type?: string;
  last_trade_link?: string;
  last_trade_price?: number;
  last_trade_price_usd?: number;
  last_trade_date?: number;
  quote_asset: {
    symbol: string;
  };
}

interface PairDataProps {
  other_markets: OtherMarket[];
}

const OtherMarkets: React.FC<PairDataProps> = ({ other_markets }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const toggleExpand = () => setIsExpanded((prev) => !prev);

  const displayedMarkets = isExpanded ? other_markets : other_markets.slice(0, 3);

  const formatDate = (timestamp?: number) => {
    return timestamp ? new Date(timestamp * 1000).toLocaleDateString() : 'N/A';
  };

  return (
    <div className="mt-8">
      <Table className="[--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Markets</TableHeader>
            <TableHeader>Ratio</TableHeader>
            <TableHeader>Price</TableHeader>
            <TableHeader className="hidden 2xl:table-cell">Volume</TableHeader>
            <TableHeader>Market Cap</TableHeader>
            <TableHeader className="text-right">Last Trade</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayedMarkets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-zinc-500 py-24">
                No other markets available.
              </TableCell>
            </TableRow>
          ) : (
            displayedMarkets.map((market) => (
              <TableRow key={market.slug} href={`/trade/${market.slug}`} title={market.name}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar src={`https://app.xcp.io/img/icon/${market.quote_asset.symbol}`} className="size-6" />
                    <span className="font-medium">{market.name}</span>
                  </div>
                </TableCell>
                <TableCell>{market.last_trade_price ? `${formatAmount(market.last_trade_price)} ${market.quote_asset.symbol}` : 'N/A'}</TableCell>
                <TableCell>{market.last_trade_price_usd ? `$${formatAmount(market.last_trade_price_usd, true)}` : 'N/A'}</TableCell>
                <TableCell className="hidden 2xl:table-cell">{`$${formatAmount(market.volume_all_usd || '0', true)}`}</TableCell>
                <TableCell>{market.market_cap_usd ? `$${formatAmount(market.market_cap_usd, true)}` : 'N/A'}</TableCell>
                <TableCell className="text-right">
                  {formatDate(market.last_trade_date)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {other_markets.length > 3 && (
        <div className="flex justify-center">
          <button
            aria-label={isExpanded ? 'Collapse markets' : 'Expand markets'}
            className="flex items-center justify-center px-10 rounded-b text-zinc-500 hover:text-zinc-950 border border-t-0 hover:bg-zinc-950/5 hover:border-b-zinc-950/10 border-zinc-950/10"
            onClick={toggleExpand}
          >
            {isExpanded ? <ChevronUpIcon className="size-5" /> : <ChevronDownIcon className="size-5" />}
          </button>
        </div>
      )}
    </div>
  );
};

export default OtherMarkets;
