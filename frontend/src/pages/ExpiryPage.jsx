import { useState, useEffect } from 'react';
import api from '../api';

const ExpiryPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTier, setActiveTier] = useState('ALL'); // 'ALL', 'EXPIRED', 'CRITICAL', 'WARNING', 'SAFE'
  const [sortBy, setSortBy] = useState('EXP_ASC'); // 'EXP_ASC', 'NAME_ASC', 'STOCK_ASC'

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/products');
      
      // Calculate remaining days for all medicines on load
      const processed = response.data.map((med) => {
        const remainingDays = calculateRemainingDays(med.expiryDate);
        const statusTier = getExpiryTier(remainingDays);
        return {
          ...med,
          remainingDays,
          statusTier
        };
      });

      setMedicines(processed);
    } catch (err) {
      console.error('Error fetching expiry data:', err);
      setError('Failed to fetch medicines inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateRemainingDays = (expiryStr) => {
    if (!expiryStr) return Infinity; // No expiry is treated as safe
    const expiry = new Date(expiryStr);
    const today = new Date();
    
    expiry.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryTier = (days) => {
    if (days === Infinity) return 'SAFE';
    if (days <= 0 || days < 30) return 'EXPIRED'; // Expired or less than 30 days
    if (days >= 30 && days <= 59) return 'CRITICAL';
    if (days >= 60 && days <= 90) return 'WARNING';
    return 'SAFE'; // > 90 days
  };

  // Group counters
  const totalCount = medicines.length;
  const expiredCount = medicines.filter(m => m.statusTier === 'EXPIRED').length;
  const criticalCount = medicines.filter(m => m.statusTier === 'CRITICAL').length;
  const warningCount = medicines.filter(m => m.statusTier === 'WARNING').length;
  const safeCount = medicines.filter(m => m.statusTier === 'SAFE').length;

  // Filter & Sort Logic
  const filteredMedicines = medicines
    .filter((med) => {
      const matchSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTier = activeTier === 'ALL' || med.statusTier === activeTier;
      return matchSearch && matchTier;
    })
    .sort((a, b) => {
      if (sortBy === 'EXP_ASC') {
        if (a.remainingDays === Infinity) return 1;
        if (b.remainingDays === Infinity) return -1;
        return a.remainingDays - b.remainingDays;
      }
      if (sortBy === 'NAME_ASC') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'STOCK_ASC') {
        return a.stock - b.stock;
      }
      return 0;
    });

  const getBadgeStyles = (tier, days) => {
    if (tier === 'EXPIRED') {
      return {
        bg: 'bg-rose-50 text-rose-600 border-rose-100',
        text: days <= 0 ? `Expired (${Math.abs(days)}d ago)` : `Urgent (${days}d left)`,
        dot: 'bg-rose-500 animate-pulse'
      };
    }
    if (tier === 'CRITICAL') {
      return {
        bg: 'bg-orange-50 text-orange-600 border-orange-100',
        text: `Critical (${days}d left)`,
        dot: 'bg-orange-500'
      };
    }
    if (tier === 'WARNING') {
      return {
        bg: 'bg-amber-50 text-amber-600 border-amber-100',
        text: `Warning (${days}d left)`,
        dot: 'bg-amber-500'
      };
    }
    return {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      text: days === Infinity ? 'Safe (No Expiry)' : `Safe (${days}d left)`,
      dot: 'bg-emerald-500'
    };
  };

  return (
    <section className="space-y-6">
      {/* Header Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
          Inventory Audit
        </p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-850">Expiry Manager</h2>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Track medicine expiry dates, monitor warning periods, and purge expired inventory.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-white p-4 text-rose-600 text-xs shadow-sm font-semibold">
          {error}
        </div>
      )}

      {/* Interactive Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <button
          type="button"
          onClick={() => setActiveTier('ALL')}
          className={`flex flex-col rounded-3xl border p-5 text-left transition hover:scale-[1.01] ${
            activeTier === 'ALL'
              ? 'border-emerald-500 bg-emerald-50/20 shadow-sm'
              : 'border-slate-200 bg-white hover:bg-slate-50/50'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">All Medicines</span>
          <span className="mt-2 text-3xl font-black text-slate-800">{totalCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTier('EXPIRED')}
          className={`flex flex-col rounded-3xl border p-5 text-left transition hover:scale-[1.01] ${
            activeTier === 'EXPIRED'
              ? 'border-rose-500 bg-rose-50/20 shadow-sm'
              : 'border-rose-100 bg-white hover:bg-rose-50/30'
          }`}
        >
          <div className="flex items-center gap-1.5 text-rose-600 text-[10px] font-bold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Expired / Urgent
          </div>
          <span className="mt-2 text-3xl font-black text-rose-600">{expiredCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTier('CRITICAL')}
          className={`flex flex-col rounded-3xl border p-5 text-left transition hover:scale-[1.01] ${
            activeTier === 'CRITICAL'
              ? 'border-orange-500 bg-orange-50/20 shadow-sm'
              : 'border-orange-100 bg-white hover:bg-orange-50/30'
          }`}
        >
          <div className="flex items-center gap-1.5 text-orange-600 text-[10px] font-bold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
            Critical
          </div>
          <span className="mt-2 text-3xl font-black text-orange-600">{criticalCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTier('WARNING')}
          className={`flex flex-col rounded-3xl border p-5 text-left transition hover:scale-[1.01] ${
            activeTier === 'WARNING'
              ? 'border-amber-500 bg-amber-50/20 shadow-sm'
              : 'border-amber-100 bg-white hover:bg-amber-50/30'
          }`}
        >
          <div className="flex items-center gap-1.5 text-amber-600 text-[10px] font-bold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            Warning
          </div>
          <span className="mt-2 text-3xl font-black text-amber-600">{warningCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTier('SAFE')}
          className={`flex flex-col rounded-3xl border p-5 text-left transition hover:scale-[1.01] ${
            activeTier === 'SAFE'
              ? 'border-emerald-500 bg-emerald-50/20 shadow-sm'
              : 'border-emerald-100 bg-white hover:bg-emerald-50/30'
          }`}
        >
          <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Safe
          </div>
          <span className="mt-2 text-3xl font-black text-emerald-600">{safeCount}</span>
        </button>
      </div>

      {/* Filter and Sort Inputs Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search medicines by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
          >
            <option value="EXP_ASC">Nearest Expiry Date</option>
            <option value="NAME_ASC">Medicine Name (A-Z)</option>
            <option value="STOCK_ASC">Quantity (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Main Grid Table Display */}
      <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-white">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-100 border-t-emerald-500"></div>
            <p className="text-xs text-slate-400 font-bold">Scanning Expiry Timelines...</p>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white flex flex-col items-center justify-center">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-3 border border-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-700">No Medicines Found</p>
            <p className="text-[10px] text-slate-400 mt-1">There are no records matching your query under the active filter card.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-655">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3">Medicine Name</th>
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">Batch Number</th>
                  <th className="px-6 py-3 text-center">Stock Qty</th>
                  <th className="px-6 py-3 text-right">Purchase Price</th>
                  <th className="px-6 py-3 text-right">Selling Price</th>
                  <th className="px-6 py-3 font-mono text-center">Expiry Date</th>
                  <th className="px-6 py-3 text-center">Remaining</th>
                  <th className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMedicines.map((med) => {
                  const badge = getBadgeStyles(med.statusTier, med.remainingDays);
                  return (
                    <tr key={med.id} className="hover:bg-slate-50/40 transition">
                      <td className="px-6 py-4 font-bold text-slate-800 text-sm">{med.name.toUpperCase()}</td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{med.company || ''}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500 font-semibold">{med.batchNumber || 'N/A'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold px-2.5 py-0.5 rounded-lg border text-[10px] ${
                          med.stock < 10 
                            ? 'bg-rose-50 text-rose-600 border-rose-100' 
                            : 'bg-slate-100 text-slate-500 border-slate-200/50'
                        }`}>
                          {med.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-slate-500 font-semibold">
                        {med.purchasePrice ? `Rs. ${parseFloat(med.purchasePrice).toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-emerald-600 font-bold">
                        Rs. {parseFloat(med.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 font-mono text-center text-slate-400 font-medium">
                        {med.expiryDate || 'No Expiry'}
                      </td>
                      <td className="px-6 py-4 text-center font-bold">
                        {med.remainingDays === Infinity ? (
                          <span className="text-slate-400 font-medium">--</span>
                        ) : med.remainingDays <= 0 ? (
                          <span className="text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">Expired</span>
                        ) : (
                          <span className="text-slate-700">{med.remainingDays} days</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold border ${badge.bg}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`}></span>
                          {badge.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default ExpiryPage;
