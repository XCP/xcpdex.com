import { Metadata } from 'next';
import HomePageComponent from '@/components/home-page';

export const metadata: Metadata = {
  title: 'XCP Dex - Trade Bitcoin Assets',
};

export default function HomePage() {
  return (
    <>
      <HomePageComponent />
    </>
  );
}
