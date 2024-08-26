'use client';

import { Orders } from '@/components/orders';
import { Heading } from '@/components/heading';
import { StatusSelect } from '@/components/status-select';
import { Suspense, useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/16/solid';
import { useSearchParams } from 'next/navigation';

function OrdersContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const endpoint = 'https://api.counterparty.info/v2/orders';

  return (
    <>
      <div className="mb-8 flex items-center lg:items-end justify-between gap-4">
        <Heading>Dex Orders</Heading>
        <div className="ml-auto w-auto relative">
          <StatusSelect status={status} setStatus={setStatus} basePath="/orders" />
        </div>
      </div>
      <Orders endpoint={endpoint} status={status} context="trade" />
    </>
  );
}

export default function OrdersPage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="flex flex-col justify-center items-center h-48 my-24">
            <ArrowPathIcon className="h-10 w-10 text-gray-500 animate-spin" />
          </div>
        }
      >
        <OrdersContent />
      </Suspense>
    </>
  );
}
