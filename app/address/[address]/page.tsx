"use client";

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
      <div className="flex items-center lg:items-end justify-between gap-4">
        <Heading>{address}</Heading>
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
      <Orders endpoint={endpoint} status={status} />
    </>
  );
}
