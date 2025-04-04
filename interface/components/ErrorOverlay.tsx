'use client';

import React from 'react';
import { useErrorHandler } from '@/contexts/ErrorHandlerContext';
import cn from 'classnames';
import { XIcon } from 'lucide-react'; // For close button

export const ErrorOverlay: React.FC = () => {
	const { error, clearError } = useErrorHandler();

	if (!error) {
		return null; // Don't render anything if there's no error
	}

	// Basic styling, adjust as needed
	const overlayStyle = `
    fixed inset-0 z-[100]  /* High z-index to be on top */
    bg-black/80 backdrop-blur-sm
    flex items-center justify-center
    p-4
  `;

	const contentStyle = `
    bg-red-800/90 border border-red-600 rounded-lg
    p-6 max-w-md w-full
    text-white relative shadow-xl
  `;

	const closeButtonStyle = `
    absolute top-2 right-2 p-1
    text-red-200 hover:text-white
    cursor-pointer rounded-full hover:bg-red-700/50
    transition-colors
  `;

	return (
		<div className={cn(overlayStyle)}>
			<div className={cn(contentStyle)}>
				<button onClick={clearError} className={cn(closeButtonStyle)} aria-label="Close error">
					<XIcon size={20} />
				</button>
				<h3 className="text-lg font-bold mb-2 border-b border-red-600 pb-1">Error Occurred</h3>
				<p className="text-sm break-words">
					{/* Attempt to provide a more user-friendly message */}
					{error.message || 'An unknown error occurred.'}
				</p>
				{/* Optionally show stack trace in development */}
				{process.env.NODE_ENV === 'development' && error.stack && (
					<pre className="mt-4 text-xs text-red-200 overflow-auto max-h-40 bg-red-900/50 p-2 rounded">
						{error.stack}
					</pre>
				)}
			</div>
		</div>
	);
};