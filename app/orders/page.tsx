"use client";

import { useState, useEffect } from 'react';
import { Avatar } from '@/components/avatar';
import { Badge } from '@/components/badge';
import { Heading } from '@/components/heading';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import { Select } from '@/components/select';
import { formatDistanceToNow } from 'date-fns';
import {
  Order,
  getTradingDirection,
  getBaseAssetString,
  getTradingPairString,
  calculatePrice,
  calculateAmount
} from '@/utils/tradingPairUtils';

async function fetchOrders(status: string): Promise<Order[]> {
  const res = await fetch(`https://api.counterparty.info/v2/orders?verbose=true${status !== 'all' ? `&status=${status}` : ''}`);
  const data = await res.json();
  return data.result;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]); 
  const [status, setStatus] = useState('all');

  useEffect(() => {
    async function loadOrders() {
      const fetchedOrders = await fetchOrders(status);
      setOrders(fetchedOrders);
    }
    loadOrders();
  }, [status]);

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <Heading>Orders</Heading>
        <div className="ml-auto w-auto relative">
          <Select 
            name="status" 
            value={status} 
            onChange={(e) => setStatus(e.target.value)} 
            style={{ width: 'fit-content' }}
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="expired">Expired</option>
            <option value="filled">Filled</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </div>
      <Table className="mt-8 [--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Side</TableHeader>
            <TableHeader>Market</TableHeader>
            <TableHeader>Price</TableHeader>
            <TableHeader className="hidden 2xl:table-cell">Amount</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader className="text-right">Time</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => {
            const direction = getTradingDirection(order);
            const statusColor =
              order.status === 'open'
                ? 'lime'
                : order.status === 'filled'
                ? 'sky'
                : order.status === 'expired'
                ? 'orange'
                : order.status === 'cancelled'
                ? 'red'
                : 'gray';

            return (
              <TableRow key={order.tx_index} href={`/trade/${getTradingPairString(order).replace('/', '_')}`} title={`Order #${order.tx_index}`}>
                <TableCell>
                  <Badge color={direction === 'buy' ? 'green' : 'red'} className="capitalize">{direction}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar src={`https://api.xcp.io/img/icon/${getBaseAssetString(order)}`} className="size-6" />
                    <span className="font-medium">{getTradingPairString(order)}</span>
                  </div>
                </TableCell>
                <TableCell>{calculatePrice(order)} {getTradingPairString(order).split('/')[1]}</TableCell>
                <TableCell className="hidden 2xl:table-cell">{calculateAmount(order)} {getTradingPairString(order).split('/')[0]}</TableCell>
                <TableCell>
                  <Badge color={statusColor} className="capitalize">{order.status}</Badge>
                </TableCell>
                <TableCell className="text-zinc-500 text-right">
                  {formatDistanceToNow(new Date(order.block_time * 1000), { addSuffix: true }).replace('about ', '').replace('seconds ago', 'seconds').replace('minutes ago', 'minutes').replace('hours ago', 'hours')}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
