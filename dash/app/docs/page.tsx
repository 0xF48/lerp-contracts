import { ChevronLeftIcon } from "lucide-react";
import { NAV, STYLE } from "../../enums";
import fs from 'fs';
import path from 'path';

import Link from 'next/link';

//@ts-ignore
import { markdown } from 'markdown'

const readmePath = path.join(process.cwd(), '..', 'README.md');
const docsHTML = markdown.toHTML(fs.readFileSync(readmePath, 'utf8'));


// This is a Server Component
export default async function Docs() {
	// Read the README.md file

	return (
		<>
			<div className={STYLE.PAGE_NAV}>
				<Link href={NAV.DASH} className={STYLE.BLACK_BUTTON}>
					<ChevronLeftIcon className={STYLE.BUTTON_ICON} />
					<span>Dash</span>
				</Link>
				<div>
					LERP Whitepaper V2
				</div>
			</div>
			<div className={STYLE.PAGE_CONTENT}>
				<div className='markdown md:mx-20' dangerouslySetInnerHTML={{ __html: docsHTML }} />
			</div>
		</>
	);
}
