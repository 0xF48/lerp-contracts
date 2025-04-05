import { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { DappProvider } from "@/components/util/DappProvider";
import { PanelOverlay } from "@/components/util/PanelOverlay";
import { ErrorHandlerProvider } from "@/contexts/ErrorHandlerContext"; // Import Provider
import { ErrorOverlay } from "@/components/util/ErrorOverlay"; // Import Overlay
// import { usePathname } from "next/navigation";
// import { usePanel } from "@/hooks/usePanel"; // Removed unused import


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
        {/* Wrap DappProvider with ErrorHandlerProvider */}
        <ErrorHandlerProvider>
          <DappProvider>
            {children}
            <Suspense fallback={null}> {/* Or a minimal loading indicator */}
              <PanelOverlay />
            </Suspense>
          </DappProvider>
          {/* Render ErrorOverlay outside DappProvider but inside ErrorHandlerProvider */}
          <ErrorOverlay />
        </ErrorHandlerProvider>

      </body>
    </html>
  );
}
