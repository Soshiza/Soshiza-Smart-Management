import React, { useState, useEffect, useRef } from "react";
import { get, ref } from "firebase/database";
import { database, authentication } from "@/config/firebase";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Chart from 'chart.js/auto';
import _ from 'lodash';

const SalesAnalysis = () => {
  const [sales, setSales] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState('salesByDate');
  const [mostSoldProducts, setMostSoldProducts] = useState([]);
  const [mostUsedPaymentMethods, setMostUsedPaymentMethods] = useState([]);
  const [isReadyToShow, setIsReadyToShow] = useState(false);

  const salesByDateChartRef = useRef(null);
  const mostSoldProductsChartRef = useRef(null);
  const mostUsedPaymentMethodsChartRef = useRef(null);

  useEffect(() => {
    const fetchSales = async (uid) => {
      try {
        // Obtener las ventas del usuario actual
        const salesRef = ref(database, `clientes/${uid}/ventas/finalSale`);
        get(salesRef).then((snapshot) => {
          const salesData = [];
          snapshot.forEach((childSnapshot) => {
            salesData.push({
              id: childSnapshot.key,
              ...childSnapshot.val(),
            });
          });
          setSales(salesData);
        });
      } catch (error) {
        console.error("Error al obtener las ventas:", error);
      }
    };

    // Escuchar cambios en la autenticación del usuario
    const unsubscribe = authentication.onAuthStateChanged((user) => {
      if (user) {
        fetchSales(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (startDate && endDate && sales.length > 0) {
      setIsReadyToShow(true);
    } else {
      setIsReadyToShow(false);
    }
  }, [startDate, endDate, sales]);

  useEffect(() => {
    if (isReadyToShow) {
      // Filtrar las ventas dentro del rango de fechas seleccionado
      const filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.saleDateTime.split('T')[0]);
        return saleDate >= startDate && saleDate <= endDate;
      });

      // Calcular los resultados según el análisis seleccionado
      switch (selectedAnalysis) {
        case 'salesByDate':
          generateSalesByDateChart(filteredSales);
          break;
        case 'mostSoldProducts':
          const mostSoldProducts = calculateMostSoldProducts(filteredSales);
          setMostSoldProducts(mostSoldProducts);
          generateMostSoldProductsChart(mostSoldProducts);
          break;
        case 'mostUsedPaymentMethods':
          const mostUsedPaymentMethods = calculateMostUsedPaymentMethods(filteredSales);
          setMostUsedPaymentMethods(mostUsedPaymentMethods);
          generateMostUsedPaymentMethodsChart(mostUsedPaymentMethods);
          break;
        default:
          break;
      }
    }
  }, [isReadyToShow, selectedAnalysis, startDate, endDate, sales]);

  // Función para calcular los 20 productos más vendidos
  const calculateMostSoldProducts = (filteredSales) => {
    const productCount = _.countBy(filteredSales.flatMap(sale => sale.products), 'name');
    const sortedProducts = _.chain(productCount)
      .map((count, name) => ({ name, count }))
      .sortBy(['count'])
      .reverse()
      .take(20)
      .value();
    return sortedProducts;
  };

  // Función para calcular los métodos de pago más utilizados
  const calculateMostUsedPaymentMethods = (filteredSales) => {
    const paymentMethodCount = _.countBy(filteredSales, 'paymentMethod');
    const sortedMethods = _.chain(paymentMethodCount)
      .map((count, method) => ({ method, count }))
      .sortBy(['count'])
      .reverse()
      .value();
    return sortedMethods;
  };

  // Función para generar el gráfico de ventas por fecha
  const generateSalesByDateChart = (filteredSales) => {
    if (salesByDateChartRef.current) {
      salesByDateChartRef.current.destroy();
    }

    const salesByDate = _.groupBy(filteredSales, sale => sale.saleDateTime.split('T')[0]);
    const dates = Object.keys(salesByDate);
    const salesCount = dates.map(date => salesByDate[date].length);

    const ctx = document.getElementById('salesByDateChart');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [{
          label: 'Ventas por fecha',
          data: salesCount,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    salesByDateChartRef.current = chart;
  };

  // Función para generar el gráfico de los 20 productos más vendidos
  const generateMostSoldProductsChart = (mostSoldProducts) => {
    if (mostSoldProductsChartRef.current) {
      mostSoldProductsChartRef.current.destroy();
    }

    const productLabels = mostSoldProducts.map(product => product.name);
    const productCounts = mostSoldProducts.map(product => product.count);

    const ctx = document.getElementById('mostSoldProductsChart');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: productLabels,
        datasets: [{
          label: 'Productos más vendidos',
          data: productCounts,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    mostSoldProductsChartRef.current = chart;
  };

  // Función para generar el gráfico de los métodos de pago más utilizados
  const generateMostUsedPaymentMethodsChart = (mostUsedPaymentMethods) => {
    if (mostUsedPaymentMethodsChartRef.current) {
      mostUsedPaymentMethodsChartRef.current.destroy();
    }

    const methodLabels = mostUsedPaymentMethods.map(method => method.method);
    const methodCounts = mostUsedPaymentMethods.map(method => method.count);

    const ctx = document.getElementById('mostUsedPaymentMethodsChart');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: methodLabels,
        datasets: [{
          label: 'Métodos de pago más utilizados',
          data: methodCounts,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    mostUsedPaymentMethodsChartRef.current = chart;
  };

  return (
    <div className="flex flex-col items-center mt-8">
      <div className="flex items-center mb-4">
        <div className="mr-8">
          <label htmlFor="startDateInput" className="block mb-1">Fecha de inicio:</label>
          <DatePicker
            id="startDateInput"
            selected={startDate}
            onChange={date => setStartDate(date)}
            className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mr-8">
          <label htmlFor="endDateInput" className="block mb-1">Fecha de fin:</label>
          <DatePicker
            id="endDateInput"
            selected={endDate}
            onChange={date => setEndDate(date)}
            className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="analysisSelect" className="block mb-1">Análisis:</label>
          <select
            id="analysisSelect"
            value={selectedAnalysis}
            onChange={e => setSelectedAnalysis(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="salesByDate">Ventas por fecha</option>
            <option value="mostSoldProducts">Productos más vendidos</option>
            <option value="mostUsedPaymentMethods">Métodos de pago más utilizados</option>
          </select>
        </div>
      </div>
      {isReadyToShow && (
        <>
          {selectedAnalysis === 'salesByDate' && (
            <canvas id="salesByDateChart" width="400" height="400"></canvas>
          )}
          {selectedAnalysis === 'mostSoldProducts' && (
            <canvas id="mostSoldProductsChart" width="400" height="400"></canvas>
          )}
          {selectedAnalysis === 'mostUsedPaymentMethods' && (
            <canvas id="mostUsedPaymentMethodsChart" width="400" height="400"></canvas>
          )}
        </>
      )}
    </div>
  );
};

export default SalesAnalysis;
