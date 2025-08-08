
"use client";

// This component is no longer used and can be safely deleted or ignored.
// The payment flow has been migrated to Z-Pay.
// Keeping the file to avoid breaking imports if it's referenced elsewhere,
// but it should be removed in a future cleanup.

import React from 'react';

export const PayPalWrapper = () => {
    return (
        <div className="text-xs text-muted-foreground text-center p-4">
            This payment method is not active.
        </div>
    );
};
