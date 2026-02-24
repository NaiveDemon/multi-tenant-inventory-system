import { useEffect, useState } from "react";
import { api } from "./api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const tenantId = "699df0eea6d1aa04ff1937c9";

function App() {
  const [value, setValue] = useState(0);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [topSellers, setTopSellers] = useState<any[]>([]);
  const [graph, setGraph] = useState<any[]>([]);

  useEffect(() => {
    api.get(`/dashboard/${tenantId}/inventory-value`)
      .then(res => setValue(res.data.totalValue));

    api.get(`/dashboard/${tenantId}/low-stock`)
      .then(res => setLowStock(res.data));

    api.get(`/dashboard/${tenantId}/top-sellers`)
      .then(res => setTopSellers(res.data));

    api.get(`/dashboard/${tenantId}/stock-graph`)
      .then(res => setGraph(res.data));
  }, []);

  const formattedGraph = graph.map((item: any) => ({
  date: item._id?.date,
  total: item.total,
}));

return (
  <div className="container">
    <h1 className="title">Inventory Dashboard</h1>

    {/* Inventory Value */}
    <div className="card">
      <h2>Total Inventory Value</h2>
      <div className="value">₹{value}</div>
    </div>

    {/* Low Stock */}
    <div className="card">
      <div className="section-title">Low Stock Items</div>
      {lowStock.length === 0 ? (
        <p>No low stock items 🎉</p>
      ) : (
        lowStock.map((item: any) => (
          <div key={item._id?.toString()} className="list-item">
            <strong>{item.sku}</strong> — Stock: {item.stock}
          </div>
        ))
      )}
    </div>

    {/* Top Sellers */}
    <div className="card">
      <div className="section-title">Top Sellers (Last 30 Days)</div>
      {topSellers.length === 0 ? (
        <p>No sales data available.</p>
      ) : (
        topSellers.map((item: any) => (
          <div key={item._id?.toString()} className="list-item">
            Variant: {item._id?.toString()} — Sold: {item.totalSold}
          </div>
        ))
      )}
    </div>

    {/* Stock Movement Chart */}
    <div className="card">
      <div className="section-title">Stock Movement (Last 7 Days)</div>
      {formattedGraph.length === 0 ? (
        <p>No stock movement data available.</p>
      ) : (
        <LineChart width={900} height={300} data={formattedGraph}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#4f46e5"
            strokeWidth={2}
          />
        </LineChart>
      )}
    </div>
  </div>
);
}

export default App;