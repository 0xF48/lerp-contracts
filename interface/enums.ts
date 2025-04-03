export const enum NAV {
	DASH = "/",
	DOCS = "/docs",
}

export const enum PANEL {
	BUY = "buy",
	CLAIM = "claim",
	STAKE = "stake",
	UNSTAKE = "unstake",
}

export const enum STYLE {
	YELLOW_BUTTON_HOVER = 'hover:ring-4 hover:ring-yellow-300/30 hover:bg-yellow-300 transition-all',
	BLACK_BUTTON_HOVER = 'hover:ring-4 hover:ring-gray-300 hover:bg-gray-800 transition-all',
	YELLOW_BUTTON = 'cursor-pointer bg-yellow-400 text-black rounded-lg px-4 flex items-center h-12 ' + YELLOW_BUTTON_HOVER,

	GREEN_BUTTON_HOVER = 'hover:ring-4 hover:ring-green-300/30 hover:bg-green-500 transition-all',
	GREEN_BUTTON = 'cursor-pointer bg-green-500 text-white rounded-lg px-4 flex items-center h-12 ' + GREEN_BUTTON_HOVER,

	BLUE_BUTTON_HOVER = 'hover:ring-4 hover:ring-blue-300/30 hover:bg-blue-500 transition-all',
	BLUE_BUTTON = 'cursor-pointer bg-blue-600 text-white rounded-lg px-4 flex items-center h-12 ' + BLUE_BUTTON_HOVER,
	BLACK_BUTTON = 'cursor-pointer bg-black text-white rounded-lg px-4 flex items-center h-12 ' + BLACK_BUTTON_HOVER,
	BLACK_BUTTON_CHIP = 'bg-black text-white rounded-lg flex items-center h-10 items-center ' + BLACK_BUTTON_HOVER,
	PALE_BUTTON_CHIP = 'bg-gray-100 text-black hover:bg-white cursor-pointer rounded-lg flex items-center h-10 items-center hover:ring-4 hover:ring-gray-200 transition-all',
	BUTTON_ICON = 'h-4 w-4 mr-2',
	PAGE_NAV = 'flex items-center justify-between p-6',
	PAGE_CONTENT = 'flex flex-col gap-4 w-full max-w-5xl mx-auto',

	BORDER_DASHED_TOP = 'border-long-dashed-t',
	BORDER_DASHED_BOT = 'border-long-dashed-b',
	BORDER_DASHED_LEFT = 'border-long-dashed-l',
}