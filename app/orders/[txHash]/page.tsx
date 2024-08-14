'use client';

import { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { Avatar } from '@/components/avatar';
import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Divider } from '@/components/divider';
import { Heading, Subheading } from '@/components/heading';
import { Link } from '@/components/link';
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/components/description-list';
import { BanknotesIcon, CalendarIcon, ChevronLeftIcon, CreditCardIcon } from '@heroicons/react/16/solid';
import { Order, getTradingPairString, getTradingPairSlug, getTradingDirection, getBaseAssetString, getQuoteAssetString, calculatePrice, calculateAmount, calculateTotal } from '@/utils/tradingPairUtils';

export default function OrderPage({ params }: { params: { txHash: string } }) {
  const { txHash } = params;
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      const response = await fetch(`https://api.counterparty.info/v2/orders/${txHash}?verbose=true`);
      const data = await response.json();

      if (data.result) {
        setOrder(data.result);
      }
    }

    fetchOrder();
  }, [txHash]);

  if (!order) {
    return <div>Loading...</div>;
  }

  const statusColor =
    order.status === 'open'
      ? 'lime'
      : order.status === 'filled'
      ? 'sky'
      : order.status === 'expired'
      ? 'orange'
      : order.status === 'cancelled'
      ? 'red'
      : 'zinc';

  const baseAssetSymbol = getBaseAssetString(order);
  const quoteAssetSymbol = getQuoteAssetString(order);
  const price = calculatePrice(order);
  const amount = calculateAmount(order);
  const total = calculateTotal(order);
  const direction = getTradingDirection(order);

  return (
    <>
      <div className="max-lg:hidden">
        <Link href="/orders" className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Orders
        </Link>
      </div>
      <div className="mt-4 lg:mt-6">
        <div className="flex items-center gap-4">
          <Heading>Order #{order.tx_index}</Heading>
          <Badge color={statusColor} className="capitalize">{order.status}</Badge>
        </div>
        <div className="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
          <div className="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
            <span className="flex items-center gap-3 text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white">
              <CalendarIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
              <span>
                {new Intl.DateTimeFormat('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }).format(new Date(order.block_time * 1000))}{" at "}
                {new Intl.DateTimeFormat('en-US', {
                  hour: 'numeric',
                  minute: 'numeric',
                  second: 'numeric',
                  hour12: true,
                }).format(new Date(order.block_time * 1000))}
              </span>
            </span>
          </div>
          <div className="flex gap-4">
            <Button href="#" outline>Match</Button>
            <Button href={`https://www.xcp.io/tx/${order.tx_hash}`} target="_blank">XCP.io</Button>
          </div>
        </div>
      </div>
      <div className="mt-12">
        <Subheading>Summary</Subheading>
        <Divider className="mt-4" />
        <DescriptionList>
          <DescriptionTerm>
            Market
            <Badge color={direction === 'buy' ? 'green' : 'red'} className="ml-2 capitalize">
              {direction}
            </Badge>
          </DescriptionTerm>
          <DescriptionDetails>
            <Link href={`/trade/${getTradingPairSlug(order)}`} className="flex items-center gap-2">
              <Avatar src={`https://api.xcp.io/img/icon/${baseAssetSymbol}`} className="size-6" />
              <span className="font-medium">{getTradingPairString(order)}</span>
            </Link>
          </DescriptionDetails>
          <DescriptionTerm>Source</DescriptionTerm>
          <DescriptionDetails>
            <Link href={`/address/${order.source}`}>
              <span className="font-medium">{order.source}</span>
            </Link>
          </DescriptionDetails>
          <DescriptionTerm>Price</DescriptionTerm>
          <DescriptionDetails>{price} {quoteAssetSymbol}</DescriptionDetails>
          <DescriptionTerm>Amount</DescriptionTerm>
          <DescriptionDetails>{amount} {baseAssetSymbol}</DescriptionDetails>
          <DescriptionTerm>Total</DescriptionTerm>
          <DescriptionDetails>{total} {quoteAssetSymbol}</DescriptionDetails>
        </DescriptionList>
      </div>
      <div className="mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <Subheading>Base Asset</Subheading>
            <Divider className="mt-4" />
            <DescriptionList>
              <DescriptionTerm>Asset</DescriptionTerm>
              <DescriptionDetails>{baseAssetSymbol}</DescriptionDetails>
              <DescriptionTerm>Description</DescriptionTerm>
              <DescriptionDetails>{order.give_asset_info?.description}</DescriptionDetails>
              <DescriptionTerm>Quantity</DescriptionTerm>
              <DescriptionDetails>{order.give_quantity_normalized}</DescriptionDetails>
            </DescriptionList>
          </div>
          <div>
            <Subheading>Quote Asset</Subheading>
            <Divider className="mt-4" />
            <DescriptionList>
              <DescriptionTerm>Asset</DescriptionTerm>
              <DescriptionDetails>{quoteAssetSymbol}</DescriptionDetails>
              <DescriptionTerm>Description</DescriptionTerm>
              <DescriptionDetails>{order.get_asset_info?.description}</DescriptionDetails>
              <DescriptionTerm>Quantity</DescriptionTerm>
              <DescriptionDetails>{order.get_quantity_normalized}</DescriptionDetails>
            </DescriptionList>
          </div>
        </div>
      </div>
    </>
  );
}
