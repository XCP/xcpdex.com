"use client";

import React from 'react';
import { Divider } from '@/components/divider'
import Chart from '@/components/chart';
import ApexChart from '@/components/apex-chart';
import ApexAreaChart from '@/components/apex-areachart';
import { Heading, Subheading } from '@/components/heading';
import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Link } from '@/components/link';
import { ChevronLeftIcon } from '@heroicons/react/16/solid';

function Stat({ title, value, change }: { title: string; value: string; change: string }) {
  return (
    <div>
      <Divider />
      <div className="mt-6 text-lg/6 font-medium sm:text-sm/6">{title}</div>
      <div className="mt-3 text-3xl/8 font-semibold sm:text-2xl/8">{value}</div>
      <div className="mt-3 text-sm/6 sm:text-xs/6">
        <Badge color={change.startsWith('+') ? 'lime' : 'pink'}>{change}</Badge>{' '}
        <span className="text-zinc-500">from last week</span>
      </div>
    </div>
  )
}

export default function TradePage({ params }: { params: { pair: string } }) {
  const tradingPair = params.pair;
  
  // Placeholder data for demonstration purposes
  const pairData = {
    status: 'Active',
    lastTrade: '2024-08-10',
    volume24h: '1000',
    priceChange: '+2%',
    totalVolume: '50000',
    totalRevenue: '$1,000,000',
    pageViews: '1500',
    location: 'Exchange XYZ',
  };

  return (
    <>
      <div className="max-lg:hidden">
        <Link href="/trades" className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Trading Pairs
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="w-32 shrink-0">
            <img className="aspect-[3/2] rounded-lg shadow" src={`https://api.xcp.io/img/full/default.png`} alt={tradingPair} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Heading>{tradingPair}</Heading>
              <Badge color={pairData.status === 'Active' ? 'lime' : 'zinc'}>{pairData.status}</Badge>
            </div>
            <div className="mt-2 text-sm/6 text-zinc-500">
              Last trade on {pairData.lastTrade} <span aria-hidden="true">·</span> {pairData.location}
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Button outline>Edit</Button>
          <Button>View</Button>
        </div>
      </div>
      <div className="mt-8 grid gap-8 sm:grid-cols-3">
        <Stat title="24h Volume" value={pairData.volume24h} change={pairData.priceChange} />
        <Stat title="Total Volume" value={pairData.totalVolume} change={pairData.priceChange} />
        <Stat title="Pageviews" value={pairData.pageViews} change={pairData.priceChange} />
      </div>
      <div className="mt-8">
        <ApexChart pairName={tradingPair} />
      </div>
      <div className="mt-8">
        <ApexAreaChart pairName={tradingPair} />
      </div>
    </>
  );
}
