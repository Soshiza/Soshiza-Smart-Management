import React, { useState, useEffect } from "react";
import { get, ref } from "firebase/database";
import { database, authentication } from "@/config/firebase";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SaleByDate = () => {
  const [sales, setSales] = useState([]);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState({});
  const [filter, setFilter] = useState("all"); // Estado del filtro: "all" (todos), "credito", "debito", "efectivo"
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isReadyToShow, setIsReadyToShow] = useState(false);

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

    const fetchProducts = async (uid) => {
      try {
        const productsRef = ref(database, `clientes/${uid}/products`);
        const productsSnapshot = await get(productsRef);
        const productsData = {};
        productsSnapshot.forEach((productSnapshot) => {
          const { name, unitValue } = productSnapshot.val();
          productsData[name] = unitValue;
        });
        setProducts(productsData);
      } catch (error) {
        console.error("Error al obtener los productos:", error);
      }
    };

    // Escuchar cambios en la autenticación del usuario
    const unsubscribe = authentication.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchSales(user.uid);
        fetchProducts(user.uid);
      } else {
        setUser(null);
        setSales([]);
        setProducts({});
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      setIsReadyToShow(true);
    } else {
      setIsReadyToShow(false);
    }
  }, [startDate, endDate]);

  // Función para filtrar las ventas según el método de pago seleccionado y el rango de fechas
  const filterSalesByPaymentMethodAndDateRange = (method, startDate, endDate) => {
    let filteredSales = [...sales];
  
    if (startDate && endDate) {
      // Agregamos un día al final para incluir las ventas del día de fin.
      endDate.setDate(endDate.getDate() + 1);
  
      // Filtrar las ventas que ocurrieron en o después de la fecha de inicio
      // y antes de la fecha de fin.
      filteredSales = filteredSales.filter((sale) => {
        const saleDate = new Date(sale.saleDateTime);
        return saleDate >= startDate && saleDate < endDate;
      });
    }
  
    if (method !== "all") {
      filteredSales = filteredSales.filter((sale) => sale.paymentMethod.toLowerCase() === method);
    }
  
    return filteredSales;
  };

  // Función para formatear la fecha y hora
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    const formattedTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    return { formattedDate, formattedTime };
  };

  // Función para calcular el total de los precios de costo de los productos de una venta
  const calculateTotalCost = (sale) => {
    let totalCost = 0;
    sale.products.forEach((product) => {
      if (products[product.name]) {
        totalCost += Number(products[product.name]);
      }
    });
    return totalCost;
  };

  // Función para calcular el total de los precios de venta de los productos de una venta
  const calculateTotalSalePrice = (sale) => {
    let totalSalePrice = 0;
    sale.products.forEach((product) => {
      totalSalePrice += Number(product.price);
    });
    return totalSalePrice;
  };

  // Función para calcular el total de las ganancias de una venta
  const calculateTotalProfit = (sale) => {
    let totalProfit = 0;
    sale.products.forEach((product) => {
      if (products[product.name] && sale.name !== "otros") {
        totalProfit += (Number(product.price) - Number(products[product.name]));
      }
    });
    return totalProfit;
  };

  // Función para calcular la ganancia total del día
  const calculateTotalProfitForDay = (sales) => {
    let totalProfit = 0;
    sales.forEach((sale) => {
      totalProfit += calculateTotalProfit(sale);
    });
    return totalProfit;
  };

  // Actualiza la función para imprimir la tabla
  const renderFilteredTable = () => {
    let filteredSales = [...sales];

    if (startDate || endDate || filter !== "all") {
      filteredSales = filterSalesByPaymentMethodAndDateRange(filter, startDate, endDate);
    }

    // Calcular la venta total del día y la ganancia total del día
    const totalSalesAmount = filteredSales.reduce((acc, sale) => acc + Number(sale.totalAmount), 0);
    const totalProfitForDay = calculateTotalProfitForDay(filteredSales);

    return (
      <div id="print-table-content" className="mt-8 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Ventas ({filter === "all" ? "Todos" : filter})</h2>
        {filteredSales.length > 0 ? (
          <table className="table-auto min-w-full divide-y divide-gray-200">
            {/* Encabezado de la tabla */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método de pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre del producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio de venta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio de costo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total costo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de venta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora de venta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ganancia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número de boleta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cuotas
                </th>
              </tr>
            </thead>
            {/* Cuerpo de la tabla */}
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sale.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ul>
                      {sale.products.map((product, index) => (
                        <li key={index}>{product.name}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ul>
                      {sale.products.map((product, index) => (
                        <li key={index}>${product.price}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ul>
                      {sale.products.map((product, index) => (
                        <li key={index}>${products[product.name]}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${calculateTotalCost(sale)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(sale.saleDateTime).formattedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(sale.saleDateTime).formattedTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">${sale.totalAmount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${calculateTotalProfit(sale)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{sale.ticketNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{sale.cuotas}</td>
                </tr>
              ))}
            </tbody>
            {/* Fila de totales */}
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="7" className="px-6 py-4 whitespace-nowrap font-semibold">Venta total del día:</td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">${totalSalesAmount.toFixed(2)}</td>
                <td colSpan="4"></td> {/* Columnas vacías para alinear con el resto de la tabla */}
              </tr>
              <tr>
                <td colSpan="7" className="px-6 py-4 whitespace-nowrap font-semibold">Ganancia total del día:</td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">${totalProfitForDay.toFixed(2)}</td>
                <td colSpan="4"></td> {/* Columnas vacías para alinear con el resto de la tabla */}
              </tr>
            </tfoot>
          </table>
        ) : (
          <p>No hay ventas disponibles para esta fecha y método de pago.</p>
        )}
        <button onClick={printTable} className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Imprimir tabla
        </button>
      </div>
    );
  };

  // Función para imprimir la tabla
  const printTable = () => {
    const printContent = document.getElementById("print-table-content");
    const originalContents = document.body.innerHTML;
    const content = printContent.innerHTML;

    document.body.innerHTML = content;
    window.print();
    document.body.innerHTML = originalContents;
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
          <label htmlFor="filter" className="block mb-1">Filtrar por método de pago:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">Todos</option>
            <option value="credito">Crédito</option>
            <option value="debito">Débito</option>
            <option value="efectivo">Efectivo</option>
          </select>
        </div>
      </div>
      {isReadyToShow && renderFilteredTable()}
    </div>
  );
};

export default SaleByDate;
