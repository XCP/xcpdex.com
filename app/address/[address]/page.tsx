'use client';

import { Orders } from '@/components/orders';
import { Heading } from '@/components/heading';
import { Select } from '@/components/select';
import { useState } from 'react';

export default function AddressOrdersPage({ params }: { params: { address: string } }) {
  const { address } = params;
  const [status, setStatus] = useState('all');
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
          <Select
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="expired">Expired</option>
            <option value="filled">Filled</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </div>
      <div className="mt-8">
        <Orders endpoint={endpoint} status={status} />
      </div>
    </>
  );
}
