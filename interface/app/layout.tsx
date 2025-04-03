import type { Metadata } from "next";
import "./globals.css";
import { DappProvider } from "@/components/DappProvider";
import { PanelOverlay } from "@/components/PanelOverlay";
// import { usePathname } from "next/navigation";



export const metadata: Metadata = {
  title: "Lerp Founder Token",
  description: "Lerp Founder Token Dashboard & Explorer",
};

export default function RootLayout({
  children,
  params
}: Readonly<{
  params: any;
  children: React.ReactNode;
}>) {

  // const pathname = usePathname(); // e.g. "/docs/foo/bar"
  // const segments = pathname.split('/').filter(Boolean);
  // const basePath = segments.length > 0 ? `/${segments[0]}` : '/';



  return (
    <html lang="en">

      <body
        className={`font-ocra antialiased `}
      >
        <DappProvider>
          {children}
          <PanelOverlay />
        </DappProvider>

      </body>
    </html>
  );
}
