import React, { useEffect } from 'react';
import Head from '@docusaurus/Head';

export default function Home() {
  useEffect(() => {
    // Immediate client-side redirect with path preservation
    const targetUrl = 'https://eksworkshop.com' + window.location.pathname + window.location.search + window.location.hash;
    window.location.replace(targetUrl);
  }, []);

  return (
    <Head>
      <meta httpEquiv="refresh" content="0; url=https://eksworkshop.com" />
      <meta name="robots" content="noindex, follow" />
      <link rel="canonical" href="https://eksworkshop.com" />
      <title>Redirecting to EKS Workshop</title>
    </Head>
  );
}
