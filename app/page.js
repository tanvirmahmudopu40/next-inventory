'use client';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import StatCard from './components/StatCard';
import {
  ChartBarIcon,
  UsersIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [orderChartData, setOrderChartData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrder: 0,
    lowStock: 0,
  });

  const COLORS = ['#321fdb', '#2eb85c', '#f9b115', '#e55353', '#768192'];

  useEffect(() => {
    // Fetch data
    Promise.all([
      fetch('/api/orders').then(res => res.json()),
      fetch('/api/products').then(res => res.json())
    ]).then(([ordersData, productsData]) => {
      console.log('Orders data:', ordersData);
      setOrders(ordersData);
      setProducts(productsData);
      
      // Calculate stats
      const totalSales = ordersData.reduce((sum, order) => sum + order.total, 0);
      setStats({
        totalSales,
        totalOrders: ordersData.length,
        averageOrder: ordersData.length ? totalSales / ordersData.length : 0,
        lowStock: productsData.filter(p => p.stock < 10).length
      });

      // Prepare orders chart data
      const last7Days = [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const ordersByDate = last7Days.map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        orders: ordersData.filter(order => 
          order.createdAt.split('T')[0] === date
        ).length,
        sales: ordersData
          .filter(order => order.createdAt.split('T')[0] === date)
          .reduce((sum, order) => sum + order.total, 0)
      }));

      setOrderChartData(ordersByDate);

      // Calculate top products data
      const productOrders = {};
      ordersData.forEach(order => {
        order.itemsSummary?.forEach(item => {
          if (!productOrders[item.id]) {
            productOrders[item.id] = {
              name: item.title,
              value: 0
            };
          }
          productOrders[item.id].value += Number(item.quantity) || 0;
        });
      });

      console.log('Product Orders:', productOrders);

      // Get top 5 products
      const topProducts = Object.values(productOrders)
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      console.log('Final topProducts data:', topProducts);
      setTopProductsData(topProducts);
    });
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 shadow-lg rounded-lg border">
          <p className="text-sm font-semibold">{payload[0].payload.name}</p>
          <p className="text-sm">{`Quantity: ${payload[0].value} units`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Layout>
      <div className="p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Sales"
            value={`$${stats.totalSales.toFixed(2)}`}
            icon={<CurrencyDollarIcon className="h-6 w-6" />}
            trend="+12.4%"
            color="bg-blue-500"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<ShoppingCartIcon className="h-6 w-6" />}
            trend="+8.2%"
            color="bg-green-500"
          />
          <StatCard
            title="Average Order"
            value={`$${stats.averageOrder.toFixed(2)}`}
            icon={<ChartBarIcon className="h-6 w-6" />}
            trend="+3.1%"
            color="bg-purple-500"
          />
          <StatCard
            title="Low Stock Items"
            value={stats.lowStock}
            icon={<UsersIcon className="h-6 w-6" />}
            trend="-2.4%"
            color="bg-red-500"
            trendDown
          />
        </div>

        {/* Order Chart */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Orders & Sales Overview</h2>
          </div>
          <div className="p-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={orderChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="orders"
                    stroke="#321fdb"
                    name="Orders"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="sales"
                    stroke="#2eb85c"
                    name="Sales ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Products Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Top Products Distribution</h2>
          </div>
          <div className="p-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topProductsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name} (${value})`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {topProductsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Recent Orders</h2>
            </div>
            <div className="p-4">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order._id} className="border-t border-gray-100">
                      <td className="py-3 text-sm">{order.invoiceNo}</td>
                      <td className="py-3 text-sm">{order.customerName}</td>
                      <td className="py-3 text-sm">${order.total.toFixed(2)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Low Stock Products</h2>
            </div>
            <div className="p-4">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Stock</th>
                    <th className="pb-3">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter(p => p.stock < 10)
                    .slice(0, 5)
                    .map((product) => (
                      <tr key={product._id} className="border-t border-gray-100">
                        <td className="py-3 text-sm">{product.title}</td>
                        <td className="py-3 text-sm">{product.category}</td>
                        <td className="py-3 text-sm">
                          <span className="text-red-600 font-medium">{product.stock}</span>
                        </td>
                        <td className="py-3 text-sm">${product.price.toFixed(2)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

