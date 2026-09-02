import React from 'react';
import { CustomerUser, Booking } from '../types';
import {
  User,
  CalendarCheck,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Plus,
  Layers,
  ArrowRight,
  LogOut
} from 'lucide-react';

interface CustomerDashboardPageProps {
  customer: CustomerUser;
  bookings?: Booking[];
  onNavigate: (page: string, serviceSlug?: string) => void;
  onLogout: () => void;
}

export const CustomerDashboardPage: React.FC<CustomerDashboardPageProps> = ({
  customer,
  bookings = [],
  onNavigate,
  onLogout
}) => {
  // Filter bookings matching this customer
  const customerBookings = (bookings || []).filter(
    (b) =>
      b?.customerId === customer?.id ||
      b?.phone === customer?.mobile ||
      (b?.email && customer?.email && b.email.toLowerCase() === customer.email.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full">New Request</span>;
      case 'Contacted':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-1 rounded-full">Contacted / Scheduled</span>;
      case 'Confirmed':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full">Inspection Confirmed</span>;
      case 'Completed':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">Completed &amp; Sealed</span>;
      case 'Cancelled':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-1 rounded-full">Cancelled</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Customer Welcome Header */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-black font-heading shadow-md">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-white">
                  Welcome, {customer.name}
                </h1>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Active Client
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-blue-400" />
                  {customer.mobile}
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-blue-400" />
                    {customer.email}
                  </span>
                )}
                {customer.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-400" />
                    {customer.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('book')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Book New Service</span>
            </button>
            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold">Total Appointments</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {customerBookings.length}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold">Active / In Progress</span>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {customerBookings.filter((b) => b.status === 'New' || b.status === 'Confirmed' || b.status === 'Contacted').length}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold">Completed Treatments</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {customerBookings.filter((b) => b.status === 'Completed').length}
            </div>
          </div>
        </div>

        {/* Bookings History Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold font-heading text-slate-900">
                Your Service Appointments
              </h2>
              <p className="text-xs text-slate-500">
                Track inspection dates, assigned technicians, and leak-proofing status.
              </p>
            </div>

            <button
              onClick={() => onNavigate('book')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Book Appointment</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {customerBookings.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No appointments recorded yet.</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Need a terrace inspection or bathroom leak repair? Book an appointment and our technician will arrive on time.
              </p>
              <button
                onClick={() => onNavigate('book')}
                className="mt-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Book First Inspection
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {customerBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all bg-slate-50/50 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {b.bookingCode || b.id}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{b.service}</h3>
                    </div>
                    <div>{getStatusBadge(b.status)}</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <CalendarCheck className="w-3.5 h-3.5 text-blue-500" />
                      <span>
                        Date of Work: <strong>{b.workDate || 'As scheduled'}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>Slot: {b.preferredTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      <span>{b.location}</span>
                    </div>
                  </div>

                  {b.message && (
                    <div className="text-xs bg-white p-3 rounded-xl border border-slate-200 text-slate-700">
                      <strong className="text-slate-900">Problem Description:</strong> {b.message}
                    </div>
                  )}

                  {b.photos && b.photos.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                        Uploaded Photos of Damage ({b.photos.length}):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {b.photos.map((p, idx) => (
                          <img
                            key={idx}
                            src={p}
                            alt="Damage"
                            className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
