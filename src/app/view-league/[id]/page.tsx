'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

export default function ViewLeagueRedirect() {
  const { id } = useParams<{ id: string }>();
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!id) return;

    const appUrl = `quickcourt://view-league/${id}`;

    // Try to open the app
    window.location.href = appUrl;

    // After a short delay, if still on page, show fallback
    const timer = setTimeout(() => {
      setAttempted(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [id]);

  const iosStoreUrl = 'https://apps.apple.com/app/quickcourt/id6743597137';
  const androidStoreUrl = 'https://play.google.com/store/apps/details?id=co.QuickCourt';

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent);
  const storeUrl = isIOS ? iosStoreUrl : isAndroid ? androidStoreUrl : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-sm w-full flex flex-col items-center gap-6 text-center">
        <Image src="/logo.png" alt="QuickCourt" width={72} height={72} className="rounded-2xl" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">QuickCourt</h1>
          <p className="text-gray-500 text-sm">
            {attempted
              ? 'Looks like you may not have the app installed.'
              : 'Opening in the QuickCourt app…'}
          </p>
        </div>

        <a
          href={`quickcourt://view-league/${id}`}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
        >
          Open in App
        </a>

        {storeUrl && (
          <a
            href={storeUrl}
            className="w-full border border-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition text-sm"
          >
            {isIOS ? 'Download on the App Store' : 'Get it on Google Play'}
          </a>
        )}
      </div>
    </div>
  );
}
