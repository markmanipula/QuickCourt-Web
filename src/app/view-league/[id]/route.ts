import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const appUrl = `quickcourt://view-league/${id}`;
  const webUrl = `https://quickcourt.co/view-league/${id}`;
  const iosStore = 'https://apps.apple.com/app/quickcourt/id6743597137';
  const androidStore = 'https://play.google.com/store/apps/details?id=co.QuickCourt';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>QuickCourt</title>

  <!-- Facebook / Messenger App Links (al: namespace requires property attribute) -->
  <meta property="al:ios:url" content="${appUrl}" />
  <meta property="al:ios:app_store_id" content="6743597137" />
  <meta property="al:ios:app_name" content="QuickCourt" />
  <meta property="al:android:url" content="${appUrl}" />
  <meta property="al:android:package" content="co.QuickCourt" />
  <meta property="al:android:app_name" content="QuickCourt" />
  <meta property="al:web:url" content="${webUrl}" />

  <!-- Open Graph -->
  <meta property="og:title" content="QuickCourt League" />
  <meta property="og:description" content="Join this league on QuickCourt" />
  <meta property="og:image" content="https://quickcourt.co/logo.png" />
  <meta property="og:url" content="${webUrl}" />
  <meta property="og:type" content="website" />

  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .card{background:white;border-radius:20px;box-shadow:0 4px 24px rgba(0,0,0,.10);padding:40px;max-width:360px;width:100%;display:flex;flex-direction:column;align-items:center;gap:20px;text-align:center}
    .logo{width:72px;height:72px;border-radius:16px}
    h1{font-size:22px;font-weight:700;color:#111827}
    p{font-size:14px;color:#6b7280;line-height:1.5}
    .btn{width:100%;padding:14px;border-radius:12px;font-size:15px;font-weight:600;text-decoration:none;display:block;text-align:center}
    .btn-primary{background:#2563eb;color:white}
    .btn-secondary{border:1.5px solid #e5e7eb;color:#374151}
    .info-box{background:#fff7ed;border:1.5px solid #fed7aa;border-radius:12px;padding:14px 16px;width:100%}
    .info-box p{color:#92400e;font-size:13px}
    .bold{font-weight:700}
    .hidden{display:none}
  </style>
</head>
<body>
  <div class="card">
    <img class="logo" src="https://quickcourt.co/logo.png" alt="QuickCourt" onerror="this.style.display='none'" />
    <div>
      <h1>QuickCourt</h1>
      <p id="status">Opening in the QuickCourt app…</p>
    </div>

    <div id="msg-box" class="info-box hidden">
      <p>Facebook Messenger blocks app links.<br/>
      <span class="bold">Tap ··· → "Open in Browser"</span>, then tap <span class="bold">Open in App</span> on the page that loads.</p>
    </div>

    <a id="btn-open" href="${appUrl}" class="btn btn-primary hidden">Open in App</a>
    <a id="btn-ios" href="${iosStore}" class="btn btn-secondary hidden">Download on the App Store</a>
    <a id="btn-android" href="${androidStore}" class="btn btn-secondary hidden">Get it on Google Play</a>
  </div>

  <script>
    (function(){
      var ua = navigator.userAgent || '';
      var isMsgr = /FBAN|FBAV|FB_IAB/i.test(ua);
      var isIOS = /iPad|iPhone|iPod/.test(ua);
      var isAndroid = /Android/.test(ua);

      function show(id){ document.getElementById(id).classList.remove('hidden'); }

      if(isIOS) show('btn-ios');
      if(isAndroid) show('btn-android');

      if(isMsgr){
        show('msg-box');
        document.getElementById('status').textContent = 'Open this link in your browser to launch QuickCourt.';
      } else {
        show('btn-open');
        window.location.href = ${JSON.stringify(appUrl)};
        setTimeout(function(){
          document.getElementById('status').textContent = 'Looks like you may not have the app installed.';
        }, 2000);
      }
    })();
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
