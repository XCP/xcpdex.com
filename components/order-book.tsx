"use client";

import React, { useState, useEffect } from 'react';
import { Avatar } from '@/components/avatar';
import { Subheading } from '@/components/heading'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { 
  Order,
  getTradingDirection,
  calculatePrice,
  calculatePricePlain,
  calculateAmount,
  calculateTotal,
  getBaseAssetString, 
  getQuoteAssetString 
} from '@/utils/tradingPairUtils';

interface OrderMatchesProps {
  market: string;
}

async function fetchOrders(market: string): Promise<Order[]> {
  const reversedMarket = market.split('/').reverse().join('/');
  const res = await fetch(`https://api.counterparty.info/v2/orders/${reversedMarket}?status=open&verbose=true`);
  const data = await res.json();
  return data.result;
}

export function OrderBook({ market }: OrderMatchesProps) {
  const [buys, setBuys] = useState<Order[]>([]);
  const [sells, setSells] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      const orders = await fetchOrders(market);
      
      // Split into buys and sells
      const buyOrders = orders.filter(order => getTradingDirection(order) === 'buy');
      const sellOrders = orders.filter(order => getTradingDirection(order) === 'sell');

      // Sort buys high to low and sells low to high
      buyOrders.sort((a, b) => parseFloat(calculatePricePlain(b)) - parseFloat(calculatePricePlain(a)));
      sellOrders.sort((a, b) => parseFloat(calculatePricePlain(a)) - parseFloat(calculatePricePlain(b)));

      setBuys(buyOrders);
      setSells(sellOrders);
      setLoading(false);
    }
    loadOrders();
  }, [market]);

  const renderTable = (orders: Order[], type: string) => {
    let runningTotal = 0; // Initialize the running total
  
    return (
      <Table className="mt-4 table-responsive order-table">
        <TableHead>
          <TableRow>
            <TableHeader>Price</TableHeader>
            <TableHeader>Amount</TableHeader>
            <TableHeader>Total</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.length > 0 ? (
            orders.map((order) => {
              const amount = parseFloat(calculateTotal(order)); // Get the amount for the order
              runningTotal += amount; // Update the running total
  
              return (
                <TableRow key={order.tx_index} href={`/orders/${order.tx_hash}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="ml-auto font-medium text-right">
                        {calculatePrice(order)}
                      </span>
                      <Avatar src={`https://api.xcp.io/img/icon/${getQuoteAssetString(order)}`} className="size-6" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="ml-auto font-medium text-right">
                        {calculateAmount(order)}
                      </span>
                      <Avatar src={`https://api.xcp.io/img/icon/${getBaseAssetString(order)}`} className="size-6" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="ml-auto font-medium text-right">
                        {runningTotal.toFixed(8)}
                      </span>
                      <Avatar src={`https://api.xcp.io/img/icon/${getQuoteAssetString(order)}`} className="size-6" />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell className="text-center" colSpan={3}>No {type} orders found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      <h2 className="sr-only">Order Book</h2>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <ArrowPathIcon className="h-10 w-10 text-gray-500 animate-spin" />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Subheading>Buy Orders</Subheading>
            {renderTable(buys, 'buy')}
          </div>
          <div>
            <Subheading>Sell Orders</Subheading>
            {renderTable(sells, 'sell')}
          </div>
        </div>
      )}
    </>
  );
}

export default OrderBook;
