'use client';

import { Dispensers } from '@/components/dispensers';
import { Heading } from '@/components/heading';
import { StatusSelect } from '@/components/status-select';
import { Suspense, useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/16/solid';
import { useSearchParams } from 'next/navigation';

function DispensersContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const endpoint = 'https://api.counterparty.info/v2/dispensers';

  return (
    <>
      <div className="mb-8 flex items-center lg:items-end justify-between gap-4">
        <Heading>Dispensers</Heading>
        <div className="ml-auto w-auto relative">
          <StatusSelect status={status} setStatus={setStatus} basePath="/dispensers" />
        </div>
      </div>
      <Dispensers endpoint={endpoint} status={status} />
    </>
  );
}

export default function DispensersPage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="flex flex-col justify-center items-center h-48 my-24">
            <ArrowPathIcon className="h-10 w-10 text-gray-500 animate-spin" />
          </div>
        }
      >
        <DispensersContent />
      </Suspense>
    </>
  );
}
