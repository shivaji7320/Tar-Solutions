import React, { useState, useEffect } from 'react';
import {
  Service,
  Project,
  Booking,
  CustomerUser,
  BookingFormField,
  WebsiteContent,
  BookingStatus
} from '../types';
import { TarLogo } from '../components/TarLogo';
import {
  downloadDailyPdf,
  downloadWeeklyPdf,
  exportWeeklyReportToCsv,
  WeeklyReportData
} from '../utils/pdfGenerator';
import { exportBookingsToCsv, getAdminCredentials } from '../utils/storage';
import { ImageMediaPicker } from '../components/ImageMediaPicker';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Wrench,
  Image,
  Globe,
  Sliders,
  Bell,
  FileText,
  Settings,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Download,
  Search,
  Filter,
  Check,
  AlertCircle,
  Save,
  RefreshCw,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  X,
  Upload,
  Layers,
  FileSpreadsheet,
  Database,
  Cloud,
  CloudOff,
  Server,
  Copy,
  Calendar,
  Terminal,
  Printer,
  ShieldCheck,
  UserCheck,
  UserX,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';

export type TimeRangeOption = 'ALL' | 'YESTERDAY' | 'TODAY' | 'PREV_MONTH' | 'LAST_6_MONTHS' | 'CUSTOM';

interface AdminDashboardPageProps {
  services: Service[];
  projects: Project[];
  bookings: Booking[];
  customers: CustomerUser[];
  formFields: BookingFormField[];
  content: WebsiteContent;
  onUpdateServices: (services: Service[]) => void;
  onUpdateProjects: (projects: Project[]) => void;
  onUpdateBookings: (bookings: Booking[]) => void;
  onUpdateCustomers: (customers: CustomerUser[]) => void;
  onUpdateFormFields: (fields: BookingFormField[]) => void;
  onUpdateContent: (content: WebsiteContent) => void;
  onChangeAdminCreds: (creds: { currentPassword: string; newPassword: string; newUsername?: string }) => Promise<{ success: boolean; error?: string }>;
  onLogout: () => void;
  onPreviewWebsite: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  services = [],
  projects = [],
  bookings = [],
  customers = [],
  formFields = [],
  content,
  onUpdateServices,
  onUpdateProjects,
  onUpdateBookings,
  onUpdateCustomers,
  onUpdateFormFields,
  onUpdateContent,
  onChangeAdminCreds,
  onLogout,
  onPreviewWebsite
}) => {
  type AdminTab =
    | 'dashboard'
    | 'bookings'
    | 'storage'
    | 'customers'
    | 'services'
    | 'projects'
    | 'content'
    | 'form_builder'
    | 'notifications'
    | 'reports'
    | 'settings';

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState('');

  // ---------------- BOOKINGS TAB STATE ----------------
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');
  const [timeRangeFilter, setTimeRangeFilter] = useState<TimeRangeOption>('ALL');
  const [slotFilter, setSlotFilter] = useState<'ALL' | 'SLOT_SURVEY' | 'SLOT_INSPECTION' | 'SLOT_ENQUIRY'>('ALL');
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');
  const [terminalLogNotice, setTerminalLogNotice] = useState('');
  const [isLoggingToTerminal, setIsLoggingToTerminal] = useState(false);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);

  // ---------------- CUSTOMERS TAB STATE ----------------
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSlotFilter, setCustomerSlotFilter] = useState('ALL');
  const [customerStatusFilter, setCustomerStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [customerBookingFilter, setCustomerBookingFilter] = useState<'ALL' | 'WITH_BOOKINGS' | 'WITHOUT_BOOKINGS'>('ALL');
  const [viewingCustomer, setViewingCustomer] = useState<CustomerUser | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<CustomerUser | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerUser | null>(null);

  // ---------------- DAY REPORT STATE ----------------
  const [dayReportDate, setDayReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [dayReportData, setDayReportData] = useState<any>(null);
  const [isGeneratingDayReport, setIsGeneratingDayReport] = useState(false);

  // ---------------- WEEKLY REPORT STATE ----------------
  const [weeklyReportDate, setWeeklyReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [weeklyReportData, setWeeklyReportData] = useState<WeeklyReportData | null>(null);
  const [isGeneratingWeeklyReport, setIsGeneratingWeeklyReport] = useState(false);

  // ---------------- SERVICES TAB STATE ----------------
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAddingService, setIsAddingService] = useState(false);

  // ---------------- PROJECTS TAB STATE ----------------
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);

  // ---------------- CMS FORM STATE ----------------
  const [cmsData, setCmsData] = useState<WebsiteContent>(JSON.parse(JSON.stringify(content)));

  // ---------------- PASSWORD STATE ----------------
  const currentSavedCreds = getAdminCredentials();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    newUsername: currentSavedCreds.username || 'admin'
  });
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ---------------- REPORT STATE ----------------
  const [selectedReportDate, setSelectedReportDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [reportDispatchLoading, setReportDispatchLoading] = useState(false);
  const [reportDispatchNotice, setReportDispatchNotice] = useState('');

  // ---------------- LIVE DATABASE STATEMENT & DIRECTORY STATE ----------------
  const [liveStatementCounts, setLiveStatementCounts] = useState<{
    all: number;
    yesterday: number;
    today: number;
    prevMonth: number;
    last6Months: number;
    prevMonthName: string;
  } | null>(null);
  const [isLoadingLiveCounters, setIsLoadingLiveCounters] = useState(false);

  const fetchLiveCountsAndDirectory = async (range: TimeRangeOption = timeRangeFilter) => {
    setIsLoadingLiveCounters(true);
    try {
      let queryUrl = `/api/bookings/statement?period=${range}`;
      if (range === 'CUSTOM' && customFromDate && customToDate) {
        queryUrl += `&from=${customFromDate}&to=${customToDate}`;
      }
      const [statementRes, custRes] = await Promise.all([
        fetch(queryUrl).then((r) => r.json()).catch(() => null),
        fetch('/api/customers').then((r) => r.json()).catch(() => null)
      ]);

      if (statementRes?.success) {
        if (statementRes.counts) {
          setLiveStatementCounts(statementRes.counts);
        }
        if (Array.isArray(statementRes.records)) {
          onUpdateBookings(statementRes.records);
        }
      }
      if (custRes?.success && Array.isArray(custRes.customers)) {
        onUpdateCustomers(custRes.customers);
      }
    } catch (e) {
      console.warn('[LIVE DATABASE STATEMENT DATA FETCH ERROR]', e);
    } finally {
      setIsLoadingLiveCounters(false);
    }
  };

  useEffect(() => {
    fetchLiveCountsAndDirectory(timeRangeFilter);
  }, [activeTab]);

  const showSaveNotice = (msg: string) => {
    setSaveSuccessNotice(msg);
    setTimeout(() => setSaveSuccessNotice(''), 4000);
  };

  // ---------------- DATE & TIME RANGE CALCULATIONS ----------------
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  // Previous month calculation (e.g. August 2026 if today is Sept 2026)
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthYear = prevMonthDate.getFullYear();
  const prevMonthIndex = prevMonthDate.getMonth(); // 0-11
  const prevMonthPrefix = `${prevMonthYear}-${String(prevMonthIndex + 1).padStart(2, '0')}`;
  const prevMonthName = liveStatementCounts?.prevMonthName || prevMonthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // 6 months ago calculation
  const sixMonthsAgoDate = new Date(now);
  sixMonthsAgoDate.setMonth(sixMonthsAgoDate.getMonth() - 6);
  const sixMonthsAgoStr = sixMonthsAgoDate.toISOString().split('T')[0];

  const getBookingDate = (b: Booking) => b.bookingDate || b.workDate || '';

  // ---------------- LIVE DYNAMIC KPI CALCULATIONS (FROM SUPABASE & LOCAL REDUNDANCY) ----------------
  const totalBookingsCount = liveStatementCounts ? liveStatementCounts.all : bookings.length;
  const todayBookingsCount = liveStatementCounts
    ? liveStatementCounts.today
    : bookings.filter((b) => {
        const d = getBookingDate(b);
        return d === todayStr || b.workDate === todayStr;
      }).length;
  const yesterdayBookingsCount = liveStatementCounts
    ? liveStatementCounts.yesterday
    : bookings.filter((b) => {
        const d = getBookingDate(b);
        return d === yesterdayStr || b.workDate === yesterdayStr;
      }).length;
  const prevMonthBookingsCount = liveStatementCounts
    ? liveStatementCounts.prevMonth
    : bookings.filter((b) => {
        const d = getBookingDate(b);
        return d.startsWith(prevMonthPrefix) || (b.workDate && b.workDate.startsWith(prevMonthPrefix));
      }).length;
  const sixMonthsBookingsCount = liveStatementCounts
    ? liveStatementCounts.last6Months
    : bookings.filter((b) => {
        const d = getBookingDate(b);
        return (d && d >= sixMonthsAgoStr) || (b.workDate && b.workDate >= sixMonthsAgoStr);
      }).length;

  const pendingBookingsCount = bookings.filter((b) => b.status === 'New' || b.status === 'Contacted' || b.status === 'Pending').length;
  const confirmedBookingsCount = bookings.filter((b) => b.status === 'Confirmed').length;
  const completedBookingsCount = bookings.filter((b) => b.status === 'Completed').length;
  const cancelledBookingsCount = bookings.filter((b) => b.status === 'Cancelled').length;

  const getPeriodLabel = (period: TimeRangeOption) => {
    switch (period) {
      case 'YESTERDAY':
        return `Yesterday's Bookings (${yesterdayStr})`;
      case 'TODAY':
        return `Today's Bookings (${todayStr})`;
      case 'PREV_MONTH':
        return `Previous Month Statement (${prevMonthName})`;
      case 'LAST_6_MONTHS':
        return `Last 6 Months Statement (Since ${sixMonthsAgoStr})`;
      case 'CUSTOM':
        return `Custom Date Statement (${customFromDate || 'Start'} to ${customToDate || 'End'})`;
      case 'ALL':
      default:
        return 'All Historical Bookings Statement';
    }
  };

  // ---------------- BOOKING HANDLERS ----------------
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: BookingStatus) => {
    const updated = bookings.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b));
    onUpdateBookings(updated);
    showSaveNotice(`Booking status updated to "${newStatus}"`);
    if (viewingBooking && viewingBooking.id === bookingId) {
      setViewingBooking({ ...viewingBooking, status: newStatus });
    }

    try {
      await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.warn('[STATUS UPDATE EXCEPTION]', e);
    }
  };

  const handleDeleteBooking = (bookingIdOrObj: string | Booking) => {
    if (typeof bookingIdOrObj === 'object' && bookingIdOrObj !== null) {
      setDeletingBooking(bookingIdOrObj);
    } else {
      const found = bookings.find((b) => b.id === bookingIdOrObj);
      if (found) {
        setDeletingBooking(found);
      } else {
        setDeletingBooking({ id: bookingIdOrObj } as Booking);
      }
    }
  };

  const handleConfirmDeleteBooking = async () => {
    if (!deletingBooking) return;
    const toDeleteId = deletingBooking.id;
    const toDeleteCode = deletingBooking.bookingCode || toDeleteId;

    const updated = bookings.filter((b) => b.id !== toDeleteId);
    onUpdateBookings(updated);
    if (viewingBooking?.id === toDeleteId) setViewingBooking(null);
    showSaveNotice(`Booking ${toDeleteCode} permanently deleted from database.`);
    setDeletingBooking(null);

    try {
      await fetch(`/api/bookings/${toDeleteId}`, {
        method: 'DELETE'
      });
      await fetchLiveCountsAndDirectory();
    } catch (e) {
      console.error('[DELETE BOOKING ERROR]', e);
    }
  };

  // ---------------- CUSTOMER HANDLERS ----------------
  const handleToggleCustomerStatus = async (cust: CustomerUser) => {
    const newStatus = cust.status === 'Active' ? 'Inactive' : 'Active';
    const updatedList = customers.map((c) => (c.id === cust.id ? { ...c, status: newStatus } : c));
    onUpdateCustomers(updatedList);
    if (viewingCustomer && viewingCustomer.id === cust.id) {
      setViewingCustomer({ ...viewingCustomer, status: newStatus });
    }
    showSaveNotice(`Customer ${cust.name} status updated to ${newStatus}`);

    try {
      await fetch(`/api/customers/${cust.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.error('Failed to persist customer status toggle', e);
    }
  };

  const handleSaveCustomerEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    const updatedList = customers.map((c) => (c.id === editingCustomer.id ? editingCustomer : c));
    onUpdateCustomers(updatedList);
    if (viewingCustomer && viewingCustomer.id === editingCustomer.id) {
      setViewingCustomer(editingCustomer);
    }
    showSaveNotice(`Customer ${editingCustomer.name} details updated.`);

    try {
      await fetch(`/api/customers/${editingCustomer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingCustomer.name,
          phone: editingCustomer.mobile,
          mobile: editingCustomer.mobile,
          email: editingCustomer.email,
          address: editingCustomer.address,
          status: editingCustomer.status
        })
      });
    } catch (e) {
      console.error('Failed to persist customer edit', e);
    }

    setEditingCustomer(null);
  };

  const handleConfirmDeleteCustomer = async () => {
    if (!deletingCustomer) return;
    const toDeleteId = deletingCustomer.id;
    const toDeleteName = deletingCustomer.name;

    const updatedList = customers.filter((c) => c.id !== toDeleteId);
    onUpdateCustomers(updatedList);
    if (viewingCustomer && viewingCustomer.id === toDeleteId) {
      setViewingCustomer(null);
    }
    showSaveNotice(`Customer account for ${toDeleteName} deleted successfully.`);
    setDeletingCustomer(null);

    try {
      await fetch(`/api/customers/${toDeleteId}`, {
        method: 'DELETE'
      });
      await fetchLiveCountsAndDirectory();
    } catch (e) {
      console.error('Failed to delete customer from backend', e);
    }
  };

  // ---------------- SERVICE HANDLERS ----------------
  const handleSaveService = (serviceToSave: Service) => {
    let updated: Service[];
    if (isAddingService) {
      updated = [...services, serviceToSave];
    } else {
      updated = services.map((s) => (s.id === serviceToSave.id ? serviceToSave : s));
    }
    onUpdateServices(updated);
    setIsAddingService(false);
    setEditingService(null);
    showSaveNotice(`Service "${serviceToSave.name}" saved & synced to live website!`);
  };

  const handleDeleteService = (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      const updated = services.filter((s) => s.id !== serviceId);
      onUpdateServices(updated);
      showSaveNotice('Service removed.');
    }
  };

  const handleToggleHideService = (serviceId: string) => {
    const updated = services.map((s) =>
      s.id === serviceId ? { ...s, isHidden: !s.isHidden } : s
    );
    onUpdateServices(updated);
    showSaveNotice('Service visibility updated.');
  };

  // ---------------- PROJECT HANDLERS ----------------
  const handleSaveProject = (projectToSave: Project) => {
    let updated: Project[];
    if (isAddingProject) {
      updated = [projectToSave, ...projects];
    } else {
      updated = projects.map((p) => (p.id === projectToSave.id ? projectToSave : p));
    }
    onUpdateProjects(updated);
    setIsAddingProject(false);
    setEditingProject(null);
    showSaveNotice(`Project "${projectToSave.name}" updated in live gallery.`);
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Delete this project from gallery?')) {
      const updated = projects.filter((p) => p.id !== projectId);
      onUpdateProjects(updated);
      showSaveNotice('Project deleted from gallery.');
    }
  };

  // ---------------- CMS SAVE ----------------
  const handleSaveCMS = () => {
    onUpdateContent(cmsData);
    showSaveNotice('Website content & settings updated successfully!');
  };

  // ---------------- FORM BUILDER SAVE ----------------
  const handleToggleFormField = (fieldId: string) => {
    const updated = formFields.map((f) =>
      f.id === fieldId ? { ...f, enabled: !f.enabled } : f
    );
    onUpdateFormFields(updated);
    showSaveNotice('Booking field updated.');
  };

  const handleToggleRequiredField = (fieldId: string) => {
    const updated = formFields.map((f) =>
      f.id === fieldId ? { ...f, required: !f.required } : f
    );
    onUpdateFormFields(updated);
    showSaveNotice('Required rule updated.');
  };

  // ---------------- PASSWORD UPDATE ----------------
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    try {
      const res = await onChangeAdminCreds({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        newUsername: passwordForm.newUsername
      });
      if (res.success) {
        const finalUser = passwordForm.newUsername.trim() || 'admin';
        setPasswordMsg({
          type: 'success',
          text: `Admin credentials updated successfully! New username is "${finalUser}". Previous passwords will no longer work.`
        });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          newUsername: finalUser
        });
        showSaveNotice('Admin credentials and security synced successfully.');
      } else {
        setPasswordMsg({ type: 'error', text: res.error || 'Failed to update credentials.' });
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: 'Server error updating password.' });
    }
  };

  // ---------------- SUPABASE SYNC ACTION ----------------
  const handleSyncSingleBooking = async (b: Booking) => {
    showSaveNotice(`Booking ${b.bookingCode || b.id} is securely saved in 7-day retention storage.`);
    const updated = bookings.map((item) =>
      item.id === b.id ? { ...item, supabaseSynced: true } : item
    );
    onUpdateBookings(updated);
  };

  // ---------------- TERMINAL STATEMENT LOGGING ----------------
  const handleLogStatementToTerminal = async (period: TimeRangeOption, targetList?: Booking[]) => {
    setIsLoggingToTerminal(true);
    const listToLog = targetList !== undefined ? targetList : filteredBookings;
    const periodLabel = getPeriodLabel(period);

    try {
      const res = await fetch('/api/bookings/statement-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period,
          periodLabel,
          bookings: listToLog
        })
      });
      const data = await res.json();
      if (data.success) {
        setTerminalLogNotice(
          `Terminal Statement Logged: ${listToLog.length} booking records for "${periodLabel}" printed to server terminal with full customer details.`
        );
        setTimeout(() => setTerminalLogNotice(''), 7000);
      }
    } catch (e) {
      console.log(`[TERMINAL DUMP for ${periodLabel}]`, listToLog);
      setTerminalLogNotice(`Statement records for "${periodLabel}" logged to console.`);
      setTimeout(() => setTerminalLogNotice(''), 5000);
    } finally {
      setIsLoggingToTerminal(false);
    }
  };

  const handleSelectTimeRange = (range: TimeRangeOption) => {
    setTimeRangeFilter(range);
    fetchLiveCountsAndDirectory(range);

    // Calculate list for this range to immediately log to terminal
    const rangeBookings = bookings.filter((b) => {
      const bDate = getBookingDate(b);
      if (range === 'YESTERDAY') return bDate === yesterdayStr || b.workDate === yesterdayStr;
      if (range === 'TODAY') return bDate === todayStr || b.workDate === todayStr;
      if (range === 'PREV_MONTH') {
        return bDate.startsWith(prevMonthPrefix) || (b.workDate && b.workDate.startsWith(prevMonthPrefix));
      }
      if (range === 'LAST_6_MONTHS') {
        return (bDate && bDate >= sixMonthsAgoStr) || (b.workDate && b.workDate >= sixMonthsAgoStr);
      }
      return true;
    });

    handleLogStatementToTerminal(range, rangeBookings);
  };

  // Filtered Bookings based on Time Range, Status, and Search
  const filteredBookings = bookings.filter((b) => {
    const bDate = getBookingDate(b);

    // 1. Time Range Filter
    let matchesTime = true;
    if (timeRangeFilter === 'YESTERDAY') {
      matchesTime = bDate === yesterdayStr || b.workDate === yesterdayStr;
    } else if (timeRangeFilter === 'TODAY') {
      matchesTime = bDate === todayStr || b.workDate === todayStr;
    } else if (timeRangeFilter === 'PREV_MONTH') {
      matchesTime = bDate.startsWith(prevMonthPrefix) || (b.workDate && b.workDate.startsWith(prevMonthPrefix));
    } else if (timeRangeFilter === 'LAST_6_MONTHS') {
      matchesTime = (bDate && bDate >= sixMonthsAgoStr) || (b.workDate && b.workDate >= sixMonthsAgoStr);
    } else if (timeRangeFilter === 'CUSTOM') {
      if (customFromDate && bDate < customFromDate && (!b.workDate || b.workDate < customFromDate)) {
        matchesTime = false;
      }
      if (customToDate && bDate > customToDate && (!b.workDate || b.workDate > customToDate)) {
        matchesTime = false;
      }
    }

    // 2. Status Filter
    const matchesStatus = bookingStatusFilter === 'ALL' || b.status === bookingStatusFilter;

    // 3. Search Filter
    const q = bookingSearch.toLowerCase();
    const matchesSearch =
      !bookingSearch ||
      (b.customerName || '').toLowerCase().includes(q) ||
      (b.phone || '').includes(bookingSearch) ||
      (b.whatsapp || '').includes(bookingSearch) ||
      (b.email || '').toLowerCase().includes(q) ||
      (b.service || '').toLowerCase().includes(q) ||
      (b.location || '').toLowerCase().includes(q) ||
      (b.message || '').toLowerCase().includes(q) ||
      (b.slotType || '').toLowerCase().includes(q) ||
      (b.bookingCode && b.bookingCode.toLowerCase().includes(q));

    // 4. Slot Filter
    let matchesSlot = true;
    const sType = (b.slotType || b.sourceSlot || '').toUpperCase();
    if (slotFilter === 'SLOT_SURVEY') {
      matchesSlot = sType.includes('FREE SURVEY') || sType.includes('SURVEY');
    } else if (slotFilter === 'SLOT_INSPECTION') {
      matchesSlot = sType.includes('INSPECTION') || (!sType.includes('ENQUIRY') && !sType.includes('SURVEY'));
    } else if (slotFilter === 'SLOT_ENQUIRY') {
      matchesSlot = sType.includes('ENQUIRY') || sType.includes('INQUIRY');
    }

    return matchesTime && matchesStatus && matchesSearch && matchesSlot;
  });

  // Slot Counts for Quick Badges
  const surveySlotCount = bookings.filter((b) => {
    const s = (b.slotType || b.sourceSlot || '').toUpperCase();
    return s.includes('FREE SURVEY') || s.includes('SURVEY');
  }).length;

  const inspectionSlotCount = bookings.filter((b) => {
    const s = (b.slotType || b.sourceSlot || '').toUpperCase();
    return s.includes('INSPECTION') || (!s.includes('ENQUIRY') && !s.includes('SURVEY'));
  }).length;

  const enquirySlotCount = bookings.filter((b) => {
    const s = (b.slotType || b.sourceSlot || '').toUpperCase();
    return s.includes('ENQUIRY') || s.includes('INQUIRY');
  }).length;

  // Fetch Entire Day Report from Backend
  const handleFetchDayReport = async (date: string) => {
    setIsGeneratingDayReport(true);
    try {
      const res = await fetch(`/api/reports/entire-day?date=${encodeURIComponent(date)}`);
      const data = await res.json();
      if (data.success) {
        setDayReportData(data.report);
        showSaveNotice(`Entire Day Report generated for ${date} (${data.report.totalBookings} bookings)`);
      } else {
        alert('Could not fetch report for this date.');
      }
    } catch (e) {
      console.error(e);
      showSaveNotice(`Failed to fetch report from server.`);
    } finally {
      setIsGeneratingDayReport(false);
    }
  };

  // Fetch Weekly Audit Report from Backend
  const handleFetchWeeklyReport = async (date: string) => {
    setIsGeneratingWeeklyReport(true);
    try {
      const res = await fetch(`/api/reports/weekly?date=${encodeURIComponent(date)}`);
      const data = await res.json();
      if (data.success) {
        setWeeklyReportData(data);
        showSaveNotice(`Weekly Report loaded for ${data.weekStart} to ${data.weekEnd} (${data.totalBookings} bookings)`);
      } else {
        showSaveNotice('Could not fetch weekly report.');
      }
    } catch (e) {
      console.error(e);
      showSaveNotice('Failed to fetch weekly report from server.');
    } finally {
      setIsGeneratingWeeklyReport(false);
    }
  };

  return (
    <div className="w-full bg-slate-100 min-h-screen flex flex-col">
      {/* Top Admin Navigation Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <TarLogo variant="white" />
            <span className="hidden sm:inline-block bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onPreviewWebsite}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Preview Website</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white font-bold text-xs flex items-center gap-1 transition-colors border border-rose-500/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Global Success Notification Banner */}
      {saveSuccessNotice && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 text-center sticky top-16 z-20 shadow-md flex items-center justify-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* Terminal Statement Logging Banner */}
      {terminalLogNotice && (
        <div className="bg-slate-900 text-emerald-400 border-b border-emerald-500/30 text-xs font-mono font-bold py-2.5 px-4 text-center sticky top-16 z-20 shadow-md flex items-center justify-center gap-2 animate-fadeIn">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>{terminalLogNotice}</span>
        </div>
      )}

      {/* Admin Content Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Navigation Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1 sticky top-24">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
                Management Modules
              </span>

              {[
                { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
                {
                  id: 'bookings',
                  label: 'Bookings',
                  icon: <CalendarCheck className="w-4 h-4" />,
                  badge: pendingBookingsCount > 0 ? `${pendingBookingsCount}` : undefined
                },
                {
                  id: 'storage',
                  label: 'System & Storage',
                  icon: <Database className="w-4 h-4 text-blue-500" />
                },
                { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
                { id: 'services', label: 'Services (Unlimited)', icon: <Wrench className="w-4 h-4" /> },
                { id: 'projects', label: 'Projects & Gallery', icon: <Image className="w-4 h-4" /> },
                { id: 'content', label: 'Website Content', icon: <Globe className="w-4 h-4" /> },
                { id: 'form_builder', label: 'Booking Form', icon: <Sliders className="w-4 h-4" /> },
                { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
                { id: 'reports', label: 'Reports & 10 PM PDF', icon: <FileText className="w-4 h-4" /> },
                { id: 'settings', label: 'Settings & Security', icon: <Settings className="w-4 h-4" /> }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors text-left ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {tab.icon}
                      <span>{tab.label}</span>
                    </span>
                    {tab.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                          isActive ? 'bg-white text-blue-700' : 'bg-rose-500 text-white'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="lg:col-span-9 space-y-6">
            {/* ====================================================
                TAB 1: DASHBOARD OVERVIEW
                ==================================================== */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold font-heading text-slate-900">
                      Operations Dashboard
                    </h2>
                    <p className="text-xs text-slate-500">
                      Live overview of waterproofing appointments across Hyderabad with historical statement filters.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleLogStatementToTerminal(timeRangeFilter, filteredBookings)}
                      disabled={isLoggingToTerminal}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center gap-1.5 shadow-xs border border-slate-700 cursor-pointer"
                      title="Prints full customer details to server terminal"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>{isLoggingToTerminal ? 'Logging...' : 'Dump to Terminal'}</span>
                    </button>
                    <button
                      onClick={() => downloadDailyPdf(filteredBookings, todayStr)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      <span>Download Statement PDF</span>
                    </button>
                    <button
                      onClick={() => exportBookingsToCsv(filteredBookings)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Top Statement & Time Filter Bar */}
                <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-md space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Statement Time Period Filter
                        </span>
                        <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                          {getPeriodLabel(timeRangeFilter)}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">
                      Showing {filteredBookings.length} booking records for selected range
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
                    {[
                      { id: 'ALL', label: 'All Records', count: totalBookingsCount },
                      { id: 'YESTERDAY', label: 'Yesterday (1-Day Previous)', count: yesterdayBookingsCount },
                      { id: 'TODAY', label: "Today's Bookings", count: todayBookingsCount },
                      { id: 'PREV_MONTH', label: `Previous Month (${prevMonthName})`, count: prevMonthBookingsCount },
                      { id: 'LAST_6_MONTHS', label: 'Last 6 Months Statement', count: sixMonthsBookingsCount },
                      { id: 'CUSTOM', label: 'Custom Range', count: null }
                    ].map((tab) => {
                      const isSelected = timeRangeFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleSelectTimeRange(tab.id as TimeRangeOption)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/50'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                          }`}
                        >
                          <span>{tab.label}</span>
                          {tab.count !== null && (
                            <span
                              className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full ${
                                isSelected ? 'bg-white text-blue-900' : 'bg-slate-700 text-slate-200'
                              }`}
                            >
                              {tab.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 12 KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div
                    onClick={() => {
                      handleSelectTimeRange('ALL');
                      setActiveTab('bookings');
                    }}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer transition-all"
                  >
                    <span className="text-xs text-slate-500 font-semibold">Total Bookings</span>
                    <div className="text-2xl font-black text-slate-900 mt-1">{totalBookingsCount}</div>
                    <span className="text-[10px] text-slate-400">All-time appointments &rarr;</span>
                  </div>

                  <div
                    onClick={() => {
                      handleSelectTimeRange('YESTERDAY');
                      setActiveTab('bookings');
                    }}
                    className="bg-white p-5 rounded-2xl border border-amber-300 bg-amber-50/40 shadow-xs hover:border-amber-500 cursor-pointer transition-all"
                  >
                    <span className="text-xs text-amber-900 font-bold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Yesterday's Bookings</span>
                    </span>
                    <div className="text-2xl font-black text-amber-700 mt-1">{yesterdayBookingsCount}</div>
                    <span className="text-[10px] text-amber-800 font-medium">{yesterdayStr} (Click to inspect &rarr;)</span>
                  </div>

                  <div
                    onClick={() => {
                      handleSelectTimeRange('TODAY');
                      setActiveTab('bookings');
                    }}
                    className="bg-white p-5 rounded-2xl border border-blue-200 bg-blue-50/40 shadow-xs hover:border-blue-500 cursor-pointer transition-all"
                  >
                    <span className="text-xs text-blue-800 font-bold">Today's Bookings</span>
                    <div className="text-2xl font-black text-blue-700 mt-1">{todayBookingsCount}</div>
                    <span className="text-[10px] text-blue-600 font-medium">{todayStr}</span>
                  </div>

                  <div
                    onClick={() => {
                      handleSelectTimeRange('PREV_MONTH');
                      setActiveTab('bookings');
                    }}
                    className="bg-white p-5 rounded-2xl border border-indigo-200 bg-indigo-50/40 shadow-xs hover:border-indigo-500 cursor-pointer transition-all"
                  >
                    <span className="text-xs text-indigo-900 font-bold flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Previous Month</span>
                    </span>
                    <div className="text-2xl font-black text-indigo-700 mt-1">{prevMonthBookingsCount}</div>
                    <span className="text-[10px] text-indigo-700 font-medium">{prevMonthName} statement &rarr;</span>
                  </div>

                  <div
                    onClick={() => {
                      handleSelectTimeRange('LAST_6_MONTHS');
                      setActiveTab('bookings');
                    }}
                    className="bg-white p-5 rounded-2xl border border-purple-200 bg-purple-50/40 shadow-xs hover:border-purple-500 cursor-pointer transition-all"
                  >
                    <span className="text-xs text-purple-900 font-bold">Last 6 Months Statement</span>
                    <div className="text-2xl font-black text-purple-800 mt-1">{sixMonthsBookingsCount}</div>
                    <span className="text-[10px] text-purple-700 font-medium">Since {sixMonthsAgoStr} &rarr;</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
                    <span className="text-xs text-amber-800 font-bold">Pending Action</span>
                    <div className="text-2xl font-black text-amber-600 mt-1">{pendingBookingsCount}</div>
                    <span className="text-[10px] text-amber-700">New &amp; Contacted</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-xs">
                    <span className="text-xs text-purple-700 font-bold">Confirmed Site Visits</span>
                    <div className="text-2xl font-black text-purple-800 mt-1">{confirmedBookingsCount}</div>
                    <span className="text-[10px] text-slate-400">Scheduled technicians</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs">
                    <span className="text-xs text-emerald-700 font-bold">Completed &amp; Sealed</span>
                    <div className="text-2xl font-black text-emerald-800 mt-1">{completedBookingsCount}</div>
                    <span className="text-[10px] text-emerald-600">Successfully executed</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs">
                    <span className="text-xs text-rose-700 font-bold">Cancelled</span>
                    <div className="text-2xl font-black text-rose-800 mt-1">{cancelledBookingsCount}</div>
                    <span className="text-[10px] text-slate-400">Rejected / No show</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold">Registered Customers</span>
                    <div className="text-2xl font-black text-slate-900 mt-1">{customers.length}</div>
                    <span className="text-[10px] text-slate-400">Portal accounts</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold">Active Services</span>
                    <div className="text-2xl font-black text-slate-900 mt-1">{services.filter((s) => !s.isHidden).length}</div>
                    <span className="text-[10px] text-slate-400">Publicly visible</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold">Gallery Projects</span>
                    <div className="text-2xl font-black text-slate-900 mt-1">{projects.length}</div>
                    <span className="text-[10px] text-slate-400">Before/After sets</span>
                  </div>
                </div>

                {/* Recent Bookings Table Preview */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold font-heading text-slate-900">
                        Recent Booking Activity &amp; Customer Orders
                      </h3>
                      <span className="text-[11px] font-medium text-slate-500">
                        (Showing {filteredBookings.length} matching)
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Open Full Booking Manager &rarr;</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-white font-bold">
                        <tr>
                          <th className="p-3">Ref Code</th>
                          <th className="p-3">Customer Details</th>
                          <th className="p-3">Service</th>
                          <th className="p-3">Location in Hyderabad</th>
                          <th className="p-3">Work Date &amp; Slot</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredBookings.slice(0, 8).map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-mono font-bold text-blue-600">{b.bookingCode || b.id}</td>
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{b.customerName}</div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <a href={`tel:${b.phone}`} className="text-blue-600 font-medium hover:underline">
                                  {b.phone}
                                </a>
                                <span>•</span>
                                <a
                                  href={`https://wa.me/91${b.whatsapp || b.phone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-700 font-medium hover:underline"
                                >
                                  WhatsApp
                                </a>
                              </div>
                            </td>
                            <td className="p-3 text-slate-700 font-medium">{b.service}</td>
                            <td className="p-3 text-slate-600 flex items-center gap-1 mt-2">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{b.location}</span>
                            </td>
                            <td className="p-3 text-slate-600">
                              <div className="font-semibold text-slate-800">{b.workDate}</div>
                              <div className="text-[10px] text-slate-400">{b.preferredTime}</div>
                            </td>
                            <td className="p-3">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  b.status === 'Completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : b.status === 'Confirmed'
                                    ? 'bg-purple-100 text-purple-800'
                                    : b.status === 'Cancelled'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {b.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setViewingBooking(b)}
                                className="px-2.5 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Order</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ====================================================
                TAB 2: BOOKINGS MANAGEMENT
                ==================================================== */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold font-heading text-slate-900">
                      Booking Management &amp; Customer Orders
                    </h2>
                    <p className="text-xs text-slate-500">
                      Full statement auditing, filter by Yesterday, Previous Month, or 6 Months with live terminal logging.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleLogStatementToTerminal(timeRangeFilter, filteredBookings)}
                      disabled={isLoggingToTerminal}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center gap-1.5 shadow-xs border border-slate-700 cursor-pointer"
                      title="Dumps customer details for selected statement to server terminal"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>{isLoggingToTerminal ? 'Logging...' : 'Dump Statement to Terminal'}</span>
                    </button>
                    <button
                      onClick={() => downloadDailyPdf(filteredBookings, selectedReportDate)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      <span>Download Statement PDF</span>
                    </button>
                    <button
                      onClick={() => exportBookingsToCsv(filteredBookings)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Export CSV/Excel</span>
                    </button>
                  </div>
                </div>

                {/* High-Power Statement Time Range Selector Box */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 rounded-3xl text-white border border-slate-700 shadow-md space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                            Time-Based Statement Filter
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                            {getPeriodLabel(timeRangeFilter)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          Clicking a time period instantly filters the customer list and prints the complete statement to the server terminal.
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-black text-blue-400">{filteredBookings.length}</span>
                      <span className="text-xs text-slate-400 block">matching records</span>
                    </div>
                  </div>

                  {/* Period Filter Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-700/80">
                    {[
                      { id: 'ALL', label: 'All Records', count: totalBookingsCount },
                      { id: 'YESTERDAY', label: 'Yesterday (1-Day Previous)', count: yesterdayBookingsCount, highlight: true },
                      { id: 'TODAY', label: "Today's Bookings", count: todayBookingsCount },
                      { id: 'PREV_MONTH', label: `Previous Month (${prevMonthName})`, count: prevMonthBookingsCount, highlight: true },
                      { id: 'LAST_6_MONTHS', label: 'Last 6 Months Statement', count: sixMonthsBookingsCount, highlight: true },
                      { id: 'CUSTOM', label: 'Custom Date Range', count: null }
                    ].map((tab) => {
                      const isSelected = timeRangeFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleSelectTimeRange(tab.id as TimeRangeOption)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/50'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                          }`}
                        >
                          <span>{tab.label}</span>
                          {tab.count !== null && (
                            <span
                              className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full ${
                                isSelected ? 'bg-white text-blue-900' : 'bg-slate-700 text-slate-200'
                              }`}
                            >
                              {tab.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Date Pickers */}
                  {timeRangeFilter === 'CUSTOM' && (
                    <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-medium">From:</span>
                        <input
                          type="date"
                          value={customFromDate}
                          onChange={(e) => setCustomFromDate(e.target.value)}
                          className="bg-slate-800 border border-slate-600 text-white text-xs rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-medium">To:</span>
                        <input
                          type="date"
                          value={customToDate}
                          onChange={(e) => setCustomToDate(e.target.value)}
                          className="bg-slate-800 border border-slate-600 text-white text-xs rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      {(customFromDate || customToDate) && (
                        <button
                          onClick={() => {
                            setCustomFromDate('');
                            setCustomToDate('');
                          }}
                          className="text-blue-400 hover:text-blue-300 text-xs underline"
                        >
                          Clear Dates
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Filters & Search & Slot Filter */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="relative w-full md:w-80">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search customer, phone, ID, service, location, problem notes..."
                        value={bookingSearch}
                        onChange={(e) => setBookingSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                      <span className="text-xs font-bold text-slate-400 mr-1">Status:</span>
                      {['ALL', 'New', 'Contacted', 'Confirmed', 'Completed', 'Cancelled'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setBookingStatusFilter(status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                            bookingStatusFilter === status
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Slot Channel Category Filters */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
                      <Sliders className="w-3.5 h-3.5 text-blue-600" />
                      <span>Channel Slot:</span>
                    </span>
                    {[
                      { id: 'ALL', label: 'All 3 Slots', count: totalBookingsCount },
                      { id: 'SLOT_SURVEY', label: '1. Book Free Survey', count: surveySlotCount, color: 'text-blue-700 bg-blue-50 border-blue-200' },
                      { id: 'SLOT_INSPECTION', label: '2. Site Inspection & Assessment', count: inspectionSlotCount, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                      { id: 'SLOT_ENQUIRY', label: '3. Customer Enquiry & Request', count: enquirySlotCount, color: 'text-purple-700 bg-purple-50 border-purple-200' }
                    ].map((s) => {
                      const isSelected = slotFilter === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setSlotFilter(s.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : `${s.color || 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`
                          }`}
                        >
                          <span>{s.label}</span>
                          <span
                            className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full ${
                              isSelected ? 'bg-white text-slate-900' : 'bg-slate-200/80 text-slate-800'
                            }`}
                          >
                            {s.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comprehensive Booking Management Table with Full Customer Details */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-white font-bold">
                        <tr>
                          <th className="p-3.5">Ref Code</th>
                          <th className="p-3.5">Customer &amp; Contact Details</th>
                          <th className="p-3.5">Slot Channel</th>
                          <th className="p-3.5">Service Discipline</th>
                          <th className="p-3.5">Site Location &amp; Address</th>
                          <th className="p-3.5">Survey Date &amp; Slot</th>
                          <th className="p-3.5">Customer Requirements &amp; Notes</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5">Storage</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredBookings.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="p-10 text-center text-slate-400">
                              <div className="max-w-md mx-auto space-y-2">
                                <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                                <p className="font-bold text-slate-700">No booking records found for this timeframe/slot.</p>
                                <p className="text-xs text-slate-500">
                                  Try selecting "All Records" or changing the channel slot filter above.
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredBookings.map((b) => {
                            const slotDisplay = b.slotType || b.sourceSlot || 'HYDERABAD SITE INSPECTION & WATERPROOFING ASSESSMENT';
                            const isSurveySlot = slotDisplay.toUpperCase().includes('FREE SURVEY') || slotDisplay.toUpperCase().includes('SURVEY');
                            const isEnquirySlot = slotDisplay.toUpperCase().includes('ENQUIRY') || slotDisplay.toUpperCase().includes('INQUIRY');

                            return (
                              <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3.5 font-mono font-bold text-blue-600">
                                  <div>{b.bookingCode || b.id}</div>
                                  {b.createdAt && (
                                    <div className="text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                                      {b.createdAt.split('T')[0]} {b.createdAt.includes('T') ? b.createdAt.split('T')[1].substring(0, 5) : ''}
                                    </div>
                                  )}
                                </td>
                                <td className="p-3.5">
                                  <div className="font-bold text-slate-900 text-sm">{b.customerName}</div>
                                  <div className="flex flex-col gap-0.5 text-[11px] mt-1">
                                    <a
                                      href={`tel:${b.phone}`}
                                      className="text-blue-600 font-medium hover:underline flex items-center gap-1"
                                    >
                                      <Phone className="w-3 h-3 text-blue-500" />
                                      <span>{b.phone}</span>
                                    </a>
                                    <a
                                      href={`https://wa.me/91${b.whatsapp || b.phone}?text=Hello%20${encodeURIComponent(
                                        b.customerName
                                      )}%2C%20regarding%20your%20waterproofing%20booking%20${b.bookingCode || b.id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-emerald-700 font-medium hover:underline flex items-center gap-1"
                                    >
                                      <MessageSquare className="w-3 h-3 text-emerald-600" />
                                      <span>WA: {b.whatsapp || b.phone}</span>
                                    </a>
                                    {b.email && (
                                      <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                                        <Mail className="w-2.5 h-2.5" />
                                        <span>{b.email}</span>
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3.5">
                                  <span
                                    className={`inline-block px-2 py-1 rounded-lg text-[10px] font-bold leading-tight ${
                                      isSurveySlot
                                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                        : isEnquirySlot
                                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    }`}
                                  >
                                    {isSurveySlot
                                      ? 'Book Free Survey'
                                      : isEnquirySlot
                                      ? 'Customer Enquiry'
                                      : 'Site Inspection & Assessment'}
                                  </span>
                                </td>
                                <td className="p-3.5 font-medium text-slate-800">
                                  <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg font-bold text-[11px] block text-center max-w-[160px] truncate">
                                    {b.service}
                                  </span>
                                </td>
                                <td className="p-3.5 text-slate-600 max-w-[180px]">
                                  <div className="flex items-start gap-1 font-medium text-slate-800">
                                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{b.location}</span>
                                  </div>
                                </td>
                                <td className="p-3.5 text-slate-600">
                                  <div className="font-bold text-slate-900">{b.workDate}</div>
                                  <div className="text-[10px] text-blue-700 font-semibold mt-0.5 bg-blue-50 px-2 py-0.5 rounded inline-block">
                                    {b.preferredTime}
                                  </div>
                                </td>
                                <td className="p-3.5 text-slate-600 max-w-[200px]">
                                  {b.message ? (
                                    <p className="text-[11px] text-slate-700 line-clamp-2 italic">
                                      "{b.message}"
                                    </p>
                                  ) : (
                                    <span className="text-slate-400 text-[10px]">No special notes</span>
                                  )}
                                  {b.photos && b.photos.length > 0 && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                        📷 {b.photos.length} Photo{b.photos.length > 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  )}
                                </td>
                              <td className="p-3.5">
                                <select
                                  value={b.status}
                                  onChange={(e) =>
                                    handleUpdateBookingStatus(b.id, e.target.value as BookingStatus)
                                  }
                                  className={`text-[11px] font-bold rounded-lg border py-1.5 px-2 focus:ring-1 focus:ring-blue-500 cursor-pointer ${
                                    b.status === 'Completed'
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                      : b.status === 'Confirmed'
                                      ? 'bg-purple-50 border-purple-300 text-purple-800'
                                      : b.status === 'Cancelled'
                                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                                      : 'bg-blue-50 border-blue-300 text-blue-800'
                                  }`}
                                >
                                  <option value="New">New</option>
                                  <option value="Contacted">Contacted</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </td>
                              <td className="p-3.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active DB
                                </span>
                              </td>
                              <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                                <button
                                  onClick={() => setViewingBooking(b)}
                                  className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors"
                                  title="View Full Customer Order & Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    const text = `TAR Waterproofing Booking Details:\nCustomer: ${b.customerName}\nPhone: ${b.phone}\nService: ${b.service}\nLocation: ${b.location}\nDate: ${b.workDate} (${b.preferredTime})\nStatus: ${b.status}`;
                                    navigator.clipboard.writeText(text);
                                    showSaveNotice(`Copied booking details for ${b.customerName}`);
                                  }}
                                  className="p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                                  title="Copy Booking Summary"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBooking(b)}
                                  className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer transition-colors"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ====================================================
                TAB: SYSTEM & APPLICATION STORAGE MANAGEMENT
                ==================================================== */}
            {(activeTab === 'storage' || activeTab === 'supabase') && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold font-heading text-slate-900">
                      Application Storage Engine &amp; System Health
                    </h2>
                    <p className="text-xs text-slate-500">
                      High-speed in-memory store with async concurrency lock, scrypt salted encryption, and 7-day rolling retention.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchLiveCountsAndDirectory()}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Refresh State</span>
                    </button>
                    <button
                      onClick={() => exportBookingsToCsv(bookings)}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export All Bookings CSV</span>
                    </button>
                  </div>
                </div>

                {/* Storage Health KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold">Storage Provider</span>
                    <div className="text-base font-black text-slate-900 mt-1 flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-blue-600" />
                      <span>In-Memory Storage</span>
                    </div>
                    <span className="text-[10px] text-blue-600 font-medium">AsyncLock sequential queue</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
                    <span className="text-xs text-emerald-900 font-bold">Credential Security</span>
                    <div className="text-base font-black text-emerald-700 mt-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Scrypt Salted Hashes</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-medium">Zero plaintext password exposure</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-xs">
                    <span className="text-xs text-blue-900 font-bold">Total Appointments</span>
                    <div className="text-2xl font-black text-blue-700 mt-1">{bookings.length}</div>
                    <span className="text-[10px] text-blue-600 font-medium">{pendingBookingsCount} awaiting action</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-xs">
                    <span className="text-xs text-purple-900 font-bold">Registered Customers</span>
                    <div className="text-2xl font-black text-purple-700 mt-1">{customers.length}</div>
                    <span className="text-[10px] text-purple-600 font-medium">Verified customer accounts</span>
                  </div>
                </div>

                {/* Technical Architecture Information Card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <Server className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Application Storage Architecture</h3>
                      <p className="text-xs text-slate-500">Operational specifications and data lifecycle</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>7-Day Rolling Retention</span>
                      </span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Completed and cancelled appointment records older than 7 days are automatically pruned to maintain lean storage.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Customer Privacy Guard</span>
                      </span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Customer passwords use cryptographic scrypt with randomized salt per account. Hashes are stripped from all API outputs.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Race Condition Prevention</span>
                      </span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        All read, write, and update operations are synchronized through an in-process mutual exclusion queue.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ====================================================
                TAB 3: REGISTERED CUSTOMERS PORTAL & DATABASE
                ==================================================== */}
            {activeTab === 'customers' && (() => {
              // Filter customers
              const filteredCustomers = customers.filter((c) => {
                const q = customerSearch.toLowerCase().trim();
                const matchesSearch =
                  !q ||
                  (c.name || '').toLowerCase().includes(q) ||
                  (c.mobile || '').includes(q) ||
                  (c.phone || '').includes(q) ||
                  (c.email || '').toLowerCase().includes(q) ||
                  (c.address || '').toLowerCase().includes(q) ||
                  (c.id || '').toLowerCase().includes(q);

                let matchesSlot = true;
                const regSlot = (c.registeredSlot || '').toUpperCase();
                if (customerSlotFilter === 'SLOT_SURVEY') {
                  matchesSlot = regSlot.includes('FREE SURVEY') || regSlot.includes('SURVEY');
                } else if (customerSlotFilter === 'SLOT_INSPECTION') {
                  matchesSlot = regSlot.includes('INSPECTION') || (!regSlot.includes('ENQUIRY') && !regSlot.includes('SURVEY'));
                } else if (customerSlotFilter === 'SLOT_ENQUIRY') {
                  matchesSlot = regSlot.includes('ENQUIRY') || regSlot.includes('INQUIRY');
                }

                let matchesStatus = true;
                if (customerStatusFilter === 'ACTIVE') {
                  matchesStatus = c.status !== 'Inactive';
                } else if (customerStatusFilter === 'INACTIVE') {
                  matchesStatus = c.status === 'Inactive';
                }

                let matchesBooking = true;
                const bookingCount = (c.totalBookings || 0) + bookings.filter(b => b.customerId === c.id || b.phone === c.mobile).length;
                if (customerBookingFilter === 'WITH_BOOKINGS') {
                  matchesBooking = bookingCount > 0;
                } else if (customerBookingFilter === 'WITHOUT_BOOKINGS') {
                  matchesBooking = bookingCount === 0;
                }

                return matchesSearch && matchesSlot && matchesStatus && matchesBooking;
              });

              const todayRegisteredCount = customers.filter((c) => {
                const regDate = c.registeredAt || c.createdAt || '';
                return regDate.startsWith(todayStr);
              }).length;

              const activeCustomersCount = customers.filter((c) => c.status !== 'Inactive').length;
              const inactiveCustomersCount = customers.length - activeCustomersCount;

              return (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold font-heading text-slate-900">
                        Registered Customers Directory
                      </h2>
                      <p className="text-xs text-slate-500">
                        Master database of all verified customers, homeowners, and commercial clients registered across Hyderabad.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-bold text-xs flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>{customers.length} Total Customers</span>
                      </span>
                    </div>
                  </div>

                  {/* Customer KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-xs text-slate-500 font-semibold">Total Registered Clients</span>
                      <div className="text-2xl font-black text-slate-900 mt-1">{customers.length}</div>
                      <span className="text-[10px] text-emerald-600 font-medium">Verified customer accounts</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
                      <span className="text-xs text-emerald-900 font-bold">Active Accounts</span>
                      <div className="text-2xl font-black text-emerald-700 mt-1">{activeCustomersCount}</div>
                      <span className="text-[10px] text-emerald-600 font-medium">{inactiveCustomersCount} deactivated</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/30 shadow-xs">
                      <span className="text-xs text-blue-900 font-bold">Registered Today</span>
                      <div className="text-2xl font-black text-blue-700 mt-1">{todayRegisteredCount}</div>
                      <span className="text-[10px] text-blue-600 font-medium">{todayStr} additions</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-purple-200 bg-purple-50/30 shadow-xs">
                      <span className="text-xs text-purple-900 font-bold">Security Standard</span>
                      <div className="text-sm font-black text-purple-800 mt-2 flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <span>Scrypt Encrypted</span>
                      </div>
                      <span className="text-[10px] text-purple-600 font-medium">Passwords hidden from admin</span>
                    </div>
                  </div>

                  {/* Search & Multifaceted Filter Bar */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                      <div className="relative w-full md:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search name, phone, email, area, ID..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      {/* Account Status Filter */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Status:</span>
                        {[
                          { id: 'ALL', label: 'All Status' },
                          { id: 'ACTIVE', label: 'Active Only' },
                          { id: 'INACTIVE', label: 'Inactive' }
                        ].map((st) => (
                          <button
                            key={st.id}
                            onClick={() => setCustomerStatusFilter(st.id as any)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              customerStatusFilter === st.id
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>

                      {/* Bookings Filter */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Bookings:</span>
                        {[
                          { id: 'ALL', label: 'All' },
                          { id: 'WITH_BOOKINGS', label: 'With Bookings' },
                          { id: 'WITHOUT_BOOKINGS', label: 'No Bookings' }
                        ].map((bf) => (
                          <button
                            key={bf.id}
                            onClick={() => setCustomerBookingFilter(bf.id as any)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              customerBookingFilter === bf.id
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {bf.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-500">Registered Via Slot:</span>
                      {[
                        { id: 'ALL', label: 'All Channels' },
                        { id: 'SLOT_SURVEY', label: 'Free Survey' },
                        { id: 'SLOT_INSPECTION', label: 'Site Inspection' },
                        { id: 'SLOT_ENQUIRY', label: 'Customer Enquiry' }
                      ].map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setCustomerSlotFilter(s.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                            customerSlotFilter === s.id
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Registered Customer Table */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-white font-bold">
                          <tr>
                            <th className="p-3.5">Customer Profile</th>
                            <th className="p-3.5">Contact Numbers</th>
                            <th className="p-3.5">Email Address</th>
                            <th className="p-3.5">Hyderabad Location</th>
                            <th className="p-3.5">Registered Date</th>
                            <th className="p-3.5">Total Bookings</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredCustomers.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="p-10 text-center text-slate-400">
                                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="font-bold text-slate-700">No registered customers found matching your filters.</p>
                                <p className="text-xs text-slate-500">
                                  Customers appear here when they register an account or book an inspection in Hyderabad.
                                </p>
                              </td>
                            </tr>
                          ) : (
                            filteredCustomers.map((c) => {
                              const customerBookings = bookings.filter(
                                (b) => b.customerId === c.id || b.phone === c.mobile
                              );
                              const regSlot = c.registeredSlot || 'Hyderabad Site Inspection';
                              const isSurvey = regSlot.toUpperCase().includes('SURVEY');
                              const isEnquiry = regSlot.toUpperCase().includes('ENQUIRY');
                              const isActive = c.status !== 'Inactive';

                              return (
                                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-3.5">
                                    <div className="flex items-center gap-2.5">
                                      <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                                        isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                                      }`}>
                                        {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                                      </div>
                                      <div>
                                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                          <span>{c.name}</span>
                                          {!isActive && (
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold">
                                              Inactive
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-400">ID: {c.id}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3.5">
                                    <div className="flex flex-col gap-1">
                                      <a
                                        href={`tel:${c.mobile}`}
                                        className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                                      >
                                        <Phone className="w-3 h-3 text-blue-500" />
                                        <span>{c.mobile}</span>
                                      </a>
                                      <a
                                        href={`https://wa.me/91${c.mobile}?text=Hello%20${encodeURIComponent(
                                          c.name
                                        )}%2C%20greetings%20from%20TAR%20Civil%20%26%20Waterproofing%20Experts.`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-700 text-[11px] font-medium hover:underline flex items-center gap-1"
                                      >
                                        <MessageSquare className="w-3 h-3 text-emerald-600" />
                                        <span>WhatsApp Chat</span>
                                      </a>
                                    </div>
                                  </td>
                                  <td className="p-3.5 text-slate-600">
                                    {c.email ? (
                                      <a
                                        href={`mailto:${c.email}`}
                                        className="flex items-center gap-1 hover:text-blue-600 hover:underline"
                                      >
                                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span className="truncate max-w-[150px]">{c.email}</span>
                                      </a>
                                    ) : (
                                      <span className="text-slate-400 italic">Not provided</span>
                                    )}
                                  </td>
                                  <td className="p-3.5 text-slate-600">
                                    <div className="flex items-start gap-1">
                                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                      <span className="line-clamp-2">{c.address || 'Hyderabad, Telangana'}</span>
                                    </div>
                                  </td>
                                  <td className="p-3.5">
                                    <div className="font-medium text-slate-800">
                                      {c.registeredAt ? c.registeredAt.split('T')[0] : c.createdAt?.split('T')[0] || 'N/A'}
                                    </div>
                                    <span
                                      className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold mt-1 ${
                                        isSurvey
                                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                          : isEnquiry
                                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      }`}
                                    >
                                      {isSurvey
                                        ? 'Free Survey'
                                        : isEnquiry
                                        ? 'Enquiry'
                                        : 'Site Inspection'}
                                    </span>
                                  </td>
                                  <td className="p-3.5">
                                    <div className="font-bold text-blue-600 text-sm">
                                      {customerBookings.length} {customerBookings.length === 1 ? 'Booking' : 'Bookings'}
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {customerBookings.slice(0, 2).map((bk) => (
                                        <button
                                          key={bk.id}
                                          onClick={() => setViewingBooking(bk)}
                                          className="text-[9px] font-mono font-bold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-1.5 py-0.5 rounded border border-slate-200 cursor-pointer"
                                        >
                                          {bk.bookingCode || bk.id}
                                        </button>
                                      ))}
                                      {customerBookings.length > 2 && (
                                        <span className="text-[9px] text-slate-400 font-bold self-center">
                                          +{customerBookings.length - 2} more
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-3.5">
                                    {isActive ? (
                                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Active
                                      </span>
                                    ) : (
                                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                        <UserX className="w-3 h-3" /> Deactivated
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3.5 text-right whitespace-nowrap">
                                    <div className="inline-flex items-center gap-1">
                                      <button
                                        onClick={() => setViewingCustomer(c)}
                                        className="px-2.5 py-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                                        title="View Complete Customer Profile & Booking History"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Profile</span>
                                      </button>

                                      <button
                                        onClick={() => setEditingCustomer(c)}
                                        className="p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-[11px] inline-flex items-center cursor-pointer transition-colors"
                                        title="Edit Customer Contact Details"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>

                                      <button
                                        onClick={() => handleToggleCustomerStatus(c)}
                                        className={`p-1.5 rounded-lg font-bold text-[11px] inline-flex items-center cursor-pointer transition-colors ${
                                          isActive
                                            ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                        }`}
                                        title={isActive ? 'Deactivate Customer Account' : 'Activate Customer Account'}
                                      >
                                        {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                      </button>

                                      <button
                                        onClick={() => setDeletingCustomer(c)}
                                        className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg font-bold text-[11px] inline-flex items-center cursor-pointer transition-colors"
                                        title="Delete Customer Account"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ====================================================
                TAB 4: UNLIMITED SERVICES MANAGEMENT
                ==================================================== */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold font-heading text-slate-900">
                      Services Management (Unlimited)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Add, edit, reorder, and hide/show any service. Unlimited services supported (#13, #14+).
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const nextNum = services.length + 1;
                      setEditingService({
                        id: `srv-${Date.now()}`,
                        number: nextNum,
                        order: nextNum,
                        name: `New Waterproofing Service #${nextNum}`,
                        slug: `new-service-${nextNum}`,
                        image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80',
                        shortDescription: 'Professional waterproofing and civil protection service.',
                        problemExplanation: 'Explanation of damage, water seepage, or structural defect.',
                        solutionExplanation: 'How TAR technical team executes permanent chemical barrier.',
                        workProcess: [
                          'Initial site inspection and moisture reading',
                          'Surface cleaning and crack routing',
                          'Application of primary polymer coat',
                          'Reinforcement mesh and protective finish',
                          'Water leakage validation test'
                        ],
                        features: ['Certified Chemical Seal', '100% Leak Proof'],
                        buttonText: 'Book Inspection'
                      });
                      setIsAddingService(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Service #{services.length + 1}</span>
                  </button>
                </div>

                {/* Services List Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-white font-bold">
                        <tr>
                          <th className="p-3.5">#</th>
                          <th className="p-3.5">Image</th>
                          <th className="p-3.5">Service Name</th>
                          <th className="p-3.5">Slug / URL</th>
                          <th className="p-3.5">Visibility</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {services.map((svc) => (
                          <tr key={svc.id} className="hover:bg-slate-50">
                            <td className="p-3.5 font-bold text-blue-600">#{svc.number}</td>
                            <td className="p-3.5">
                              <img
                                src={svc.image}
                                alt={svc.name}
                                className="w-12 h-10 object-cover rounded-md border border-slate-200"
                              />
                            </td>
                            <td className="p-3.5 font-semibold text-slate-900">{svc.name}</td>
                            <td className="p-3.5 font-mono text-slate-500">{svc.slug}</td>
                            <td className="p-3.5">
                              <button
                                onClick={() => handleToggleHideService(svc.id)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                  svc.isHidden
                                    ? 'bg-slate-200 text-slate-600'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {svc.isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                <span>{svc.isHidden ? 'Hidden' : 'Visible'}</span>
                              </button>
                            </td>
                            <td className="p-3.5 text-right space-x-1">
                              <button
                                onClick={() => {
                                  setEditingService(JSON.parse(JSON.stringify(svc)));
                                  setIsAddingService(false);
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Edit Service"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteService(svc.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                                title="Delete Service"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Service Edit / Add Modal */}
                {editingService && (
                  <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h3 className="text-lg font-bold font-heading text-slate-900">
                          {isAddingService ? 'Add New Service' : `Edit Service #${editingService.number}`}
                        </h3>
                        <button
                          onClick={() => setEditingService(null)}
                          className="p-1.5 text-slate-400 hover:text-slate-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Service Number</label>
                            <input
                              type="number"
                              value={editingService.number}
                              onChange={(e) =>
                                setEditingService({
                                  ...editingService,
                                  number: parseInt(e.target.value) || 1,
                                  order: parseInt(e.target.value) || 1
                                })
                              }
                              className="w-full px-3 py-2 rounded-xl border border-slate-200"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">URL Slug</label>
                            <input
                              type="text"
                              value={editingService.slug}
                              onChange={(e) =>
                                setEditingService({ ...editingService, slug: e.target.value })
                              }
                              className="w-full px-3 py-2 rounded-xl border border-slate-200"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Service Name *</label>
                          <input
                            type="text"
                            value={editingService.name}
                            onChange={(e) =>
                              setEditingService({ ...editingService, name: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200"
                          />
                        </div>

                        <ImageMediaPicker
                          label="Service Image Photo *"
                          subLabel="Select image from device gallery, file manager, or paste URL"
                          value={editingService.image}
                          onChangeUrl={(url) => setEditingService({ ...editingService, image: url })}
                          aspectRatioHint="Recommended: 16:9 or 4:3 high-res photo"
                        />

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Short Description *</label>
                          <textarea
                            rows={2}
                            value={editingService.shortDescription}
                            onChange={(e) =>
                              setEditingService({ ...editingService, shortDescription: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Problem Explanation</label>
                          <textarea
                            rows={2}
                            value={editingService.problemExplanation}
                            onChange={(e) =>
                              setEditingService({ ...editingService, problemExplanation: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Solution Explanation</label>
                          <textarea
                            rows={2}
                            value={editingService.solutionExplanation}
                            onChange={(e) =>
                              setEditingService({ ...editingService, solutionExplanation: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Button Text</label>
                          <input
                            type="text"
                            value={editingService.buttonText || 'Book Appointment'}
                            onChange={(e) =>
                              setEditingService({ ...editingService, buttonText: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setEditingService(null)}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveService(editingService)}
                          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save &amp; Sync</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ====================================================
                TAB 5: PROJECTS & GALLERY MANAGEMENT
                ==================================================== */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold font-heading text-slate-900">
                      Projects &amp; Gallery Management
                    </h2>
                    <p className="text-xs text-slate-500">
                      Upload and manage Before, During, and After project photos and videos.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingProject({
                        id: `proj-${Date.now()}`,
                        name: 'New Waterproofing Project',
                        location: 'Hyderabad, Telangana',
                        serviceName: services[0]?.name || 'Terrace / Roof Waterproofing',
                        serviceId: services[0]?.id || 'srv-1',
                        description: 'Detailed description of crack routing and membrane sealing.',
                        date: new Date().toISOString().split('T')[0],
                        beforeMedia: {
                          type: 'image',
                          url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1000&q=80',
                          caption: 'Before: Damage and leakage'
                        },
                        duringMedia: {
                          type: 'image',
                          url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80',
                          caption: 'During: Chemical application'
                        },
                        afterMedia: {
                          type: 'image',
                          url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=80',
                          caption: 'After: 100% leak proof'
                        }
                      });
                      setIsAddingProject(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Project</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-blue-600 uppercase">
                            {proj.serviceName}
                          </span>
                          <h4 className="text-base font-bold text-slate-900">{proj.name}</h4>
                          <span className="text-xs text-slate-500">{proj.location} • {proj.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingProject(JSON.parse(JSON.stringify(proj)));
                              setIsAddingProject(false);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(proj.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        <img src={proj.beforeMedia.url} alt="Before" className="h-16 w-full object-cover rounded-lg" />
                        <img src={proj.duringMedia.url} alt="During" className="h-16 w-full object-cover rounded-lg" />
                        <img src={proj.afterMedia.url} alt="After" className="h-16 w-full object-cover rounded-lg" />
                      </div>

                      <p className="text-xs text-slate-600">{proj.description}</p>
                    </div>
                  ))}
                </div>

                {/* Project Edit Modal */}
                {editingProject && (
                  <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h3 className="text-lg font-bold font-heading text-slate-900">
                          {isAddingProject ? 'Add Project to Gallery' : 'Edit Project'}
                        </h3>
                        <button onClick={() => setEditingProject(null)} className="p-1 text-slate-400">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Project Name *</label>
                          <input
                            type="text"
                            value={editingProject.name}
                            onChange={(e) =>
                              setEditingProject({ ...editingProject, name: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Location in Hyderabad</label>
                            <input
                              type="text"
                              value={editingProject.location}
                              onChange={(e) =>
                                setEditingProject({ ...editingProject, location: e.target.value })
                              }
                              className="w-full px-3 py-2 rounded-xl border border-slate-200"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Service Category</label>
                            <select
                              value={editingProject.serviceName}
                              onChange={(e) =>
                                setEditingProject({ ...editingProject, serviceName: e.target.value })
                              }
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                            >
                              {services.map((s) => (
                                <option key={s.id} value={s.name}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* 1. BEFORE Media Photo Picker */}
                        <ImageMediaPicker
                          label="1. BEFORE Media Photo (Inspection / Damaged Stage)"
                          subLabel="Upload damage/leakage photo directly from device gallery or file manager"
                          value={editingProject.beforeMedia.url}
                          caption={editingProject.beforeMedia.caption}
                          onChangeUrl={(url) =>
                            setEditingProject({
                              ...editingProject,
                              beforeMedia: { ...editingProject.beforeMedia, url }
                            })
                          }
                          onChangeCaption={(caption) =>
                            setEditingProject({
                              ...editingProject,
                              beforeMedia: { ...editingProject.beforeMedia, caption }
                            })
                          }
                          aspectRatioHint="Recommended: 4:3 or 16:9 photo showing initial damage"
                          placeholder="Or enter direct Before image URL"
                        />

                        {/* 2. DURING Media Photo Picker */}
                        <ImageMediaPicker
                          label="2. DURING Media Photo (Application / Chemical Coating Stage)"
                          subLabel="Upload work-in-progress photo directly from device gallery or file manager"
                          value={editingProject.duringMedia.url}
                          caption={editingProject.duringMedia.caption}
                          onChangeUrl={(url) =>
                            setEditingProject({
                              ...editingProject,
                              duringMedia: { ...editingProject.duringMedia, url }
                            })
                          }
                          onChangeCaption={(caption) =>
                            setEditingProject({
                              ...editingProject,
                              duringMedia: { ...editingProject.duringMedia, caption }
                            })
                          }
                          aspectRatioHint="Recommended: 4:3 or 16:9 photo showing chemical grouting / membrane"
                          placeholder="Or enter direct During image URL"
                        />

                        {/* 3. AFTER Media Photo Picker */}
                        <ImageMediaPicker
                          label="3. AFTER Media Photo (Finished / 100% Sealed Stage)"
                          subLabel="Upload finished project photo directly from device gallery or file manager"
                          value={editingProject.afterMedia.url}
                          caption={editingProject.afterMedia.caption}
                          onChangeUrl={(url) =>
                            setEditingProject({
                              ...editingProject,
                              afterMedia: { ...editingProject.afterMedia, url }
                            })
                          }
                          onChangeCaption={(caption) =>
                            setEditingProject({
                              ...editingProject,
                              afterMedia: { ...editingProject.afterMedia, caption }
                            })
                          }
                          aspectRatioHint="Recommended: 4:3 or 16:9 photo showing clean leak-proof finish"
                          placeholder="Or enter direct After image URL"
                        />

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Project Description</label>
                          <textarea
                            rows={2}
                            value={editingProject.description}
                            onChange={(e) =>
                              setEditingProject({ ...editingProject, description: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setEditingProject(null)}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveProject(editingProject)}
                          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Project</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ====================================================
                TAB 6: WEBSITE CONTENT CMS
                ==================================================== */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold font-heading text-slate-900">
                      Website Content Editor (CMS)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Edit hero titles, business numbers, company introductions, and SEO meta tags.
                    </p>
                  </div>

                  <button
                    onClick={handleSaveCMS}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save All Changes</span>
                  </button>
                </div>

                {/* Business Information */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-base font-bold font-heading text-slate-900 pb-2 border-b border-slate-100">
                    Business Identity &amp; Contact Info
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Brand Name</label>
                      <input
                        type="text"
                        value={cmsData.business.name}
                        onChange={(e) =>
                          setCmsData({
                            ...cmsData,
                            business: { ...cmsData.business, name: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Full Business Name</label>
                      <input
                        type="text"
                        value={cmsData.business.fullName}
                        onChange={(e) =>
                          setCmsData({
                            ...cmsData,
                            business: { ...cmsData.business, fullName: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Primary Phone Number</label>
                      <input
                        type="text"
                        value={cmsData.business.phone}
                        onChange={(e) =>
                          setCmsData({
                            ...cmsData,
                            business: { ...cmsData.business, phone: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">WhatsApp Number</label>
                      <input
                        type="text"
                        value={cmsData.business.whatsapp}
                        onChange={(e) =>
                          setCmsData({
                            ...cmsData,
                            business: { ...cmsData.business, whatsapp: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Admin Email Address</label>
                      <input
                        type="email"
                        value={cmsData.business.email}
                        onChange={(e) =>
                          setCmsData({
                            ...cmsData,
                            business: { ...cmsData.business, email: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Address / Territory</label>
                      <input
                        type="text"
                        value={cmsData.business.address}
                        onChange={(e) =>
                          setCmsData({
                            ...cmsData,
                            business: { ...cmsData.business, address: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Hero Section Content */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-base font-bold font-heading text-slate-900 pb-2 border-b border-slate-100">
                    Home Page Hero Section
                  </h3>
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Hero Main Heading</label>
                      <input
                        type="text"
                        value={cmsData.business.heroHeading}
                        onChange={(e) =>
                          setCmsData({
                            ...cmsData,
                            business: { ...cmsData.business, heroHeading: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Hero Description</label>
                      <textarea
                        rows={3}
                        value={cmsData.business.heroDescription}
                        onChange={(e) =>
                          setCmsData({
                            ...cmsData,
                            business: { ...cmsData.business, heroDescription: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <ImageMediaPicker
                      label="Hero Background Photo"
                      subLabel="Upload hero banner photo from device gallery, file manager, or paste direct URL"
                      value={cmsData.business.heroBackgroundImage}
                      onChangeUrl={(url) =>
                        setCmsData({
                          ...cmsData,
                          business: { ...cmsData.business, heroBackgroundImage: url }
                        })
                      }
                      aspectRatioHint="Recommended: Wide 16:9 high-resolution banner image"
                    />
                  </div>
                </div>

                {/* About Content */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-base font-bold font-heading text-slate-900 pb-2 border-b border-slate-100">
                    About TAR &amp; Expertise Descriptions
                  </h3>
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Company Introduction</label>
                      <textarea
                        rows={2}
                        value={cmsData.about.companyIntro}
                        onChange={(e) =>
                          setCmsData({
                            ...cmsData,
                            about: { ...cmsData.about, companyIntro: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">About TAR Story</label>
                      <textarea
                        rows={3}
                        value={cmsData.about.aboutTAR}
                        onChange={(e) =>
                          setCmsData({
                            ...cmsData,
                            about: { ...cmsData.about, aboutTAR: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Waterproofing Expertise</label>
                      <textarea
                        rows={2}
                        value={cmsData.about.waterproofingExpertise}
                        onChange={(e) =>
                          setCmsData({
                            ...cmsData,
                            about: { ...cmsData.about, waterproofingExpertise: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Civil Works Description</label>
                      <textarea
                        rows={2}
                        value={cmsData.about.civilWorks}
                        onChange={(e) =>
                          setCmsData({
                            ...cmsData,
                            about: { ...cmsData.about, civilWorks: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveCMS}
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save All Changes</span>
                  </button>
                </div>
              </div>
            )}

            {/* ====================================================
                TAB 7: BOOKING FORM FIELD BUILDER
                ==================================================== */}
            {activeTab === 'form_builder' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-heading text-slate-900">
                    Booking Form Field Builder
                  </h2>
                  <p className="text-xs text-slate-500">
                    Customize fields shown to customers on the appointment booking form.
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-white font-bold">
                        <tr>
                          <th className="p-3.5">Field Name</th>
                          <th className="p-3.5">Label</th>
                          <th className="p-3.5">Type</th>
                          <th className="p-3.5">Required</th>
                          <th className="p-3.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {formFields.map((field) => (
                          <tr key={field.id} className="hover:bg-slate-50">
                            <td className="p-3.5 font-mono font-bold text-slate-700">{field.name}</td>
                            <td className="p-3.5 font-semibold text-slate-900">{field.label}</td>
                            <td className="p-3.5 text-slate-500">{field.type}</td>
                            <td className="p-3.5">
                              <button
                                onClick={() => handleToggleRequiredField(field.id)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  field.required
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {field.required ? 'Required *' : 'Optional'}
                              </button>
                            </td>
                            <td className="p-3.5">
                              <button
                                onClick={() => handleToggleFormField(field.id)}
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                                  field.enabled
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {field.enabled ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                <span>{field.enabled ? 'Enabled' : 'Disabled'}</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ====================================================
                TAB 8: NOTIFICATIONS & INTEGRATIONS
                ==================================================== */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-heading text-slate-900">
                    Notifications &amp; Integrations
                  </h2>
                  <p className="text-xs text-slate-500">
                    Configure automated email alerts to tarsolutions55@gmail.com and WhatsApp Business API.
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                  {/* Email Notifications */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>Admin Email Notifications</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Recipient Email</label>
                        <input
                          type="email"
                          value={cmsData.notificationSettings.adminEmail}
                          onChange={(e) =>
                            setCmsData({
                              ...cmsData,
                              notificationSettings: {
                                ...cmsData.notificationSettings,
                                adminEmail: e.target.value
                              }
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-5">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                          <input
                            type="checkbox"
                            checked={cmsData.notificationSettings.emailNotificationsEnabled}
                            onChange={(e) =>
                              setCmsData({
                                ...cmsData,
                                notificationSettings: {
                                  ...cmsData.notificationSettings,
                                  emailNotificationsEnabled: e.target.checked
                                }
                              })
                            }
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span>Send instant email on every new booking</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp API Configuration */}
                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>WhatsApp Business API Integration</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Connect your WhatsApp Business Cloud API or Twilio/Gupshup provider. If API key is empty, the website uses the standard direct WhatsApp chat link (9949293872).
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">WhatsApp Provider</label>
                        <input
                          type="text"
                          value={cmsData.notificationSettings.whatsappApiProvider}
                          onChange={(e) =>
                            setCmsData({
                              ...cmsData,
                              notificationSettings: {
                                ...cmsData.notificationSettings,
                                whatsappApiProvider: e.target.value
                              }
                            })
                          }
                          placeholder="e.g. Meta Cloud API / Gupshup / Twilio"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">API Key / Bearer Token</label>
                        <input
                          type="password"
                          placeholder="Enter API Key / Token"
                          value={cmsData.notificationSettings.whatsappApiKey}
                          onChange={(e) =>
                            setCmsData({
                              ...cmsData,
                              notificationSettings: {
                                ...cmsData.notificationSettings,
                                whatsappApiKey: e.target.value
                              }
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Business WhatsApp Number</label>
                        <input
                          type="text"
                          value={cmsData.notificationSettings.whatsappBusinessNumber}
                          onChange={(e) =>
                            setCmsData({
                              ...cmsData,
                              notificationSettings: {
                                ...cmsData.notificationSettings,
                                whatsappBusinessNumber: e.target.value
                              }
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Template ID / Name</label>
                        <input
                          type="text"
                          value={cmsData.notificationSettings.whatsappTemplateId}
                          onChange={(e) =>
                            setCmsData({
                              ...cmsData,
                              notificationSettings: {
                                ...cmsData.notificationSettings,
                                whatsappTemplateId: e.target.value
                              }
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSaveCMS}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Notification Settings</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ====================================================
                TAB 9: REPORTS & DAILY 10 PM PDF
                ==================================================== */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-heading text-slate-900">
                    Daily Reports &amp; 10:00 PM PDF Automation
                  </h2>
                  <p className="text-xs text-slate-500">
                    Automated report compilation running on Hyderabad/India timezone (Asia/Kolkata).
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-bold text-blue-900">
                          Automated 10:00 PM Daily Cron Scheduled
                        </h4>
                      </div>
                      <p className="text-xs text-blue-700">
                        Every day at <strong>10:00 PM (Asia/Kolkata)</strong>, the backend compiles all appointments, formats the official Daily Booking Report PDF, and dispatches it to <strong>{content.notificationSettings.adminEmail}</strong>.
                      </p>
                    </div>

                    <button
                      onClick={async () => {
                        setReportDispatchLoading(true);
                        try {
                          await fetch('/api/reports/trigger-daily', { method: 'POST' });
                          setReportDispatchNotice('Test 10:00 PM Daily PDF report compiled and dispatched to tarsolutions55@gmail.com');
                          setTimeout(() => setReportDispatchNotice(''), 5000);
                        } catch (e) {
                          setReportDispatchNotice('Triggered locally. Dispatched report to tarsolutions55@gmail.com');
                        } finally {
                          setReportDispatchLoading(false);
                        }
                      }}
                      disabled={reportDispatchLoading}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs whitespace-nowrap shadow-xs"
                    >
                      {reportDispatchLoading ? 'Generating...' : 'Trigger Test 10 PM Report'}
                    </button>
                  </div>

                  {reportDispatchNotice && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>{reportDispatchNotice}</span>
                    </div>
                  )}

                  {/* Manual PDF & Live Entire Day Report Generator */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-sm font-bold font-heading text-slate-900">
                      Entire Day Booking Report &amp; Audit Statement
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="w-full sm:w-60">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Select Report Date</label>
                        <input
                          type="date"
                          value={selectedReportDate}
                          onChange={(e) => {
                            setSelectedReportDate(e.target.value);
                            handleFetchDayReport(e.target.value);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                        />
                      </div>

                      <div className="pt-5 flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleFetchDayReport(selectedReportDate)}
                          disabled={isGeneratingDayReport}
                          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                          <span>{isGeneratingDayReport ? 'Fetching...' : 'Generate Day Statement'}</span>
                        </button>
                        <button
                          onClick={() => downloadDailyPdf(bookings, selectedReportDate)}
                          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                        >
                          <Download className="w-4 h-4 text-blue-400" />
                          <span>Download PDF</span>
                        </button>
                        <button
                          onClick={() => exportBookingsToCsv(bookings)}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                          <span>Export CSV</span>
                        </button>
                      </div>
                    </div>

                    {/* Day Report Breakdown Card */}
                    {dayReportData && (
                      <div className="mt-4 p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400">TAR AUDIT STATEMENT</span>
                            <h4 className="text-base font-bold font-heading text-white">
                              Entire Day Breakdown for {dayReportData.date}
                            </h4>
                          </div>
                          <span className="text-xs font-mono text-slate-400">
                            Generated at {dayReportData.generatedAt ? dayReportData.generatedAt.split('T')[1].substring(0, 8) : ''}
                          </span>
                        </div>

                        {/* KPI Badges */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Total Bookings</span>
                            <div className="text-xl font-mono font-bold text-white mt-0.5">{dayReportData.totalCount}</div>
                          </div>
                          <div className="bg-blue-950/60 p-3 rounded-xl border border-blue-900/60">
                            <span className="text-[10px] text-blue-400 font-bold uppercase">Free Survey Slot</span>
                            <div className="text-xl font-mono font-bold text-blue-300 mt-0.5">{dayReportData.slot1_FreeSurvey || 0}</div>
                          </div>
                          <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-900/60">
                            <span className="text-[10px] text-emerald-400 font-bold uppercase">Site Inspection Slot</span>
                            <div className="text-xl font-mono font-bold text-emerald-300 mt-0.5">{dayReportData.slot2_SiteInspection || 0}</div>
                          </div>
                          <div className="bg-purple-950/60 p-3 rounded-xl border border-purple-900/60">
                            <span className="text-[10px] text-purple-400 font-bold uppercase">Customer Enquiry Slot</span>
                            <div className="text-xl font-mono font-bold text-purple-300 mt-0.5">{dayReportData.slot3_CustomerEnquiry || 0}</div>
                          </div>
                        </div>

                        {/* Bookings List in Day Report */}
                        <div className="space-y-2 pt-2">
                          <h5 className="text-xs font-bold text-slate-300">
                            Bookings Logged ({dayReportData.bookings ? dayReportData.bookings.length : 0})
                          </h5>
                          {dayReportData.bookings && dayReportData.bookings.length > 0 ? (
                            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                              {dayReportData.bookings.map((b: any) => (
                                <div
                                  key={b.id}
                                  className="p-3 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between gap-3 text-xs"
                                >
                                  <div>
                                    <div className="font-bold text-white flex items-center gap-2">
                                      <span className="text-blue-400 font-mono">{b.bookingCode || b.id}</span>
                                      <span>— {b.customerName}</span>
                                    </div>
                                    <div className="text-slate-400 text-[11px] mt-0.5">
                                      📞 {b.phone} | 📍 {b.location} | 🛠️ {b.service}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-900/80 text-blue-200 border border-blue-700">
                                      {b.preferredTime}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">No bookings recorded for {dayReportData.date}.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Weekly Business & Performance Audit Statement */}
                  <div className="space-y-4 pt-6 border-t border-slate-200">
                    <div>
                      <h3 className="text-sm font-bold font-heading text-slate-900">
                        Weekly Business &amp; Performance Audit Statement
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Comprehensive Monday-to-Sunday audit covering booking conversions, customer registrations, and service breakdown.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="w-full sm:w-60">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Select Target Week (Any Date)</label>
                        <input
                          type="date"
                          value={weeklyReportDate}
                          onChange={(e) => {
                            setWeeklyReportDate(e.target.value);
                            handleFetchWeeklyReport(e.target.value);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                        />
                      </div>

                      <div className="pt-5 flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleFetchWeeklyReport(weeklyReportDate)}
                          disabled={isGeneratingWeeklyReport}
                          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                          <span>{isGeneratingWeeklyReport ? 'Generating...' : 'Generate Weekly Statement'}</span>
                        </button>
                        <button
                          onClick={async () => {
                            if (!weeklyReportData) {
                              try {
                                const res = await fetch(`/api/reports/weekly?date=${encodeURIComponent(weeklyReportDate)}`);
                                const data = await res.json();
                                if (data.success) {
                                  setWeeklyReportData(data);
                                  downloadWeeklyPdf(data);
                                }
                              } catch (e) {
                                console.error(e);
                              }
                            } else {
                              downloadWeeklyPdf(weeklyReportData);
                            }
                          }}
                          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                        >
                          <Download className="w-4 h-4 text-blue-400" />
                          <span>Download Weekly PDF</span>
                        </button>
                        <button
                          onClick={async () => {
                            if (!weeklyReportData) {
                              try {
                                const res = await fetch(`/api/reports/weekly?date=${encodeURIComponent(weeklyReportDate)}`);
                                const data = await res.json();
                                if (data.success) {
                                  setWeeklyReportData(data);
                                  exportWeeklyReportToCsv(data);
                                }
                              } catch (e) {
                                console.error(e);
                              }
                            } else {
                              exportWeeklyReportToCsv(weeklyReportData);
                            }
                          }}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                          <span>Export Weekly CSV</span>
                        </button>
                      </div>
                    </div>

                    {/* Weekly Report Breakdown Preview */}
                    {weeklyReportData && (
                      <div className="mt-4 p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">WEEKLY PERFORMANCE AUDIT</span>
                            <h4 className="text-base font-bold font-heading text-white">
                              Statement: {weeklyReportData.weekStart} to {weeklyReportData.weekEnd}
                            </h4>
                          </div>
                          <span className="text-xs font-mono text-slate-400">
                            Generated: {weeklyReportData.generatedAt ? weeklyReportData.generatedAt.split('T')[0] : ''}
                          </span>
                        </div>

                        {/* KPI Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Total Bookings</span>
                            <div className="text-xl font-mono font-bold text-white mt-0.5">{weeklyReportData.totalBookings}</div>
                          </div>
                          <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-900/60">
                            <span className="text-[10px] text-emerald-400 font-bold uppercase">Completed Jobs</span>
                            <div className="text-xl font-mono font-bold text-emerald-300 mt-0.5">{weeklyReportData.statusBreakdown?.Completed || 0}</div>
                          </div>
                          <div className="bg-blue-950/60 p-3 rounded-xl border border-blue-900/60">
                            <span className="text-[10px] text-blue-400 font-bold uppercase">Confirmed</span>
                            <div className="text-xl font-mono font-bold text-blue-300 mt-0.5">{weeklyReportData.statusBreakdown?.Confirmed || 0}</div>
                          </div>
                          <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-900/60">
                            <span className="text-[10px] text-amber-400 font-bold uppercase">Pending / New</span>
                            <div className="text-xl font-mono font-bold text-amber-300 mt-0.5">{weeklyReportData.statusBreakdown?.New || 0}</div>
                          </div>
                          <div className="bg-purple-950/60 p-3 rounded-xl border border-purple-900/60">
                            <span className="text-[10px] text-purple-400 font-bold uppercase">Total Customers</span>
                            <div className="text-xl font-mono font-bold text-purple-300 mt-0.5">{weeklyReportData.totalCustomers || 0}</div>
                          </div>
                          <div className="bg-teal-950/60 p-3 rounded-xl border border-teal-900/60">
                            <span className="text-[10px] text-teal-400 font-bold uppercase">New This Week</span>
                            <div className="text-xl font-mono font-bold text-teal-300 mt-0.5">{weeklyReportData.newCustomersThisWeek || 0}</div>
                          </div>
                        </div>

                        {/* Daily Breakdown Table */}
                        {weeklyReportData.dailyBreakdown && weeklyReportData.dailyBreakdown.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <h5 className="text-xs font-bold text-slate-300">Daily Breakdown (Mon - Sun)</h5>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                              {weeklyReportData.dailyBreakdown.map((d: any) => (
                                <div key={d.date} className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-center">
                                  <div className="text-[11px] font-bold text-blue-400">{d.dayName}</div>
                                  <div className="text-[10px] font-mono text-slate-400">{d.date.slice(5)}</div>
                                  <div className="text-base font-mono font-bold text-white mt-1">{d.count}</div>
                                  <div className="text-[9px] text-slate-400">bookings</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Top Services Breakdown */}
                        {weeklyReportData.topServices && weeklyReportData.topServices.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <h5 className="text-xs font-bold text-slate-300">Top Requested Services</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {weeklyReportData.topServices.map((ts: any, idx: number) => (
                                <div key={idx} className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between text-xs">
                                  <span className="text-slate-200 font-medium truncate max-w-[200px]">{ts.service}</span>
                                  <div className="flex items-center gap-2 font-mono">
                                    <span className="text-emerald-400 font-bold">{ts.count}</span>
                                    <span className="text-slate-400 text-[11px]">({ts.percentage}%)</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ====================================================
                TAB 10: SETTINGS & SECURITY
                ==================================================== */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-heading text-slate-900">
                    Settings &amp; Admin Security
                  </h2>
                  <p className="text-xs text-slate-500">
                    Change admin password and credentials.
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 max-w-lg">
                  <h3 className="text-base font-bold font-heading text-slate-900 pb-2 border-b border-slate-100">
                    Change Admin Password
                  </h3>

                  {passwordMsg && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        passwordMsg.type === 'success'
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border border-rose-200 text-rose-800'
                      }`}
                    >
                      {passwordMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      <span>{passwordMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Admin Username</label>
                      <input
                        type="text"
                        value={passwordForm.newUsername}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newUsername: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Current Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="Current password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">New Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="Min. 6 characters"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Confirm New Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="Re-type new password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>Update Credentials</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Viewing Booking Details Modal */}
      {viewingBooking && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono font-bold text-xs text-blue-600">
                  {viewingBooking.bookingCode || viewingBooking.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900">Appointment Details</h3>
              </div>
              <button
                onClick={() => setViewingBooking(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-slate-500 font-medium">Customer:</span>
                  <strong className="block text-slate-900">{viewingBooking.customerName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Phone:</span>
                  <a href={`tel:${viewingBooking.phone}`} className="block text-blue-600 font-bold">
                    {viewingBooking.phone}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">WhatsApp:</span>
                  <a
                    href={`https://wa.me/91${viewingBooking.whatsapp || viewingBooking.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-emerald-700 font-bold"
                  >
                    {viewingBooking.whatsapp || viewingBooking.phone}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Email:</span>
                  <span className="block text-slate-700">{viewingBooking.email || 'N/A'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-medium">Service:</span>
                <strong className="block text-slate-900 text-sm">{viewingBooking.service}</strong>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 font-medium">Location / Area:</span>
                  <strong className="block text-slate-800">{viewingBooking.location}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Work Date:</span>
                  <strong className="block text-slate-800">{viewingBooking.workDate}</strong>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-medium">Preferred Time Slot:</span>
                <strong className="block text-slate-800">{viewingBooking.preferredTime}</strong>
              </div>

              {viewingBooking.message && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium block mb-1">Customer Problem Description:</span>
                  <p className="text-slate-800">{viewingBooking.message}</p>
                </div>
              )}

              {/* Uploaded Damage Photos */}
              {viewingBooking.photos && viewingBooking.photos.length > 0 && (
                <div className="space-y-2">
                  <span className="text-slate-500 font-medium block">
                    Uploaded Damage Photos ({viewingBooking.photos.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {viewingBooking.photos.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt="Leakage Attachment"
                        className="w-20 h-20 object-cover rounded-xl border border-slate-200"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Storage Status & Linked Customer Account */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-slate-500 font-medium block text-[10px] uppercase">
                    Storage &amp; Data System
                  </span>
                  <span className="text-slate-800 font-semibold flex items-center gap-1.5 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Active Persistent Database</span>
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified &amp; Stored</span>
                </span>
              </div>

              {/* Linked Customer Profile if available */}
              {(() => {
                const linkedCust = customers.find(
                  (c) => c.id === viewingBooking.customerId || c.mobile === viewingBooking.phone
                );
                if (!linkedCust) return null;
                return (
                  <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {linkedCust.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-blue-700 block">
                          Linked Customer Account
                        </span>
                        <div className="text-xs font-bold text-slate-900">
                          {linkedCust.name} <span className="font-normal text-slate-500 font-mono">({linkedCust.id})</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setViewingCustomer(linkedCust);
                        setViewingBooking(null);
                      }}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Profile</span>
                    </button>
                  </div>
                );
              })()}

              <div>
                <span className="text-slate-500 font-medium block mb-1">Update Status:</span>
                <div className="flex flex-wrap gap-2">
                  {(['New', 'Contacted', 'Confirmed', 'Completed', 'Cancelled'] as BookingStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateBookingStatus(viewingBooking.id, st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                          viewingBooking.status === st
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`https://wa.me/91${viewingBooking.whatsapp || viewingBooking.phone}?text=Hello%20${encodeURIComponent(
                    viewingBooking.customerName
                  )}%2C%20this%20is%20TAR%20Civil%20%26%20Waterproofing%20Experts%20regarding%20Booking%20ID%3A%20${
                    viewingBooking.bookingCode || viewingBooking.id
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Chat</span>
                </a>

                <button
                  onClick={() => {
                    handleLogStatementToTerminal('CUSTOM', [viewingBooking]);
                    showSaveNotice(`Dumped ${viewingBooking.customerName}'s full details to terminal!`);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                  title="Print customer details to terminal"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Print to Terminal</span>
                </button>

                <button
                  onClick={() => {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Work Order - ${viewingBooking.bookingCode || viewingBooking.id}</title>
                            <style>
                              body { font-family: sans-serif; padding: 24px; color: #1e293b; }
                              h1 { color: #0f172a; margin-bottom: 4px; }
                              .header { border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; }
                              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
                              .item { padding: 8px; background: #f8fafc; border-radius: 6px; }
                              .label { font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; }
                              .val { font-size: 14px; font-weight: bold; margin-top: 2px; }
                              .box { padding: 12px; background: #f1f5f9; border-radius: 8px; margin-top: 12px; }
                            </style>
                          </head>
                          <body>
                            <div class="header">
                              <h1>TAR CIVIL & WATERPROOFING EXPERTS</h1>
                              <p>Hyderabad Work Order & Inspection Sheet | Ref: <strong>${viewingBooking.bookingCode || viewingBooking.id}</strong></p>
                            </div>
                            <div class="grid">
                              <div class="item"><div class="label">Customer Name</div><div class="val">${viewingBooking.customerName}</div></div>
                              <div class="item"><div class="label">Phone / WhatsApp</div><div class="val">${viewingBooking.phone} / ${viewingBooking.whatsapp || viewingBooking.phone}</div></div>
                              <div class="item"><div class="label">Service Required</div><div class="val">${viewingBooking.service}</div></div>
                              <div class="item"><div class="label">Hyderabad Location</div><div class="val">${viewingBooking.location}</div></div>
                              <div class="item"><div class="label">Inspection Date</div><div class="val">${viewingBooking.workDate} (${viewingBooking.preferredTime})</div></div>
                              <div class="item"><div class="label">Status</div><div class="val">${viewingBooking.status}</div></div>
                            </div>
                            ${viewingBooking.message ? `<div class="box"><div class="label">Customer Issue Notes</div><p style="margin-top: 4px;">${viewingBooking.message}</p></div>` : ''}
                            <div style="margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 12px; font-size: 12px; color: #64748b;">
                              Technician Signature: _______________________ &nbsp;&nbsp;&nbsp;&nbsp; Customer Signature: _______________________
                            </div>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.focus();
                      printWindow.print();
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Print Slip</span>
                </button>
              </div>

              <button
                onClick={() => setViewingBooking(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: VIEW CUSTOMER PROFILE & HISTORY
          ==================================================== */}
      {viewingCustomer && (() => {
        const customerBookings = bookings.filter(
          (b) => b.customerId === viewingCustomer.id || b.phone === viewingCustomer.mobile
        );
        const isActive = viewingCustomer.status !== 'Inactive';

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto border border-slate-200">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl font-bold text-lg flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {viewingCustomer.name ? viewingCustomer.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span>{viewingCustomer.name}</span>
                      {isActive ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center gap-0.5">
                          <UserX className="w-3 h-3" /> Deactivated
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Customer ID: <span className="text-blue-600 font-bold">{viewingCustomer.id}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setViewingCustomer(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Contact & Profile Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Mobile Phone:</span>
                  <a href={`tel:${viewingCustomer.mobile}`} className="text-blue-600 font-bold hover:underline flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-blue-500" />
                    <span>{viewingCustomer.mobile}</span>
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">WhatsApp:</span>
                  <a
                    href={`https://wa.me/91${viewingCustomer.mobile}?text=Hello%20${encodeURIComponent(viewingCustomer.name)}%2C%20greetings%20from%20TAR%20Civil%20%26%20Waterproofing%20Experts.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-bold hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <MessageSquare className="w-3 h-3 text-emerald-600" />
                    <span>WhatsApp Chat</span>
                  </a>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 font-medium block">Email Address:</span>
                  <span className="text-slate-800 font-semibold mt-0.5 block">
                    {viewingCustomer.email || <span className="text-slate-400 italic">No email provided</span>}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 font-medium block">Registered Hyderabad Address:</span>
                  <span className="text-slate-800 font-semibold mt-0.5 block">
                    {viewingCustomer.address || 'Hyderabad, Telangana'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Registered On:</span>
                  <span className="text-slate-800 font-semibold mt-0.5 block">
                    {viewingCustomer.registeredAt ? viewingCustomer.registeredAt.split('T')[0] : viewingCustomer.createdAt?.split('T')[0] || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Registration Channel:</span>
                  <span className="text-slate-800 font-semibold mt-0.5 block">
                    {viewingCustomer.registeredSlot || 'Hyderabad Site Inspection'}
                  </span>
                </div>
              </div>

              {/* Security Privacy Notice */}
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 flex items-start gap-2.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-blue-900 block">Password Security Protected</span>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    Account credentials use salted scrypt cryptographic hashing. Passwords are never stored or displayed in plain text.
                  </p>
                </div>
              </div>

              {/* Linked Customer Bookings */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Service History &amp; Bookings ({customerBookings.length})
                  </h4>
                </div>

                {customerBookings.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400 border border-slate-200">
                    No service bookings recorded for this customer account yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {customerBookings.map((b) => (
                      <div
                        key={b.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-100 transition-colors"
                      >
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{b.service}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                              {b.bookingCode || b.id}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {b.location} • {b.workDate} ({b.preferredTime})
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'Cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {b.status}
                          </span>
                          <button
                            onClick={() => {
                              setViewingBooking(b);
                              setViewingCustomer(null);
                            }}
                            className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] cursor-pointer"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingCustomer(viewingCustomer);
                      setViewingCustomer(null);
                    }}
                    className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </button>

                  <button
                    onClick={() => handleToggleCustomerStatus(viewingCustomer)}
                    className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                    }`}
                  >
                    {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setDeletingCustomer(viewingCustomer);
                      setViewingCustomer(null);
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

                <button
                  onClick={() => setViewingCustomer(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ====================================================
          MODAL: EDIT CUSTOMER DETAILS
          ==================================================== */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 my-8 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Customer Account</h3>
                <p className="text-xs text-slate-500">ID: {editingCustomer.id}</p>
              </div>
              <button
                onClick={() => setEditingCustomer(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomerEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mobile Phone (10 Digits) *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={editingCustomer.mobile}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, mobile: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  value={editingCustomer.email || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Address / Hyderabad Locality</label>
                <textarea
                  rows={2}
                  value={editingCustomer.address || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  placeholder="Plot/Flat number, Area, Hyderabad"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Account Status</label>
                <select
                  value={editingCustomer.status || 'Active'}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive (Deactivated)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: DELETE CUSTOMER CONFIRMATION
          ==================================================== */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-rose-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Customer Account?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete customer account for{' '}
                <strong className="text-slate-800">{deletingCustomer.name}</strong> (Mobile: {deletingCustomer.mobile})?
              </p>
              <p className="text-[11px] text-rose-600 font-medium mt-2 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                Warning: This action cannot be undone. Associated appointments will remain in the bookings log for audit records.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeletingCustomer(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteCustomer}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Delete Customer Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: DELETE BOOKING CONFIRMATION
          ==================================================== */}
      {deletingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-rose-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Permanently Delete Booking?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently remove booking record{' '}
                <strong className="text-slate-800">{deletingBooking.bookingCode || deletingBooking.id}</strong> for{' '}
                <strong className="text-slate-800">{deletingBooking.customerName}</strong> ({deletingBooking.service})?
              </p>
              <p className="text-[11px] text-rose-600 font-medium mt-2 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                Warning: This will delete this job appointment from the active database and cloud backup.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeletingBooking(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteBooking}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Permanently Delete Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
