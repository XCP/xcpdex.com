'use client';

import React, { useState, useEffect } from 'react';
import { Navbar, NavbarItem, NavbarSection } from '@/components/navbar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import { Avatar } from '@/components/avatar';
import { Badge } from '@/components/badge';
import { Divider } from '@/components/divider';
import { Stat } from '@/components/stat';
import { ArrowPathIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/16/solid';
import { formatAmount } from '@/utils/formatAmount';
import { formatTimeAgo } from '@/utils/formatTimeAgo';
import { Switch, SwitchField } from '@/components/switch';
import { Label, Description } from '@/components/fieldset';
import { Button } from '@/components/button';
import { Text } from '@/components/text';
import { Heading } from '@/components/heading';

interface TradingPair {
  name: string;
  slug: string;
  market_cap?: string;
  market_cap_usd?: string;
  volume_7d_usd?: string;
  volume_30d_usd?: string;
  volume_all_usd?: string;
  last_trade_type?: string;
  last_trade_link?: string;
  last_trade_price?: string;
  last_trade_price_usd?: string;
  last_trade_date?: number;
  [key: `volume_${string}_usd`]: string | undefined;
}

export default function TradingPairsPage() {
  const [activeMarket, setActiveMarket] = useState('BTC');
  const [activeVolume, setActiveVolume] = useState('all'); // Default to all volume
  const [sortKey, setSortKey] = useState('volume_all_usd'); // Default to volume usd
  const [sortOrder, setSortOrder] = useState('desc'); // Default to descending order
  const [qualityFilter, setQualityFilter] = useState(true); // Quality filter switch state
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTradingPairs = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://app.xcp.io/api/v1/trading-pairs/${activeMarket}?volume_range=${activeVolume}&sort_by=${sortKey}&sort_order=${sortOrder}&quality_filter=${qualityFilter}`
        );
        const json = await response.json();
        setTradingPairs(json.result || []);
      } catch (error) {
        console.error('Failed to fetch trading pairs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTradingPairs();
  }, [activeMarket, activeVolume, sortKey, sortOrder, qualityFilter]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      // Toggle sort order if the same key is clicked
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort key and default to descending order
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const renderSortIcon = (key: string) => {
    if (sortKey === key) {
      return sortOrder === 'asc' ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />;
    }
    return null;
  };

  const renderTableHeader = (title: string, key: string) => {
    const isSorted = sortKey === key;
    return (
      <TableHeader onClick={() => handleSort(key)} className={`cursor-pointer ${isSorted ? 'font-semibold' : ''}`}>
        <div className="flex items-center">
          {title}
          {renderSortIcon(key)}
        </div>
      </TableHeader>
    );
  };

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex sm:flex-wrap items-center gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
              <Heading>XCP Dex</Heading>
              <Avatar src={`https://app.xcp.io/img/icon/XCP`} className="size-5" />
            </div>
            <Text className="mt-2">Trade Bitcoin Assets Peer-to-Peer</Text>
          </div>
        </div>
        <div className="flex gap-4">
          <Button href="#" outline>Trade</Button>
          <Button href={`https://www.xcp.io/`} target="_blank">XCP.io</Button>
        </div>
      </div>
      <div className="mb-8 grid gap-6 sm:gap-8 grid-cols-3 2xl:grid-cols-4">
      <Stat
          title="Last Price"
          value={'N/A'}
          subvalue={'N/A'}
        />
        <Stat
          title="Last Price"
          value={'N/A'}
          subvalue={'N/A'}
        />
        <Stat
          title="Last Price"
          value={'N/A'}
          subvalue={'N/A'}
          className="hidden 2xl:block"
        />
        <Stat
          title="Last Price"
          value={'N/A'}
          subvalue={'N/A'}
        />
      </div>
      <Navbar>
        <NavbarSection>
          {['BTC', 'XCP', 'ETH-ETH', 'ETH-WETH', 'ETH-USDC', 'PEPECASH', 'BITCRYSTALS', 'BITCORN'].map((market) => (
            <NavbarItem
              key={market}
              as="button"
              onClick={() => setActiveMarket(market)}
              current={activeMarket === market}
              className={`${
                ['BTC', 'XCP', 'ETH-ETH'].includes(market) ? 'block' : 
                ['BITCRYSTALS', 'BITCORN'].includes(market) ? '2xl:block hidden' :
                'md:block hidden'
              }`} // Show BTC, XCP, ETH-ETH on all screens, BITCRYSTALS and BITCORN only on 2xl screens
            >
              <div className="flex items-center gap-2">
                <Avatar src={`https://app.xcp.io/img/icon/${market.split('-').pop()}`} className="size-6" />
                <span className="font-medium sm:inline hidden">{market.replace('ETH-', '')}</span> {/* Show text only on larger screens */}
              </div>
            </NavbarItem>
          ))}
        </NavbarSection>
        <NavbarSection className="ml-auto">
          {['7d', '30d', 'all'].map((volume) => (
            <NavbarItem
              key={volume}
              as="button"
              onClick={() => {
                setActiveVolume(volume);
                setSortKey(`volume_${volume}_usd`);
              }}
              current={activeVolume === volume}
            >
              <span className="capitalize">{volume}</span>
            </NavbarItem>
          ))}
        </NavbarSection>
      </Navbar>
      <Divider />
      <div className="mt-8">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-48 my-24">
            <ArrowPathIcon className="h-10 w-10 text-gray-500 animate-spin" />
          </div>
        ) : (
          <Table className="[--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
            <TableHead>
              <TableRow>
                {renderTableHeader('Asset', 'slug')}
                {renderTableHeader('Price (USD)', 'last_trade_price_usd')}
                {renderTableHeader(`Volume (${activeVolume.replace('all', 'All')})`, `volume_${activeVolume}_usd`)}
                {renderTableHeader('Market Cap', 'market_cap_usd')}
                <TableHeader>Last Trade</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {tradingPairs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-zinc-500 py-24">
                    No trades for time period.
                  </TableCell>
                </TableRow>
              ) : (
                tradingPairs.map((pair) => (
                  <TableRow key={pair.slug} href={`/trade/${pair.slug}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar src={`https://app.xcp.io/img/icon/${pair.slug.substring(0, pair.slug.lastIndexOf('_'))}`} className="size-6" />
                        <span className="font-medium">{pair.slug.substring(0, pair.slug.lastIndexOf('_'))}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {pair.last_trade_price_usd
                        ? `$${formatAmount(parseFloat(pair.last_trade_price_usd), true)}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {pair[`volume_${activeVolume}_usd`]
                        ? `$${formatAmount(parseFloat(pair[`volume_${activeVolume}_usd`] || '0'), true)}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {pair.market_cap_usd
                        ? `$${formatAmount(parseFloat(pair.market_cap_usd), true)}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge color="sky">
                        {pair.last_trade_type || 'N/A'}
                      </Badge>
                      <span className="ml-2 text-sm text-zinc-500">
                        {pair.last_trade_date ? formatTimeAgo(pair.last_trade_date) : 'N/A'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
      <Divider />
      <div className="mt-8">
        <SwitchField>
          <Label>Quality Filter (beta)</Label>
          <Description>Filters markets with a high degree of spam or wash trades.</Description>
          <Switch name="quality_filter" defaultChecked={qualityFilter} onChange={setQualityFilter} />
        </SwitchField>
      </div>
    </>
  );
}
