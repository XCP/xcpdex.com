'use client';

import { useState, useEffect } from 'react';
import { Avatar } from '@/components/avatar';
import { Badge } from '@/components/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import { formatTimeAgo } from '@/utils/formatTimeAgo';
import { formatAmountTrade } from '@/utils/formatAmountTrade';
import { ArrowPathIcon } from '@heroicons/react/16/solid';
import {
  Pagination,
  PaginationGap,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/components/pagination';
import { useRouter, useSearchParams } from 'next/navigation';

interface AssetInfo {
  asset_longname: string | null;
  description: string;
  issuer: string | null;
  divisible: boolean;
  locked: boolean;
}

interface Dispenser {
  tx_index: number;
  tx_hash: string;
  asset: string;
  asset_info: AssetInfo;
  give_quantity_normalized: string;
  satoshi_price_normalized: string;
  status: number;
  block_time: number;
}

interface DispensersProps {
  endpoint: string;
  status?: string;
}

export function Dispensers({ endpoint, status = 'all' }: DispensersProps) {
  const [dispensers, setDispensers] = useState<Dispenser[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState<number>(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1');
  const limit = 100; // Number of dispensers per page
  const offset = (currentPage * 100) - 100;
  const totalPages = Math.ceil(totalResults / limit);

  useEffect(() => {
    async function fetchDispensers() {
      setLoading(true);
      const res = await fetch(`${endpoint}?verbose=true${status !== 'all' ? `&status=${status}` : ''}&limit=${limit}&offset=${offset}`);
      const data = await res.json();
      setDispensers(data.result as Dispenser[]);
      setTotalResults(data.result_count || 0);
      setLoading(false);
    }

    fetchDispensers();
  }, [endpoint, status, offset]);

  const buildNextHref = () => {
    if (offset + limit < totalResults) {
      return `?status=${status}&page=${currentPage + 1}`;
    }
    return null;
  };

  const buildPreviousHref = () => {
    if (offset > 0) {
      return `?status=${status}&page=${Math.max(currentPage - 1, 1)}`;
    }
    return null;
  };

  const buildPageHref = (page: number) => {
    return `?status=${status}&page=${(page)}`;
  };

  const renderPageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationPage href={buildPageHref(i)} current={i === currentPage} key={i}>
          {i}
        </PaginationPage>
      );
    }

    if (startPage > 1) {
      pages.unshift(<PaginationGap key="start-gap" />);
      pages.unshift(
        <PaginationPage href={buildPageHref(1)} key={1}>
          1
        </PaginationPage>
      );
    }

    if (endPage < totalPages) {
      pages.push(<PaginationGap key="end-gap" />);
      pages.push(
        <PaginationPage href={buildPageHref(totalPages)} key={totalPages}>
          {totalPages}
        </PaginationPage>
      );
    }

    return pages;
  };

  return loading ? (
    <div className="flex flex-col justify-center items-center h-48 my-24">
      <ArrowPathIcon className="h-10 w-10 text-gray-500 animate-spin" />
    </div>
  ) : (
    <>
      <Table className="[--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Side</TableHeader>
            <TableHeader>Market</TableHeader>
            <TableHeader>Amount</TableHeader>
            <TableHeader>Price</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Time</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {dispensers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-zinc-500 py-24">
                No dispensers found.
              </TableCell>
            </TableRow>
          ) : (
            dispensers.map((dispenser) => {
              const statusColor =
                dispenser.status === 0
                  ? 'lime'
                  : dispenser.status === 10
                  ? 'red'
                  : dispenser.status === 11
                  ? 'orange'
                  : 'zinc';

              return (
                <TableRow key={dispenser.tx_index} href={`/trade/${dispenser.asset_info.asset_longname ?? dispenser.asset}_BTC`} title={`Dispenser #${dispenser.tx_index}`}>
                  <TableCell>
                    <Badge color={'red'} className="capitalize">
                      sell
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar src={`https://api.xcp.io/img/icon/${dispenser.asset}`} className="size-6" />
                      <span className="font-medium">{dispenser.asset_info.asset_longname ?? dispenser.asset}/BTC</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="ml-auto font-medium text-right">
                        {formatAmountTrade(dispenser.give_quantity_normalized)}
                      </span>
                      <Avatar src={`https://api.xcp.io/img/icon/${dispenser.asset}`} className="size-6" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="ml-auto font-medium text-right">
                        {formatAmountTrade(dispenser.satoshi_price_normalized)}
                      </span>
                      <Avatar src={`https://api.xcp.io/img/icon/BTC`} className="size-6" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge color={statusColor} className="capitalize">
                      {dispenser.status === 0 ? 'open' : 'closed'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-500">
                    {formatTimeAgo(dispenser.block_time)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      {dispensers.length > 0 && (
        <Pagination className="mt-6">
          <PaginationPrevious href={buildPreviousHref()} />
          <PaginationList className="hidden lg:flex">
            {renderPageNumbers()}
          </PaginationList>
          <PaginationNext href={buildNextHref()} />
        </Pagination>
      )}
    </>
  );
}
