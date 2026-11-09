import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, Plus, Trash2, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { DeliveryArea } from '../../types';
import { formatCurrency } from '../../utils/formatters';

export const AdminDelivery: React.FC = () => {
  const queryClient = useQueryClient();

  const [showAddModal, setShowAddModal] = useState(false);
  const [areaName, setAreaName] = useState('');
  const [pincode, setPincode] = useState('');
  const [deliveryFeeRupees, setDeliveryFeeRupees] = useState('30');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: areas = [], isLoading } = useQuery<DeliveryArea[]>({
    queryKey: ['delivery-areas'],
    queryFn: async () => {
      const res: any = await api.get('/settings/delivery-areas');
      return res.data;
    },
  });

  const addAreaMutation = useMutation({
    mutationFn: async () => {
      const fee = Math.round(parseFloat(deliveryFeeRupees) * 100);
      return await api.post('/settings/admin/delivery-areas', {
        area_name: areaName,
        pincode,
        standard_delivery_fee: fee,
        estimated_delivery_minutes: 35,
        is_serviceable: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-areas'] });
      setShowAddModal(false);
      setAreaName('');
      setPincode('');
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to add delivery area');
    },
  });

  const deleteAreaMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/settings/admin/delivery-areas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-areas'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202820]">Delivery Management</h1>
          <p className="text-xs text-[#6B756D] mt-1">
            Configure delivery hubs, serviceable pincodes, and standard transit charges.
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddModal(true);
            setErrorMsg('');
          }}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Add Serviceable Pincode
        </button>
      </div>

      {/* Free Delivery Threshold Info Banner */}
      <div className="bg-[#EAF5EC] border border-[#237A45]/30 rounded-2xl p-4 flex items-center justify-between text-xs text-[#185C35]">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#237A45]" />
          <div>
            <span className="font-bold">Standard Delivery Threshold:</span> Orders above ₹299.00 receive 100% Free Doorstep Delivery.
          </div>
        </div>
      </div>

      {/* Areas Table */}
      <div className="card-white rounded-3xl bg-white border border-[#E5EAE5] shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7FAF7] text-[#6B756D] font-bold border-b border-[#E5EAE5]">
              <tr>
                <th className="py-3 px-4">Area & Hub Name</th>
                <th className="py-3 px-4">Pincode</th>
                <th className="py-3 px-4">Standard Delivery Charge</th>
                <th className="py-3 px-4">Estimated Transit Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAE5]">
              {areas.map((area) => (
                <tr key={area.id} className="hover:bg-[#F7FAF7] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#202820]">
                    <MapPin className="w-3.5 h-3.5 text-[#237A45] inline mr-1" />
                    {area.area_name}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-xs bg-gray-50 text-[#202820] w-28">
                    {area.pincode}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#237A45]">
                    {formatCurrency(area.standard_delivery_fee)}
                  </td>
                  <td className="py-3.5 px-4 text-[#6B756D]">
                    {area.estimated_delivery_minutes} mins
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[#237A45] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Serviceable
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Remove area ${area.area_name} (${area.pincode})?`)) {
                          deleteAreaMutation.mutate(area.id);
                        }
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-[#E5EAE5]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Area Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E5EAE5] space-y-4">
            <h3 className="text-lg font-extrabold text-[#202820]">Add Serviceable Pincode</h3>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Locality / Area Name</label>
                <input
                  type="text"
                  required
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  placeholder="e.g. Koramangala, Bangalore"
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">6-Digit Pincode</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="560034"
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Standard Delivery Charge (₹)</label>
                <input
                  type="number"
                  value={deliveryFeeRupees}
                  onChange={(e) => setDeliveryFeeRupees(e.target.value)}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                onClick={() => addAreaMutation.mutate()}
                disabled={addAreaMutation.isPending || !areaName || !pincode}
                className="btn-primary flex-1 text-xs py-2.5"
              >
                {addAreaMutation.isPending ? 'Adding...' : 'Add Area'}
              </button>
              <button onClick={() => setShowAddModal(false)} className="btn-outline text-xs py-2.5 px-4">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
