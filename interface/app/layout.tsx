
import type { Metadata } from "next";
import "./globals.css";
import { DappProvider } from "@/components/DappProvider";
import { PanelOverlay } from "@/components/PanelOverlay";
// import { usePathname } from "next/navigation";
import { usePanel } from "@/hooks/usePanel";


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


  return (
    <html lang="en">

      <body
        className={`font-ocra antialiased`}
      >
        <DappProvider>
          {children}
          <PanelOverlay />
        </DappProvider>

      </body>
    </html>
  );
}
