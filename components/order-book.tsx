"use client";

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import {
  Order,
  calculatePrice,
  calculateAmount,
  calculateTotal,
} from '@/utils/tradingPairUtils';

interface OrderBookProps {
  market: string;
  side: string;
  baseAsset: string;
  quoteAsset: string;
}

export function OrderBook({ market, side, baseAsset, quoteAsset }: OrderBookProps) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`https://api.counterparty.info/v2/orders/${market}?status=open&verbose=true`);
        const json = await response.json();

        if (json.result.length > 0) {
          let sortedOrders = json.result;

          // Sort orders based on the side
          if (side === 'buy') {
            sortedOrders = sortedOrders.sort((a, b) => parseFloat(calculatePrice(b)) - parseFloat(calculatePrice(a)));
          } else if (side === 'sell') {
            sortedOrders = sortedOrders.sort((a, b) => parseFloat(calculatePrice(a)) - parseFloat(calculatePrice(b)));
          }

          setOrders(sortedOrders);
        } else {
          const fallbackResponse = await fetch(`https://api.counterparty.info/v2/orders/${market}?status=all&limit=1&verbose=true`);
          const fallbackJson = await fallbackResponse.json();

          if (fallbackJson.result.length > 0) {
            let sortedOrders = fallbackJson.result;

            // Sort orders based on the side
            if (side === 'buy') {
              sortedOrders = sortedOrders.sort((a, b) => parseFloat(calculatePrice(b)) - parseFloat(calculatePrice(a)));
            } else if (side === 'sell') {
              sortedOrders = sortedOrders.sort((a, b) => parseFloat(calculatePrice(a)) - parseFloat(calculatePrice(b)));
            }

            setOrders(sortedOrders);
          } else {
            console.error('No orders found for the market.');
          }
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }
    };

    fetchOrders();
  }, [market, side]);

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
            <TableHeader>{baseAsset}</TableHeader>
            <TableHeader>{quoteAsset}</TableHeader>
            <TableHeader>Sum&nbsp;({quoteAsset})</TableHeader>
            <TableHeader>Source</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.length > 0 ? orders.map((order, index) => (
            <TableRow key={order.tx_index}>
              <TableCell className={`text-right ${side === 'buy' ? 'text-success' : 'text-danger'}`} title={`${calculatePrice(order)} ${quoteAsset}`}>
                {calculatePrice(order)}
              </TableCell>
              <TableCell className="text-right">{calculateAmount(order)}</TableCell>
              <TableCell className="text-right">{calculateTotal(order)}</TableCell>
              <TableCell className="text-right" title={`${baseSubtotal(index)} ${baseAsset}`}>
                {quoteSubtotal(index)}
              </TableCell>
              <TableCell>
                <a href={`/address/${order.source}`}>{order.source}</a>
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
          {baseSubtotal(orders.length)} {baseAsset}
        </div>
        <div className="col text-right">
          {quoteSubtotal(orders.length)} {quoteAsset}
        </div>
      </div>
    </div>
  );
}
