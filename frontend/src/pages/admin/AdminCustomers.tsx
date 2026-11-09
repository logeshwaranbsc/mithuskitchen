import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Phone, MapPin, Search, ShoppingBag, CalendarCheck } from 'lucide-react';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AdminCustomers: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data: customers = [], isLoading } = useQuery<any[]>({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const res: any = await api.get('/settings/admin/customers');
      return res.data;
    },
  });

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.full_name?.toLowerCase().includes(q) || c.phone_number?.includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202820]">Customer Management</h1>
        <p className="text-xs text-[#6B756D] mt-1">
          Registered customer accounts, saved delivery locations, and lifetime food order history.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#E5EAE5] shadow-soft">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#6B756D] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer by name or phone..."
            className="input-field pl-10 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((customer) => (
          <div
            key={customer.id}
            className="card-white p-6 rounded-3xl bg-white border border-[#E5EAE5] shadow-soft space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EAF5EC] text-[#237A45] flex items-center justify-center font-bold text-sm">
                  {customer.full_name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#202820]">{customer.full_name}</h3>
                  <p className="text-xs text-[#6B756D] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#237A45]" /> {customer.phone_number}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 bg-[#F7FAF7] p-3 rounded-2xl border border-[#E5EAE5] text-center text-xs">
                <div>
                  <span className="text-[#6B756D] text-[10px] block">Orders</span>
                  <span className="font-bold text-[#202820]">{customer.total_orders}</span>
                </div>
                <div>
                  <span className="text-[#6B756D] text-[10px] block">7-Day Subs</span>
                  <span className="font-bold text-[#237A45]">{customer.total_subscriptions}</span>
                </div>
                <div>
                  <span className="text-[#6B756D] text-[10px] block">Total Spent</span>
                  <span className="font-bold text-[#202820]">{formatCurrency(customer.total_spent)}</span>
                </div>
              </div>

              {/* Addresses */}
              <div className="space-y-1 text-xs">
                <span className="font-bold text-[#6B756D] uppercase text-[10px] tracking-wider block">
                  Delivery Addresses ({customer.addresses?.length || 0}):
                </span>
                {(customer.addresses || []).slice(0, 2).map((a: any) => (
                  <p key={a.id} className="text-[#202820] truncate">
                    <MapPin className="w-3 h-3 text-[#237A45] inline mr-1" />
                    {a.label}: {a.address_line1}, {a.city} - {a.pincode}
                  </p>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5EAE5] text-[11px] text-[#6B756D]">
              Member since {formatDate(customer.created_at?.split('T')[0] || '')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
