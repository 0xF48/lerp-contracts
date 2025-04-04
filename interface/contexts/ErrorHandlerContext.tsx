'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface ErrorContextType {
	error: Error | null;
	setError: (error: Error | null | unknown) => void; // Accept unknown for broader compatibility
	clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorHandlerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [error, setErrorState] = useState<Error | null>(null);

	const setError = useCallback((err: Error | null | unknown) => {
		if (err instanceof Error) {
			console.error("Global Error Handler:", err); // Log the error
			setErrorState(err);
		} else if (err === null) {
			setErrorState(null);
		} else {
			// Handle cases where a non-Error object is passed
			console.error("Global Error Handler (Non-Error):", err);
			setErrorState(new Error(String(err || 'An unknown error occurred')));
		}
	}, []);

	const clearError = useCallback(() => {
		setErrorState(null);
	}, []);

	return (
		<ErrorContext.Provider value={{ error, setError, clearError }}>
			{children}
			{/* Consider rendering the ErrorOverlay here or in the layout */}
		</ErrorContext.Provider>
	);
};

export const useErrorHandler = (): ErrorContextType => {
	const context = useContext(ErrorContext);
	if (context === undefined) {
		throw new Error('useErrorHandler must be used within an ErrorHandlerProvider');
	}
	return context;
};