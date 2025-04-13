import { Suspense } from "react";
import { ChevronLeftIcon } from "lucide-react";
import { STYLE } from "@/enums";
import AccountBalanceButton from "@/components/util/AccountBalanceButton";
import { AnimatedLerpLogo } from "@/components/util/AnimatedLerpLogo";
import cn from "classnames";
import { DashNote } from "@/components/dash/DashWelcomeNote";
import { DashRealmsList } from "@/components/dash/DashRealmsList";
import { AccountInfoSection } from "@/components/dash/AccountInfoSection";
import { SaleInfoSection } from "@/components/dash/SaleInfoSection";
import { NavBar } from "@/components/dash/NavBar";
import { Footer } from "@/components/dash/Footer";
import { LerpNetworkStat } from "@/components/dash/LerpNetworkStat";
import { ComputeStats } from "@/components/dash/ComputeStats";
import { LerpGlobalConfigInfoStats } from "@/components/dash/LerpGlobalConfigInfoStats";
import { StakeComputeResultStats } from "@/components/dash/StakeComputeResultStats";


export default function Dash() {
  return <>
    <a href='https://lerp.io' className={cn(STYLE.BLACK_BUTTON, 'top-6 left-6 w-fit fixed gap-2 z-30')}>
      <ChevronLeftIcon className={cn(STYLE.BUTTON_ICON, 'h-5 w-5')} />
      <img src='/lerp-name.svg' alt='Lerp Landering Page' className='h-4 mr-2' />
    </a>

    <div className={cn(STYLE.PAGE_NAV, "absolute top-0 left-0 right-0 z-10")}> {/* Make nav absolute */}
      <div></div>
      <Suspense fallback={<div>Loading...</div>}>
        <AccountBalanceButton />
      </Suspense>
    </div>
    <div className={cn(STYLE.PAGE_CONTENT, 'items-center')}>

      <div className="w-full flex items-center justify-center h-[20em] flex-col gap-10">
        <div className="flex flex-row gap-5 items-center">
          <AnimatedLerpLogo />
          <h1 className="text-2xl font-bold">$LFT</h1>
        </div>
        <NavBar />
      </div>




      <div className={cn(STYLE.BORDER_DASHED_TOP, 'w-full flex flex-col md:flex-row')}>

        <div className="w-full flex flex-col gap-10 p-8">
          <LerpNetworkStat />
          <ComputeStats />
          <LerpGlobalConfigInfoStats />
          <StakeComputeResultStats />
        </div>
        <div className={cn(STYLE.BORDER_DASHED_LEFT, 'flex flex-col w-full p-8 gap-10')}>
          <SaleInfoSection />
          <AccountInfoSection />
          <div className={STYLE.BORDER_DASHED_BOT + ' -mx-8'}></div>
          <DashNote />
          <DashRealmsList />
        </div>
      </div>

    </div>
    <Footer />

  </>
}
