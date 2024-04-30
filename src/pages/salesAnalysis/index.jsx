import React from 'react';
import '@/app/globals.css'
import LayoutSales from '@/components/layoutSales';
import Header from '@/components/header/header';

function SalesAnalysis() {
    return (
        <div>
            <Header />
            <LayoutSales />
        </div>
    );
}

export default SalesAnalysis;