import React from 'react';
import { NavMenu } from './components/NavMenu';

export function PageLayout(props: {children: React.ReactNode}) {
    return (
        <div>
            <NavMenu />
            
            {props.children}

            <div className="text-sm text-center my-4 italic text-gray-600">
                Brought to you by the {"\u{1f36c}"} Kansas City Breath Mints.
            </div>
        </div>
    )
}
