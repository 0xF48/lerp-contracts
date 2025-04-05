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
	backdrop-blur-3xl
    bg-red-950/90
    flex items-center justify-center
    p-4
  `;

	const contentStyle = `
    bg-red-600 rounded-xl
    p-6 max-w-md w-full
    text-white relative
  `;

	return (
		<div className={cn(overlayStyle)} onClick={clearError}>
			<div className={cn(contentStyle)} onClick={(e) => e.stopPropagation()}>
				<h3 className="text-lg font-bold text-black py-5 mb-3 w-full flex items-center justify-center">Critical Error</h3>
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