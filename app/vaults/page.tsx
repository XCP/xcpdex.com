import { Metadata } from 'next';
import VaultsPageComponent from '@/components/vaults-page';

export const metadata: Metadata = {
  title: 'Emblem Vaults - Counterparty XCP',
};

export default function VaultsPage() {
  return (
    <>
      <VaultsPageComponent />
    </>
  );
}
