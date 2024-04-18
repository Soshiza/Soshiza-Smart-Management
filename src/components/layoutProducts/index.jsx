import React, { useState } from 'react';
import { motion } from 'framer-motion'; 
import ProductForm from '../productForm';

import './index.css';
import SearchProduct from '../searchProducts';
import UpdateProduct from '../updateProducts';

const LayoutProducts = () => {
    const [selectedComponent, setSelectedComponent] = useState(null);

    const handleAddProductClick = () => {
        setSelectedComponent('ProductForm');
    };

    const handleSearchProductClick = () => {
        setSelectedComponent('SearchProduct');
    };

    const handleUpdateProductClick = () => {
        setSelectedComponent('UpdateProduct');
    };

    const componentVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
    };

    const renderSelectedComponent = () => {
        switch (selectedComponent) {
            case 'ProductForm':
                return (
                    <motion.div variants={componentVariants} initial="hidden" animate="visible" exit="hidden" className="flex justify-center items-center h-full">
                        <ProductForm />
                    </motion.div>
                );
            case 'SearchProduct':
                return (
                    <motion.div variants={componentVariants} initial="hidden" animate="visible" exit="hidden">
                        <SearchProduct />
                    </motion.div>
                );
            case 'UpdateProduct':
                return (
                    <motion.div variants={componentVariants} initial="hidden" animate="visible" exit="hidden">
                        <UpdateProduct />
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
                        onClick={handleAddProductClick}
                        whileHover={{ backgroundColor: '#d1d5db', cursor: 'pointer' }}
                    >
                        Agregar Producto
                    </motion.div>
                    <motion.div
                        className="bg-glass w-48 h-6 mb-1 rounded-full"
                        onClick={handleSearchProductClick}
                        whileHover={{ backgroundColor: '#d1d5db', cursor: 'pointer' }}
                    >
                        Buscar Producto
                    </motion.div>
                    <motion.div
                        className="bg-glass w-48 h-6 mb-1 rounded-full"
                        onClick={handleUpdateProductClick}
                        whileHover={{ backgroundColor: '#d1d5db', cursor: 'pointer' }}
                    >
                        Actualizar Producto
                    </motion.div>
                </div>
                <div className="ml-4 flex-grow" layout>{renderSelectedComponent()}</div>
            </div>
        </div>
    );
};

export default LayoutProducts;
