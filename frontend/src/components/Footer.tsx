import React from 'react';
import { Utensils, Clock, MessageSquare, MapPin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const mithusLogo = '/mithus_kitchen_logo.svg';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#E5EAE5] pt-12 pb-8 text-[#202820]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E5EAE5] flex items-center justify-center overflow-hidden shadow-xs p-1">
                <img src={mithusLogo} alt="Mithu's Kitchen" className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">
                MITHU'S <span className="text-[#237A45]">KITCHEN</span>
              </span>
            </div>
            <p className="text-sm text-[#6B756D] leading-relaxed">
              Wholesome, traditional home-cooked meals prepared fresh every morning and evening with clean ingredients and pure cow ghee.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#237A45] bg-[#EAF5EC] px-3 py-1.5 rounded-lg w-fit">
              <span>Zero Preservatives</span> • <span>Zero Soda</span>
            </div>
          </div>

          {/* Meal Timings & Advance Cutoff */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-[#202820] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#237A45]" /> Meal Delivery Timings
            </h4>
            <ul className="text-sm space-y-2 text-[#6B756D]">
              <li className="flex justify-between border-b border-[#E5EAE5] pb-1.5">
                <span className="font-medium text-[#202820]">Breakfast:</span>
                <span>8:00 AM (Order by 3:00 AM)</span>
              </li>
              <li className="flex justify-between border-b border-[#E5EAE5] pb-1.5">
                <span className="font-medium text-[#202820]">Lunch:</span>
                <span>1:00 PM (Order by 8:00 AM)</span>
              </li>
              <li className="flex justify-between border-b border-[#E5EAE5] pb-1.5">
                <span className="font-medium text-[#202820]">Dinner:</span>
                <span>8:00 PM (Order by 3:00 PM)</span>
              </li>
            </ul>
            <p className="text-xs text-[#237A45] font-medium bg-[#EAF5EC] p-2 rounded-lg">
              * 5-Hour advance preparation cutoff applies to ensure hot, fresh cooking.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-[#202820]">
              Quick Navigation
            </h4>
            <ul className="text-sm space-y-2">
              <li>
                <Link to="/menu" className="text-[#6B756D] hover:text-[#237A45] transition-colors">
                  Daily Fresh Menus
                </Link>
              </li>
              <li>
                <Link to="/subscriptions" className="text-[#6B756D] hover:text-[#237A45] transition-colors">
                  7-Day Subscription Plans
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-[#6B756D] hover:text-[#237A45] transition-colors">
                  Track Delivery
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-[#6B756D] hover:text-[#237A45] transition-colors">
                  Staff & Kitchen Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Areas & Contact */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-[#202820] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#237A45]" /> Service Hubs
            </h4>
            <p className="text-sm text-[#6B756D]">
              Delivering to selected pin codes in Bangalore & Chennai with door-to-door temperature insulated boxes.
            </p>
            <div className="pt-1">
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#EAF5EC] text-[#237A45] text-xs font-bold hover:bg-[#d8eedc] transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                WhatsApp Helpdesk: +91 98765 43210
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#E5EAE5] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B756D] gap-3">
          <p>© {new Date().getFullYear()} HOME KITCHEN. All rights reserved. Pay with Cash on Delivery / Cash on Service.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-[#237A45] fill-current" /> for food lovers everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};
