"use client";

import React, { useState, useEffect } from 'react';
import { Divider } from '@/components/divider';
import ApexChart from '@/components/apex-chart';
import ApexAreaChart from '@/components/apex-areachart';
import { Heading } from '@/components/heading';
import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Link } from '@/components/link';
import { ChevronLeftIcon, PresentationChartBarIcon, PresentationChartLineIcon } from '@heroicons/react/16/solid';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import {
  Order,
  assetsToTradingPair,
  getTradingDirection,
  calculatePrice,
  calculateAmount,
  calculateTotal,
} from '@/utils/tradingPairUtils';

interface StatProps {
  title: string;
  value: string | number;
  change: string;
}

function Stat({ title, value, change }: StatProps) {
  return (
    <div>
      <Divider />
      <div className="mt-6 text-lg/6 font-medium sm:text-sm/6">{title}</div>
      <div className="mt-3 text-3xl/8 font-semibold sm:text-2xl/8">{value}</div>
      <div className="mt-3 text-sm/6 sm:text-xs/6">
        <Badge color={change.startsWith('+') ? 'lime' : 'pink'}>{change}</Badge>{' '}
        <span className="text-zinc-500">from last week</span>
      </div>
    </div>
  );
}

interface OrderBookProps {
  market: string;
  side: string;
  setBaseAsset: (asset: string) => void;
  setQuoteAsset: (asset: string) => void;
}

function OrderBook({ market, side, setBaseAsset, setQuoteAsset }: OrderBookProps) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`https://api.counterparty.info/v2/orders/${market}?status=open&verbose=true`);
        const json = await response.json();
        
        // Determine the base and quote assets from the first order
        if (json.result.length > 0) {
          const firstOrder = json.result[0];
          const [base, quote] = assetsToTradingPair(firstOrder);
          setBaseAsset(base);
          setQuoteAsset(quote);
        }

        // Filter and sort orders based on side
        const filteredOrders = json.result
          .filter((order: Order) => {
            const direction = getTradingDirection(order);
            return direction === side;
          })
          .sort((a: Order, b: Order) => {
            const priceA = parseFloat(calculatePrice(a));
            const priceB = parseFloat(calculatePrice(b));
            return side === 'buy' ? priceB - priceA : priceA - priceB;
          });

        setOrders(filteredOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [market, side, setBaseAsset, setQuoteAsset]);

  const baseSubtotal = (index) => {
    return orders.slice(0, index + 1).reduce((sum, order) => sum + parseFloat(order.give_remaining_normalized), 0).toFixed(8);
  };

  const quoteSubtotal = (index) => {
    return orders.slice(0, index + 1).reduce((sum, order) => sum + parseFloat(order.get_remaining_normalized), 0).toFixed(8);
  };

  return (
    <div>
      <Table className="table-responsive order-book">
        <TableHead>
          <TableRow>
            <TableHeader>Price</TableHeader>
            <TableHeader>{orders.length > 0 ? orders[0].give_remaining_normalized : 'Base Asset'}</TableHeader>
            <TableHeader>{orders.length > 0 ? orders[0].get_remaining_normalized : 'Quote Asset'}</TableHeader>
            <TableHeader>Sum&nbsp;({orders.length > 0 ? orders[0].get_remaining_normalized : 'Quote Asset'})</TableHeader>
            <TableHeader>Source</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.length > 0 ? orders.map((order, index) => (
            <TableRow key={order.tx_index}>
              <TableCell className={`text-right ${side === 'buy' ? 'text-success' : 'text-danger'}`} title={`${calculatePrice(order)} ${orders[0].get_remaining_normalized}`}>
                {calculatePrice(order)}
              </TableCell>
              <TableCell className="text-right">{calculateAmount(order)}</TableCell>
              <TableCell className="text-right">{calculateTotal(order)}</TableCell>
              <TableCell className="text-right" title={`${baseSubtotal(index)} ${orders[0].give_remaining_normalized}`}>
                {quoteSubtotal(index)}
              </TableCell>
              <TableCell>
                <a href={`https://xcpdex.com/address/${order.source}`}>{order.source}</a>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell className="text-center" colSpan="5">No {side} orders found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="row mt-1 text-muted">
        <div className="col">
          {baseSubtotal(orders.length)} {orders.length > 0 ? orders[0].give_remaining_normalized : 'Base Asset'}
        </div>
        <div className="col text-right">
          {quoteSubtotal(orders.length)} {orders.length > 0 ? orders[0].get_remaining_normalized : 'Quote Asset'}
        </div>
      </div>
    </div>
  );
}

export default function TradePage({ params }) {
  const tradingPair = params.pair;
  const market = tradingPair.replace('_', '/');
  const [activeInterval, setActiveInterval] = useState('1m'); // default interval
  const [activeTab, setActiveTab] = useState('ohlc'); // default tab
  const [baseAsset, setBaseAsset] = useState('');
  const [quoteAsset, setQuoteAsset] = useState('');

  // Placeholder data for demonstration purposes
  const pairData = {
    status: 'Active',
    lastTrade: '2024-08-10',
    volume24h: '1000',
    priceChange: '+2%',
    totalVolume: '50000',
    totalRevenue: '$1,000,000',
    pageViews: '1500',
    location: 'Exchange XYZ',
  };

  return (
    <>
      <div className="max-lg:hidden">
        <Link href="/trades" className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Markets
        </Link>
      </div>
      <div className="mt-4 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="w-20 shrink-0">
            <img className="w-20 aspect-square rounded-lg shadow" src={`https://api.xcp.io/img/icon/${baseAsset}`} alt={tradingPair} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Heading>{market}</Heading>
              <Badge color={pairData.status === 'Active' ? 'lime' : 'zinc'}>{pairData.status}</Badge>
            </div>
            <div className="mt-2 text-sm/6 text-zinc-500">
              Last trade on {pairData.lastTrade} <span aria-hidden="true">·</span> {pairData.location}
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Button outline>Edit</Button>
          <Button>View</Button>
        </div>
      </div>
      <div className="grid gap-8 sm:grid-cols-3">
        <Stat title="24h Volume" value={pairData.volume24h} change={pairData.priceChange} />
        <Stat title="Total Volume" value={pairData.totalVolume} change={pairData.priceChange} />
        <Stat title="Pageviews" value={pairData.pageViews} change={pairData.priceChange} />
      </div>
      <div className="mt-8 flex justify-between items-center">
        <div className="flex space-x-2 lg:space-x-4">
          {['1d', '1w', '1m', '1y'].map(interval => (
            <button
              key={interval}
              className={`px-3 py-2 text-sm font-medium ${activeInterval === interval ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveInterval(interval)}
            >
              {interval}
            </button>
          ))}
        </div>
        <div className="flex space-x-2 lg:space-x-4">
          <button
            className={`px-3 py-2 text-sm font-medium ${activeTab === 'ohlc' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('ohlc')}
          >
            <PresentationChartBarIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium ${activeTab === 'area' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('area')}
          >
            <PresentationChartLineIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          </button>
        </div>
      </div>
      <Divider />
      <div className="mt-4">
        {activeTab === 'ohlc' && <ApexChart pairSlug={tradingPair} interval={activeInterval} />}
        {activeTab === 'area' && <ApexAreaChart pairSlug={tradingPair} interval={activeInterval} />}
      </div>
      <Divider />
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="mt-3 mb-3">Buy Orders</h2>
          <OrderBook market={market} side="buy" setBaseAsset={setBaseAsset} setQuoteAsset={setQuoteAsset} />
        </div>
        <div>
          <h2 className="mt-3 mb-3">Sell Orders</h2>
          <OrderBook market={market} side="sell" setBaseAsset={setBaseAsset} setQuoteAsset={setQuoteAsset} />
        </div>
      </div>
    </>
  );
}
