import { Metadata } from 'next';
import HomePageComponent from '@/components/home-page';

export const metadata: Metadata = {
  title: 'XCP Dex - Trade Bitcoin Assets',
  description: 'Explore trading pairs and order history of the Counterparty Decentralized Exchange. Peer-to-peer trading without counterparty risk.',
};

export default function HomePage() {
  return (
    <>
      <HomePageComponent />
    </>
  );
}
