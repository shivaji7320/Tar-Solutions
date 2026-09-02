import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Cloud,
  CloudOff,
  Table,
  ArrowRight,
  Code2,
  ShieldCheck,
  Server,
  Layers
} from 'lucide-react';
import { Booking } from '../types';

interface SupabaseStatus {
  connected: boolean;
  status: string;
  message: string;
  projectId: string;
  projectUrl: string;
  tableName: string;
  pingMs?: number;
  rowCount?: number;
  error?: string;
}

interface SupabaseManagerProps {
  bookings: Booking[];
  onRefreshLocal?: () => void;
}

export const SupabaseManager: React.FC<SupabaseManagerProps> = ({
  bookings,
  onRefreshLocal
}) => {
  const [status, setStatus] = useState<SupabaseStatus | null>(null);
  const [sqlData, setSqlData] = useState<{ sql: string; tableName: string; projectId: string; projectUrl: string } | null>(null);
  const [remoteBookings, setRemoteBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'sql' | 'remote_records'>('overview');

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/supabase/status');
      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      setStatus({
        connected: false,
        status: 'SERVER_ERROR',
        message: 'Could not connect to backend Supabase service route.',
        projectId: 'fclidxvhvnntnbyhrmda',
        projectUrl: 'https://fclidxvhvnntnbyhrmda.supabase.co',
        tableName: 'bookings',
        error: err?.message
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSql = async () => {
    try {
      const res = await fetch('/api/supabase/sql');
      const data = await res.json();
      setSqlData(data);
    } catch (e) {
      console.error('Failed to load SQL schema', e);
    }
  };

  const fetchRemoteBookings = async () => {
    try {
      const res = await fetch('/api/supabase/bookings');
      const data = await res.json();
      if (data.success) {
        setRemoteBookings(data.bookings || []);
      }
    } catch (e) {
      console.error('Failed to load remote Supabase records', e);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchSql();
    fetchRemoteBookings();
  }, []);

  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/supabase/sync-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncResult({
          success: true,
          message: data.message || `Successfully synced records to Supabase PostgreSQL table.`
        });
        fetchStatus();
        fetchRemoteBookings();
        if (onRefreshLocal) onRefreshLocal();
      } else {
        setSyncResult({
          success: false,
          message: data.error || 'Failed to sync all records. Verify table schema in Supabase.'
        });
      }
    } catch (err: any) {
      setSyncResult({
        success: false,
        message: err?.message || 'Network error executing sync.'
      });
    } finally {
      setSyncing(false);
    }
  };

  const copySqlToClipboard = () => {
    if (sqlData?.sql) {
      navigator.clipboard.writeText(sqlData.sql);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    }
  };

  const localSyncedCount = bookings.filter((b) => b.supabaseSynced).length;
  const localPendingCount = bookings.length - localSyncedCount;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold font-heading text-slate-900">
              Supabase PostgreSQL Cloud Backend
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time appointment data synchronization with your Supabase database instance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchStatus();
              fetchRemoteBookings();
            }}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>

          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Cloud className="w-4 h-4" />
            <span>{syncing ? 'Syncing...' : 'Sync All Local Records'}</span>
          </button>
        </div>
      </div>

      {/* Sync feedback notification */}
      {syncResult && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-3 ${
            syncResult.success
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border border-amber-200 text-amber-900'
          }`}
        >
          {syncResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <div className="flex-1 font-medium">{syncResult.message}</div>
        </div>
      )}

      {/* Status KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Connection Status Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>Database Connection</span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                status?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
          </span>
          <div className="text-lg font-black text-slate-900 flex items-center gap-2">
            {status?.connected ? (
              <span className="text-emerald-700">Online &amp; Synchronized</span>
            ) : (
              <span className="text-amber-700">Schema Configuration</span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 truncate font-mono">
            {status?.projectUrl || 'https://fclidxvhvnntnbyhrmda.supabase.co'}
          </div>
        </div>

        {/* Sync Progress Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-semibold">Local vs Cloud Sync</span>
          <div className="text-2xl font-black text-slate-900 flex items-baseline gap-2">
            <span>{localSyncedCount}</span>
            <span className="text-xs font-semibold text-slate-400">/ {bookings.length} Synced</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {localPendingCount > 0 ? (
              <span className="text-amber-600 font-bold">{localPendingCount} records ready to push</span>
            ) : (
              <span className="text-emerald-600 font-bold">100% up to date with cloud</span>
            )}
          </div>
        </div>

        {/* Remote Row Count Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-semibold">Table: {status?.tableName || 'bookings'}</span>
          <div className="text-2xl font-black text-emerald-700">
            {remoteBookings.length > 0 ? remoteBookings.length : status?.rowCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>PostgreSQL Records</span>
            {status?.pingMs && (
              <span className="font-mono text-[10px] text-slate-400">{status.pingMs}ms latency</span>
            )}
          </div>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`pb-3 cursor-pointer flex items-center gap-1.5 transition-colors border-b-2 ${
            activeSubTab === 'overview'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Integration &amp; Credentials</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sql')}
          className={`pb-3 cursor-pointer flex items-center gap-1.5 transition-colors border-b-2 ${
            activeSubTab === 'sql'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Supabase SQL Setup Script</span>
        </button>

        <button
          onClick={() => setActiveSubTab('remote_records')}
          className={`pb-3 cursor-pointer flex items-center gap-1.5 transition-colors border-b-2 ${
            activeSubTab === 'remote_records'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Remote Table Records ({remoteBookings.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: INTEGRATION & CREDENTIALS */}
      {activeSubTab === 'overview' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="space-y-2">
            <h3 className="text-base font-bold font-heading text-slate-900">
              Supabase Project Connection Details
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Appointments submitted via customer survey forms automatically push to your Supabase PostgreSQL cloud table.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Supabase Project URL</span>
              <div className="font-mono font-bold text-slate-900 break-all">
                {status?.projectUrl || 'https://fclidxvhvnntnbyhrmda.supabase.co'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">PostgreSQL Table Name</span>
              <div className="font-mono font-bold text-emerald-700">
                {status?.tableName || 'bookings'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Project ID</span>
              <div className="font-mono font-bold text-slate-800">
                {status?.projectId || 'fclidxvhvnntnbyhrmda'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Security / RLS</span>
              <div className="font-semibold text-emerald-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Row Level Security (RLS) Ready</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold font-heading">Quick Setup in 3 Simple Steps</h4>
              </div>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
              >
                <span>Open Supabase Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                Open your Supabase project (<strong>{status?.projectId || 'fclidxvhvnntnbyhrmda'}</strong>) and click <strong>SQL Editor</strong>.
              </li>
              <li>
                Switch to the <strong>Supabase SQL Setup Script</strong> tab above, copy the complete script, and run it in the SQL Editor.
              </li>
              <li>
                Click <strong>Sync All Local Records</strong> above to push all current bookings into your live table.
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SQL SCRIPT */}
      {activeSubTab === 'sql' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-heading text-slate-900">
                Official PostgreSQL DDL Setup Script
              </h3>
              <p className="text-xs text-slate-500">
                Paste this into your Supabase SQL Editor to create the tables, indexes, and RLS policies.
              </p>
            </div>

            <button
              onClick={copySqlToClipboard}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-blue-400" />}
              <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
            </button>
          </div>

          <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
            <pre>{sqlData?.sql || '-- Loading SQL script...'}</pre>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: REMOTE RECORDS */}
      {activeSubTab === 'remote_records' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Live Cloud Records in Supabase
              </h3>
              <p className="text-xs text-slate-500">
                Queried directly from table <code className="text-emerald-700 font-mono">bookings</code>
              </p>
            </div>
            <button
              onClick={fetchRemoteBookings}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh Records</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="p-3.5">Booking Code</th>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Mobile</th>
                  <th className="p-3.5">Service</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Survey Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {remoteBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No records found in remote Supabase table. Click "Sync All Local Records" to push appointments.
                    </td>
                  </tr>
                ) : (
                  remoteBookings.map((b: any, idx: number) => (
                    <tr key={b.id || idx} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono font-bold text-blue-600">
                        {b.booking_code || b.bookingcode || b.id}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-900">
                        {b.customer_name || b.customername || b.customerName}
                      </td>
                      <td className="p-3.5 text-slate-600">{b.phone}</td>
                      <td className="p-3.5 text-slate-700">{b.service}</td>
                      <td className="p-3.5 text-slate-600">{b.location}</td>
                      <td className="p-3.5 text-slate-600">{b.work_date || b.workDate}</td>
                      <td className="p-3.5">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {b.status || 'New'}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                        {b.created_at ? new Date(b.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
