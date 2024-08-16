'use client';

import { Orders } from '@/components/orders';
import { Heading } from '@/components/heading';
import { StatusSelect } from '@/components/status-select';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AddressOrdersPage({ params }: { params: { address: string } }) {
  const { address } = params;
  const searchParams = useSearchParams();
  
  // Initialize status from the URL if it exists, otherwise default to 'all'
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  
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
          <StatusSelect status={status} setStatus={setStatus} basePath={`/address/${address}/orders`} />
        </div>
      </div>
      <div className="mt-8">
        <Orders endpoint={endpoint} status={status} />
      </div>
    </>
  );
}
