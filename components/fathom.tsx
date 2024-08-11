'use client';

import { load, trackPageview } from 'fathom-client';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function TrackPageView(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const env = process.env.NODE_ENV;
    if (env !== "production") return;

    load('PCGNEFYI', {
      auto: false,
      includedDomains: ["www.xcpdex.com", "xcpdex.com"],
    });
  }, []);

  useEffect(() => {
    if (!pathname) return;

    trackPageview({
      url: pathname + searchParams.toString(),
      referrer: document.referrer
    });
  }, [pathname, searchParams]);

  return null;
}

export default function Fathom(): JSX.Element {
  return (
    <Suspense fallback={null}>
      <TrackPageView />
    </Suspense>
  );
}
