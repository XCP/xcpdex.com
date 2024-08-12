"use client";

import React, { useState, useEffect } from 'react';
import { Divider } from '@/components/divider';
import ApexChart from '@/components/apex-chart';
import ApexAreaChart from '@/components/apex-areachart';
import { Heading } from '@/components/heading';
import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Link } from '@/components/link';
import { OrderMatches } from '@/components/order-matches';
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
        // First attempt to fetch open orders
        const response = await fetch(`https://api.counterparty.info/v2/orders/${market}?status=open&verbose=true`);
        const json = await response.json();
    
        // If there are open orders, determine the base and quote assets from the first order
        if (json.result.length > 0) {
          const firstOrder = json.result[0];
          const [base, quote] = assetsToTradingPair(firstOrder);
          setBaseAsset(base);
          setQuoteAsset(quote);
        } else {
          // If no open orders, fetch any order with limit 1 to determine the assets
          const fallbackResponse = await fetch(`https://api.counterparty.info/v2/orders/${market}?status=all&limit=1&verbose=true`);
          const fallbackJson = await fallbackResponse.json();
          
          if (fallbackJson.result.length > 0) {
            const firstOrder = fallbackJson.result[0];
            const [base, quote] = assetsToTradingPair(firstOrder);
            setBaseAsset(base);
            setQuoteAsset(quote);
          } else {
            console.error('No orders found for the market.');
          }
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }
    };    

    fetchOrders();
  }, [market, side, setBaseAsset, setQuoteAsset]);

  const baseSubtotal = (index: number) => {
    return orders.slice(0, index + 1).reduce((sum, order) => sum + parseFloat(order.give_remaining_normalized), 0).toFixed(8);
  };

  const quoteSubtotal = (index: number) => {
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
              <TableCell className="text-center" colSpan={5}>No {side} orders found.</TableCell>
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

interface TradePageParams {
  params: {
    pair: string;
  };
}

export default function TradePage({ params }: TradePageParams) {
  const tradingPair = params.pair;
  const market = tradingPair.replace('_', '/');
  const [activeInterval, setActiveInterval] = useState('1m'); // default interval
  const [activeTab, setActiveTab] = useState('ohlc'); // default tab
  const [baseAsset, setBaseAsset] = useState('');
  const [quoteAsset, setQuoteAsset] = useState('');
  const [pairData, setPairData] = useState(null);

  useEffect(() => {
    const fetchPairData = async () => {
      try {
        const response = await fetch(`https://api.xcp.io/api/v1/trading-pair/${tradingPair}`);
        const json = await response.json();
        setPairData(json.data);
      } catch (error) {
        console.error('Failed to fetch trading pair data:', error);
      }
    };

    fetchPairData();
  }, [tradingPair]);

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
            <img className="w-20 aspect-square rounded-lg shadow" src={`https://api.xcp.io/img/full/${baseAsset}`} alt={tradingPair} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Heading>{market}</Heading>
            </div>
            <div className="mt-2 text-sm/6 text-zinc-500">
              Last trade on {pairData?.last_trade.confirmed_at} <span aria-hidden="true">·</span> {pairData?.last_trade.type}
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Button href={`https://www.xcp.io/asset/${baseAsset}`} target="_blank" outline>XCP.io</Button>
          <Button href="#">Trade</Button>
        </div>
      </div>
      <div className="grid gap-8 sm:grid-cols-3">
        {pairData ? (
          <>
            <Stat title="Last Trade" value={pairData.last_trade.price} />
            <Stat title="30d Volume" value={pairData.volume_30d} />
            <Stat title="Market Cap" value={pairData.market_cap} />
            <Stat title="Total Supply" value={pairData.base_asset.supply} />
          </>
        ) : (
          <p>Loading data...</p> // Optional: Add a loading state or skeleton component
        )}
      </div>
      <div className="mt-8 flex justify-between items-center">
        <div className="flex space-x-2 lg:space-x-4">
          {['1d', '1w', '1m', '1y'].map(interval => (
            <button
              key={interval}
              className={`h-9	px-3 py-2 text-sm font-medium ${activeInterval === interval ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveInterval(interval)}
            >
              {interval}
            </button>
          ))}
        </div>
        <div className="flex space-x-2 lg:space-x-4">
          <button
            className={`h-9	px-3 py-2 text-sm font-medium ${activeTab === 'ohlc' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('ohlc')}
          >
            <PresentationChartBarIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          </button>
          <button
            className={`h-9	px-3 py-2 text-sm font-medium ${activeTab === 'area' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:text-gray-700'}`}
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
      <Divider />
      <OrderMatches market={market} />
    </>
  );
}
