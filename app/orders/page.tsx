import { Metadata } from 'next';
import OrdersPageComponent from '@/components/orders-page';

export const metadata: Metadata = {
  title: 'Dex Orders - Counterparty XCP',
};

export default function OrdersPage() {
  return (
    <>
      <OrdersPageComponent />
    </>
  );
}
