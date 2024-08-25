import { Metadata } from 'next';
import DispensersPageComponent from '@/components/dispensers-page';

export const metadata: Metadata = {
  title: 'Dispensers',
};

export default function DispensersPage() {
  return (
    <>
      <DispensersPageComponent />
    </>
  );
}
