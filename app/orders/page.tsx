import { Metadata } from 'next';
import OrdersPageComponent from '@/components/orders-page';

export const metadata: Metadata = {
  title: 'Dex Orders',
};

export default function OrdersPage() {
  return (
    <>
      <OrdersPageComponent />
    </>
  );
}
