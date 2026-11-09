import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, MapPin, Plus, Trash2, CheckCircle2, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { CustomerAddress } from '../../types';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Add Address Form
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [label, setLabel] = useState('Home');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [pincode, setPincode] = useState('560034');
  const [isDefault, setIsDefault] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Load Addresses
  const { data: addresses = [] } = useQuery<CustomerAddress[]>({
    queryKey: ['customer-addresses'],
    queryFn: async () => {
      const res: any = await api.get('/customer/profile/addresses');
      return res.data;
    },
  });

  // Update Profile Mutation
  const profileMutation = useMutation({
    mutationFn: async () => {
      return await api.put('/customer/profile', { full_name: fullName });
    },
    onSuccess: () => {
      refreshUser();
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    },
  });

  // Add Address Mutation
  const addAddressMutation = useMutation({
    mutationFn: async () => {
      return await api.post('/customer/profile/addresses', {
        label,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        state: 'Karnataka',
        pincode,
        is_default: isDefault,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
      setShowAddressModal(false);
      setAddressLine1('');
      setAddressLine2('');
      setPincode('560034');
    },
    onError: (err: any) => {
      setAddressError(err.message || 'Failed to save address');
    },
  });

  // Delete Address Mutation
  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/customer/profile/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202820]">My Account & Addresses</h1>
        <p className="text-xs text-[#6B756D] mt-1">
          Manage your personal information and delivery destinations.
        </p>
      </div>

      {/* Profile Info Card */}
      <div className="card-white p-6 rounded-2xl bg-white border border-[#E5EAE5] space-y-4">
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#202820] flex items-center gap-2">
          <User className="w-4 h-4 text-[#237A45]" /> Personal Profile
        </h3>

        {profileSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#202820] mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202820] mb-1">Mobile Number (Verified)</label>
            <div className="relative">
              <input
                type="text"
                disabled
                value={user?.phone_number || ''}
                className="input-field text-xs bg-gray-50 text-gray-500 cursor-not-allowed pl-9"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        <button
          onClick={() => profileMutation.mutate()}
          disabled={profileMutation.isPending}
          className="btn-primary text-xs py-2 px-5"
        >
          {profileMutation.isPending ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Addresses Card */}
      <div className="card-white p-6 rounded-2xl bg-white border border-[#E5EAE5] space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#202820] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#237A45]" /> Saved Delivery Addresses
          </h3>

          <button
            onClick={() => setShowAddressModal(true)}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Address
          </button>
        </div>

        {addresses.length === 0 ? (
          <p className="text-xs text-[#6B756D] py-4">No saved addresses. Add an address for one-click checkout.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-[#F7FAF7] border border-[#E5EAE5] p-4 rounded-xl flex flex-col justify-between space-y-2 text-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#202820] bg-white px-2 py-0.5 rounded-md border border-[#E5EAE5]">
                      {addr.label}
                    </span>
                    {addr.is_default && (
                      <span className="text-[10px] font-bold text-[#237A45] bg-[#EAF5EC] px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-[#202820] mt-1">{addr.address_line1}</p>
                  {addr.address_line2 && <p className="text-[#6B756D]">{addr.address_line2}</p>}
                  <p className="text-[#6B756D]">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E5EAE5] flex justify-end">
                  <button
                    onClick={() => deleteAddressMutation.mutate(addr.id)}
                    className="text-red-600 hover:text-red-800 text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E5EAE5] space-y-4">
            <h3 className="text-lg font-extrabold text-[#202820]">Add New Delivery Address</h3>

            {addressError && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{addressError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Address Label</label>
                <select
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="input-field text-xs"
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Address Line 1</label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Flat, building, street"
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Landmark or locality"
                  className="input-field text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="default_addr"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="accent-[#237A45]"
                />
                <label htmlFor="default_addr">Set as default address</label>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                onClick={() => addAddressMutation.mutate()}
                disabled={addAddressMutation.isPending || !addressLine1 || !pincode}
                className="btn-primary flex-1 text-xs py-2.5"
              >
                {addAddressMutation.isPending ? 'Saving...' : 'Save Address'}
              </button>
              <button
                onClick={() => setShowAddressModal(false)}
                className="btn-outline text-xs py-2.5 px-4"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
