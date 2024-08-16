'use client';

import { Select } from '@/components/select';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface StatusSelectProps {
  status: string;
  setStatus: (status: string) => void;
  basePath: string;
}

export function StatusSelect({ status, setStatus, basePath }: StatusSelectProps) {
  const router = useRouter();

  useEffect(() => {
    // Update the URL when the status changes
    router.push(`${basePath}?status=${status}`);
  }, [status, basePath]);

  return (
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
  );
}
