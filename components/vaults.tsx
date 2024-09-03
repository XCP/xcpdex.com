'use client';

import { useState, useEffect } from 'react';
import { Avatar } from '@/components/avatar';
import { Badge } from '@/components/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
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
import { formatAmountSimple } from '@/utils/formatAmountSimple';
import { formatTimeAgo } from '@/utils/formatTimeAgo';
import { formatAddress } from '@/utils/formatAddress';


interface VaultsProps {
  endpoint: string;
  status?: string;
}

interface Vault {
  status: string;
  tx_hash: string;
  trading_pair: {
    slug: string;
    name: string;
    base_asset: {
      symbol: string;
    };
    quote_asset: {
      symbol: string;
    };
  };
  direction: 'sell' | 'buy';
  quantity_remaining: number;
  price: string;
  maker?: string;
  taker?: string;
  originated_at: string;
}

export function Vaults({ endpoint, status = 'active' }: VaultsProps) {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState<number>(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1');
  const limit = 100; // Number of vaults per page
  const totalPages = Math.ceil(totalResults / limit);

  useEffect(() => {
    async function fetchVaults() {
      setLoading(true);
      const res = await fetch(`${endpoint}?page=${currentPage}&status=${status}`);
      const data = await res.json();
      setVaults(data.result || []);
      setTotalResults(data.result_count || 0);
      setLoading(false);
    }

    fetchVaults();
  }, [endpoint, status, currentPage]);

  const buildNextHref = () => {
    if (currentPage < totalPages) {
      return `?status=${status}&page=${currentPage + 1}`;
    }
    return null;
  };

  const buildPreviousHref = () => {
    if (currentPage > 1) {
      return `?status=${status}&page=${currentPage - 1}`;
    }
    return null;
  };

  const buildPageHref = (page: number) => {
    return `?status=${status}&page=${page}`;
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
            <TableHeader className="w-14">Side</TableHeader>
            <TableHeader>Market</TableHeader>
            <TableHeader>Amount</TableHeader>
            <TableHeader>Price</TableHeader>
            <TableHeader className="hidden 2xl:table-cell">Source</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Time</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {vaults.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-zinc-500 py-24">
                No vaults found.
              </TableCell>
            </TableRow>
          ) : (
            vaults.map((vault) => {
              const statusColor =
                vault.status === 'active'
                ? 'lime'
                : vault.status === 'filled'
                ? 'sky'
                : vault.status === 'expired'
                ? 'orange'
                : vault.status === 'cancelled'
                ? 'red'
                : 'zinc';

              return (
                <TableRow key={vault.tx_hash} href={`/trade/${vault.trading_pair.slug}`} title={`Vault ${vault.trading_pair.name}`}>
                  <TableCell>
                    <Badge color={vault.direction === 'sell' ? 'red' : 'green'} className="capitalize">
                      {vault.direction}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar src={`https://api.xcp.io/img/icon/${vault.trading_pair.base_asset.symbol}`} className="size-6" />
                      <span className="font-medium">{vault.trading_pair.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="ml-auto font-medium text-right">
                        {formatAmountSimple(vault.quantity_remaining)}
                      </span>
                      <Avatar src={`https://api.xcp.io/img/icon/${vault.trading_pair.base_asset.symbol}`} className="size-6" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="ml-auto font-medium text-right">
                        {formatAmountSimple(Number(vault.price).toFixed(8))}
                      </span>
                      <Avatar src={`https://api.xcp.io/img/icon/${vault.trading_pair.quote_asset.symbol}`} className="size-6" />
                    </div>
                  </TableCell>
                  <TableCell className="no-ligatures hidden 2xl:table-cell">
                    {formatAddress(vault.maker ?? vault.taker ?? '')}
                  </TableCell>
                  <TableCell>
                    <Badge color={statusColor} className="capitalize">
                      {vault.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-500">
                    {formatTimeAgo(vault.originated_at)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      {vaults.length > 0 && (
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
