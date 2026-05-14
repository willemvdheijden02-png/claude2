import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agency Dashboard",
  description: "White-label agency platform — dashboards, rapporten, klanten en facturering op één plek.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Agency Dashboard",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-152x152.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-text-primary">
        {children}
        <Analytics />
        <div
          id="pwa-banner"
          style={{display:"none",position:"fixed",bottom:"16px",left:"50%",transform:"translateX(-50%)",
            background:"#1a1a2e",border:"1px solid rgba(124,58,237,0.4)",borderRadius:"14px",
            padding:"14px 18px",zIndex:9999,alignItems:"center",gap:"12px",
            boxShadow:"0 8px 32px rgba(0,0,0,0.5)",maxWidth:"340px",width:"calc(100% - 32px)"}}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-72x72.png" alt="" style={{width:40,height:40,borderRadius:10,flexShrink:0}} />
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:700,color:"#e2e8f0"}}>Agency Dashboard</div>
            <div style={{fontSize:11,color:"#94a3b8",marginTop:1}}>Installeer als app op je telefoon</div>
          </div>
          <button id="pwa-install-btn" style={{background:"#7c3aed",color:"white",border:"none",padding:"8px 14px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer"}}>
            Installeer
          </button>
          <button id="pwa-close-btn" style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:18,lineHeight:1}}>
            ×
          </button>
        </div>
        <script dangerouslySetInnerHTML={{__html:`
          (function(){
            var isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream;
            var isStandalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone;
            var dismissed=localStorage.getItem('pwa-dismissed');
            var onPortal=window.location.pathname.startsWith('/portal');
            var banner=document.getElementById('pwa-banner');
            var installBtn=document.getElementById('pwa-install-btn');
            var closeBtn=document.getElementById('pwa-close-btn');
            var deferred=null;
            if(closeBtn)closeBtn.onclick=function(){banner.style.display='none';localStorage.setItem('pwa-dismissed','1');};
            if(!isStandalone&&!dismissed&&onPortal){
              window.addEventListener('beforeinstallprompt',function(e){
                e.preventDefault();deferred=e;
                setTimeout(function(){banner.style.display='flex';},2500);
              });
              if(isIOS){
                setTimeout(function(){
                  banner.style.display='flex';
                  if(installBtn){installBtn.textContent='Hoe?';installBtn.onclick=function(){alert('Safari → Deel-knop → Zet op beginscherm');};}
                },2500);
              } else if(installBtn){
                installBtn.onclick=function(){if(deferred){deferred.prompt();deferred=null;banner.style.display='none';}};
              }
            }
            if('serviceWorker' in navigator){
              window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js');});
            }
          })();
        `}} />
      </body>
    </html>
  );
}
