import React, { useState } from 'react';
import { motion } from 'framer-motion'; 
import SalesTable from '../dailySales';
import SaleByDate from '../saleByDate';
import SalesAnalysis from '../salesAnalysis';


const LayoutSales = () => {
    const [selectedComponent, setSelectedComponent] = useState(null);

    const handleSaleDailyClick = () => {
        setSelectedComponent('DaylySales');
    };

    const handleSaleByDateClick = () => {
        setSelectedComponent('SaleByDate');
    };

    const handleSalesAnalysisClick = () => {
        setSelectedComponent('SalesAnalysis');
    };

    const componentVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
    };

    const renderSelectedComponent = () => {
        switch (selectedComponent) {
            case 'DaylySales':
                return (
                    <motion.div variants={componentVariants} initial="hidden" animate="visible" exit="hidden" className="flex justify-center items-center h-full">
                        <SalesTable />
                    </motion.div>
                );
            case 'SaleByDate':
                return (
                    <motion.div variants={componentVariants} initial="hidden" animate="visible" exit="hidden">
                        <SaleByDate />
                    </motion.div>
                );
            case 'SalesAnalysis':
                return (
                    <motion.div variants={componentVariants} initial="hidden" animate="visible" exit="hidden">
                        <SalesAnalysis />
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <div className="flex justify-start h-screen pl-2 my-8 bg-glass w-52">
                <div className="flex flex-col items-center text-center mt-5">
                    <motion.div
                        className="bg-glass w-48 h-6 mb-1 rounded-full"
                        onClick={handleSaleDailyClick}
                        whileHover={{ backgroundColor: '#d1d5db', cursor: 'pointer' }}
                    >
                        Venta Diaria
                    </motion.div>
                    <motion.div
                        className="bg-glass w-48 h-6 mb-1 rounded-full"
                        onClick={handleSaleByDateClick}
                        whileHover={{ backgroundColor: '#d1d5db', cursor: 'pointer' }}
                    >
                        Ventas Segun fecha
                    </motion.div>
                    <motion.div
                        className="bg-glass w-48 h-6 mb-1 rounded-full"
                        onClick={handleSalesAnalysisClick}
                        whileHover={{ backgroundColor: '#d1d5db', cursor: 'pointer' }}
                    >
                        Analisis Venta Productos
                    </motion.div>
                </div>
                <div className="ml-4 flex-grow" layout>{renderSelectedComponent()}</div>
            </div>
        </div>
    );
};

export default LayoutSales;
