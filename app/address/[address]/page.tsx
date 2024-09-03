'use client';

import { Stat } from '@/components/stat';
import { Orders } from '@/components/orders';
import { Heading } from '@/components/heading';
import { StatusSelect } from '@/components/status-select';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatAmount } from '@/utils/formatAmount';

export default function AddressOrdersPage({ params }: { params: { address: string } }) {
  const { address } = params;
  const searchParams = useSearchParams();
  
  // Initialize status from the URL if it exists, otherwise default to 'all'
  const [status, setStatus] = useState(searchParams.get('status') || 'all');

  // State to hold the data fetched from the API
  const [data, setData] = useState({
    makerVolume: 'N/A',
    takerVolume: 'N/A',
    totalTrades: 'N/A',
    lastTradeDate: 'N/A'
  });

  // Fetch data from the API when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://api.xcp.io/api/v1/address/${address}`);
        const result = await response.json();

        const formattedDate = result.last_trade_date
        ? new Date(result.last_trade_date).toLocaleDateString('en-CA') // Formats date as YYYY-MM-DD
        : 'N/A';

        setData({
          makerVolume: result.maker_volume_usd,
          takerVolume: result.taker_volume_usd,
          totalTrades: result.total_trades,
          lastTradeDate: formattedDate,
        });
      } catch (error) {
        console.error('Error fetching address data:', error);
      }
    };

    fetchData();
  }, [address]);

  const endpoint = `https://api.counterparty.info/v2/addresses/${address}/orders`;

  return (
    <>
      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4">
        <div className="w-full lg:w-auto">
          <Heading className="lg:hidden">Address</Heading>
          <Heading className="hidden lg:block no-ligatures">{address}</Heading>
          <div className="mt-2 text-sm text-zinc-500 lg:hidden no-ligatures">
            {address}
          </div>
        </div>
        <div className="w-full lg:w-auto mt-4 lg:mt-0">
          <StatusSelect status={status} setStatus={setStatus} basePath={`/address/${address}`} />
        </div>
      </div>
      <div className="mt-8 grid gap-6 sm:gap-8 grid-cols-3 2xl:grid-cols-4">
        <Stat
          title="Maker Volume"
          value={`$${formatAmount(data.makerVolume, true)}`}
        />
        <Stat
          title="Taker Volume"
          value={`$${formatAmount(data.takerVolume, true)}`}
        />
        <Stat
          title="Total Trades"
          value={formatAmount(data.totalTrades)}
        />
        <Stat
          title="Last Trade"
          value={data.lastTradeDate}
          className="hidden 2xl:block"
        />
      </div>
      <div className="mt-8">
        <Orders endpoint={endpoint} status={status} />
      </div>
    </>
  );
}
