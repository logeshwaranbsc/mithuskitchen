import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download, Calendar, DollarSign, ShoppingBag, Utensils } from 'lucide-react';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

export const AdminReports: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Daily Sales
  const { data: dailySales = [], isLoading: dailyLoading } = useQuery<any[]>({
    queryKey: ['daily-sales', startDate, endDate],
    queryFn: async () => {
      let url = '/reports/daily';
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const res: any = await api.get(url);
      return res.data;
    },
  });

  // Food-wise Sales
  const { data: foodSales = [], isLoading: foodLoading } = useQuery<any[]>({
    queryKey: ['food-wise-sales'],
    queryFn: async () => {
      const res: any = await api.get('/reports/food-wise');
      return res.data;
    },
  });

  // Export CSV
  const handleExportCsv = async () => {
    try {
      let url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'}/reports/export-csv`;
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const token = localStorage.getItem('hk_token');
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `home_kitchen_sales_report_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to export CSV report');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202820]">Sales & Financial Reports</h1>
          <p className="text-xs text-[#6B756D] mt-1">
            Analyze daily volumes, top revenue dishes, and export immutable transaction logs.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 self-start shadow-sm"
        >
          <Download className="w-4 h-4" /> Export CSV Report
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-[#E5EAE5] shadow-soft text-xs">
        <span className="font-bold text-[#202820] flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-[#237A45]" /> Filter Date Range:
        </span>
        <div className="flex items-center gap-2">
          <span>From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field text-xs py-1.5 w-36"
          />
        </div>
        <div className="flex items-center gap-2">
          <span>To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field text-xs py-1.5 w-36"
          />
        </div>
        {(startDate || endDate) && (
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="text-[11px] font-semibold text-[#237A45] underline ml-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Sales Table */}
        <div className="card-white rounded-3xl bg-white border border-[#E5EAE5] shadow-soft p-6 space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#237A45]" />
            <h2 className="font-extrabold text-base text-[#202820]">Daily Revenue Breakdown</h2>
          </div>

          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7FAF7] text-[#6B756D] font-bold border-b border-[#E5EAE5] sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Orders Count</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAE5]">
                {dailySales.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-[#6B756D]">
                      No daily order records.
                    </td>
                  </tr>
                ) : (
                  dailySales.map((row) => (
                    <tr key={row.date} className="hover:bg-[#F7FAF7]">
                      <td className="py-2.5 px-3 font-semibold text-[#202820]">{row.date}</td>
                      <td className="py-2.5 px-3">{row.ordersCount} orders</td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#237A45]">
                        {formatCurrency(row.revenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Food-wise Sales Table */}
        <div className="card-white rounded-3xl bg-white border border-[#E5EAE5] shadow-soft p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-[#237A45]" />
            <h2 className="font-extrabold text-base text-[#202820]">Top Selling Dishes</h2>
          </div>

          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7FAF7] text-[#6B756D] font-bold border-b border-[#E5EAE5] sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Dish Name</th>
                  <th className="py-2.5 px-3">Qty Sold</th>
                  <th className="py-2.5 px-3 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAE5]">
                {foodSales.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-[#6B756D]">
                      No food sales recorded yet.
                    </td>
                  </tr>
                ) : (
                  foodSales.map((item) => (
                    <tr key={item.food_name} className="hover:bg-[#F7FAF7]">
                      <td className="py-2.5 px-3 font-semibold text-[#202820]">{item.food_name}</td>
                      <td className="py-2.5 px-3">{item.total_quantity} units</td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#237A45]">
                        {formatCurrency(item.total_revenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
