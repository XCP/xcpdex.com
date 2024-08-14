'use client';

import { Orders } from '@/components/orders';
import { Heading } from '@/components/heading';
import { Select } from '@/components/select';
import { Suspense, useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/16/solid';

export default function OrdersPage() {
  const [status, setStatus] = useState('all');
  const endpoint = 'https://api.counterparty.info/v2/orders';

  return (
    <>
      <div className="mb-8 flex items-center lg:items-end justify-between gap-4">
        <Heading>Orders</Heading>
        <div className="ml-auto w-auto relative">
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
      <Suspense
        fallback={
          <div className="flex flex-col justify-center items-center h-48 my-24">
            <ArrowPathIcon className="h-10 w-10 text-gray-500 animate-spin" />
          </div>
        }
      >
        <Orders endpoint={endpoint} status={status} />
      </Suspense>
    </>
  );
}
