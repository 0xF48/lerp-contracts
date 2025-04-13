import { NAV, STYLE } from "@/enums";
import Link from "next/link";
import cn from 'classnames'

export function NavBar() {
	return <div className="w-full items-center flex-row flex gap-8 justify-center mb-6">
		<Link href={NAV.DOCS} className={cn(STYLE.BLACK_BUTTON_CHIP, 'px-6')}>Docs</Link>
		<Link href='https://github.com/lerp-io' className="underline">source</Link>
		<Link href='https://etherscan.io/' className="underline">etherscan</Link>
	</div>
}