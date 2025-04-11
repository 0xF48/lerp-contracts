import { Suspense } from "react";
import { ChevronLeftIcon } from "lucide-react";
import { NAV, STYLE } from "@/enums";
import AccountBalanceButton from "@/components/util/AccountBalanceButton";
import { AnimatedLerpLogo } from "@/components/util/AnimatedLerpLogo";
import Link from "next/link";
import cn from "classnames";
import { DashNote } from "@/components/dash/DashWelcomeNote";
import { DashRealmsList } from "@/components/dash/DashRealmsList";
import { DashGlobalStatSections } from "@/components/dash/DashGlobalStatSections";
import { BuyPanelButton } from "@/components/panels/BuyPanel";
import { TapScaleWrapper } from "@/components/util/TapScaleWrapper"; // Import the new wrapper
import { AccountInfoSection } from "@/components/dash/AccountInfoSection";


export default function Dash() {
  return <>

    <a href='https://lerp.io' className={cn(STYLE.BLACK_BUTTON, 'top-6 left-6 w-fit fixed gap-2 z-30')}>
      <ChevronLeftIcon className={cn(STYLE.BUTTON_ICON, 'h-5 w-5')} />
      <img src='/lerp-name.svg' alt='Lerp Landering Page' className='h-4 mr-2' />
    </a>

    <div className={STYLE.PAGE_NAV}>
      <div></div>
      <Suspense fallback={<div>Loading...</div>}>
        <AccountBalanceButton />
      </Suspense>
    </div>
    <div className={cn(STYLE.PAGE_CONTENT, 'items-center')}>
      <div className="w-full flex items-center justify-center py-10">
        <div className="flex flex-row gap-5 items-center">
          <AnimatedLerpLogo />
          <h1 className="text-2xl font-bold">$LFT</h1>
        </div>
      </div>
      <div className="w-full items-center flex-row flex gap-8 justify-center mb-6">
        <Link href={NAV.DOCS} className={cn(STYLE.BLACK_BUTTON_CHIP, 'px-6')}>Docs</Link>
        <Link href='https://github.com/lerp-io' className="underline">source</Link>
        <Link href='https://etherscan.io/' className="underline">etherscan</Link>
      </div>

      <div className={cn(STYLE.BORDER_DASHED_TOP, 'w-full flex flex-col md:flex-row')}>

        <div className="w-full flex flex-col gap-10 p-8">
          <DashGlobalStatSections />
        </div>
        <div className={cn(STYLE.BORDER_DASHED_LEFT, 'w-full')}>

          <AccountInfoSection />
          <DashNote />
          <DashRealmsList />
        </div>
      </div>

      {/* Wrap BuyPanelButton with TapScaleWrapper inside Suspense */}
      <Suspense fallback={<div>Loading...</div>}>
        <BuyPanelButton />
      </Suspense>

    </div>
    <div className="relative  text-black pt-20 min-h-[20em] flex flex-row justify-center">
      <div>footer</div>
    </div>

  </>
}
