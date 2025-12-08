import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SwipeableListContextType {
    openItemId: string | null;
    setOpenItemId: (id: string | null) => void;
}

const SwipeableListContext = createContext<SwipeableListContextType | undefined>(undefined);

export const SwipeableListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [openItemId, setOpenItemId] = useState<string | null>(null);

    return (
        <SwipeableListContext.Provider value={{ openItemId, setOpenItemId }}>
            {children}
        </SwipeableListContext.Provider>
    );
};

export const useSwipeableList = () => {
    const context = useContext(SwipeableListContext);
    if (context === undefined) {
        throw new Error('useSwipeableList must be used within a SwipeableListProvider');
    }
    return context;
};
