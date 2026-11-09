import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'subscription' | 'payment';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'order' }) => {
  const s = status.toLowerCase();

  let bg = 'bg-gray-100 text-gray-700 border-gray-200';

  if (s === 'confirmed' || s === 'active' || s === 'collected') {
    bg = 'bg-[#EAF5EC] text-[#237A45] border-[#237A45]/30';
  } else if (s === 'preparing' || s === 'pending') {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (s === 'out_for_delivery' || s === 'out for delivery') {
    bg = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (s === 'delivered' || s === 'completed') {
    bg = 'bg-[#EAF5EC] text-[#185C35] border-[#185C35]/30 font-bold';
  } else if (s === 'cancelled' || s === 'failed') {
    bg = 'bg-red-50 text-red-700 border-red-200';
  } else if (s === 'paused') {
    bg = 'bg-orange-50 text-orange-700 border-orange-200';
  }

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
      {formatText(status)}
    </span>
  );
};
