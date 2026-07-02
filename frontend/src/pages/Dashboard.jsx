import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/dashboard/stats');
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard metrics. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getDaysRemainingInfo = (expiryDateStr) => {
    if (!expiryDateStr) return { text: 'No Expiry', colorClass: 'text-slate-500 bg-slate-50 border-slate-200/60' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expDate = new Date(expiryDateStr);
    expDate.setHours(0, 0, 0, 0);
    
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      const days = Math.abs(diffDays);
      return {
        text: `Expired ${days}d ago`,
        colorClass: 'text-rose-600 bg-rose-50 border-rose-100',
        isExpired: true,
      };
    } else if (diffDays === 0) {
      return {
        text: 'Expires Today',
        colorClass: 'text-orange-600 bg-orange-50 border-orange-100 font-semibold animate-pulse',
        isToday: true,
      };
    } else if (diffDays <= 30) {
      return {
        text: `${diffDays}d left`,
        colorClass: 'text-rose-600 bg-rose-50 border-rose-100 font-bold',
        isSoon: true,
      };
    } else if (diffDays <= 90) {
      return {
        text: `${diffDays}d left`,
        colorClass: 'text-amber-600 bg-amber-50 border-amber-100',
        isWarning: true,
      };
    } else {
      return {
        text: `${diffDays}d left`,
        colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        isFine: true,
      };
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <svg className="h-10 w-10 animate-spin text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-sm font-semibold text-slate-500">Loading Medical Shop metrics from SQLite...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-base font-bold text-slate-800">Database Connection Failed</p>
        <p className="mt-1 text-sm text-slate-500">{error}</p>
        <button
          type="button"
          onClick={fetchStats}
          className="mt-5 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-emerald-450 transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const {
    totalMedicines,
    totalStock,
    lowStockCount,
    expiringSoonCount,
    lowStockMedicines,
    expiringSoon,
    recentlyAdded,
  } = data;

  const statsCards = [
    {
      label: 'Total Medicines',
      value: totalMedicines,
      hint: 'Unique drug formulations in catalog',
      bgClass: 'bg-white border-blue-100/60 shadow-blue-50/10',
      iconBg: 'bg-blue-50 text-blue-600',
      valueClass: 'text-slate-800',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
          <path d="m8.5 8.5 7 7" />
        </svg>
      )
    },
    {
      label: 'Total Stock Quantity',
      value: totalStock,
      hint: 'Aggregate inventory units in store',
      bgClass: 'bg-white border-emerald-100/60 shadow-emerald-50/10',
      iconBg: 'bg-emerald-50 text-emerald-600',
      valueClass: 'text-slate-800',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="m7.5 4.27 9 5.15" />
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      )
    },
    {
      label: 'Low Stock Alerts',
      value: lowStockCount,
      hint: 'Medicines with quantity below 10',
      bgClass: lowStockCount > 0 
        ? 'bg-amber-50/30 border-amber-200/70 shadow-amber-50/10' 
        : 'bg-white border-slate-200/80 shadow-slate-50/10',
      iconBg: lowStockCount > 0 ? 'bg-amber-100 text-amber-600 animate-bounce' : 'bg-slate-50 text-slate-500',
      valueClass: lowStockCount > 0 ? 'text-amber-700' : 'text-slate-800',
      highlight: lowStockCount > 0,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      )
    },
    {
      label: 'Upcoming Expiries',
      value: expiringSoonCount,
      hint: 'Expiring in 30 days or already expired',
      bgClass: expiringSoonCount > 0 
        ? 'bg-rose-50/30 border-rose-200/70 shadow-rose-50/10' 
        : 'bg-white border-slate-200/80 shadow-slate-50/10',
      iconBg: expiringSoonCount > 0 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-slate-50 text-slate-500',
      valueClass: expiringSoonCount > 0 ? 'text-rose-700' : 'text-slate-800',
      highlight: expiringSoonCount > 0,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Overview */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl"></div>
        <div className="absolute left-0 bottom-0 -ml-16 -mb-16 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl"></div>
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
            Pharmacy Overview
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-850">
            MediShop Operations Console
          </h2>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-500 font-medium">
            Keep track of live inventory levels, medicine status warning levels, and catalog seed operations.
          </p>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((stat) => (
          <article
            key={stat.label}
            className={`relative overflow-hidden rounded-3xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${stat.bgClass}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <span className={`rounded-xl p-2.5 ${stat.iconBg}`}>{stat.icon}</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-3xl font-black tracking-tight ${stat.valueClass}`}>
                {stat.value}
              </span>
              {stat.highlight && (
                <span className="flex h-2 w-2 rounded-full bg-current animate-ping"></span>
              )}
            </div>
            <p className="mt-2 text-[10px] text-slate-400 font-semibold leading-normal">{stat.hint}</p>
          </article>
        ))}
      </section>

      {/* Low Stock & Expiry warning panels */}
      <section className="grid gap-6 lg:grid-cols-2">
        
        {/* Low Stock Alert Panel */}
        <div className="flex flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-amber-500">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <h3 className="text-base font-extrabold text-slate-800">Low Stock Medicines</h3>
            </div>
            <span className="rounded-lg bg-amber-50 text-[10px] font-bold px-2 py-0.5 text-amber-600 border border-amber-100">
              {lowStockCount} items
            </span>
          </div>

          <div className="mt-4 flex-grow overflow-x-auto">
            {lowStockMedicines.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center text-center">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-500 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-slate-700">Stock Levels Healthy</p>
                <p className="text-[10px] text-slate-400 mt-0.5">All medicines have a remaining stock count above 10.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-650">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-2.5">Medicine</th>
                    <th className="py-2.5">Category</th>
                    <th className="py-2.5 text-right">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockMedicines.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-bold text-slate-800">{item.name.toUpperCase()}</td>
                      <td className="py-3">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 font-bold text-[10px] text-slate-500">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className={`inline-block rounded-lg px-2.5 py-0.5 font-extrabold text-[10px] border ${
                          item.stock <= 5 
                            ? 'bg-rose-50 text-rose-600 border-rose-100' 
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {item.stock} left
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Expiring Soon Alert Panel */}
        <div className="flex flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-rose-500">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <h3 className="text-base font-extrabold text-slate-800">Expiry Warnings</h3>
            </div>
            <span className="rounded-lg bg-rose-50 text-[10px] font-bold px-2 py-0.5 text-rose-600 border border-rose-100">
              {expiringSoonCount} items
            </span>
          </div>

          <div className="mt-4 flex-grow overflow-x-auto">
            {expiringSoon.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center text-center">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-500 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-slate-700">No Imminent Expiries</p>
                <p className="text-[10px] text-slate-400 mt-0.5">No products expire in the next 30 days.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-650">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-2.5">Medicine</th>
                    <th className="py-2.5 font-mono">Expiry</th>
                    <th className="py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expiringSoon.map((item) => {
                    const info = getDaysRemainingInfo(item.expiryDate);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-bold text-slate-800">{item.name.toUpperCase()}</td>
                        <td className="py-3 text-slate-400 font-mono font-medium">{item.expiryDate}</td>
                        <td className="py-3 text-right">
                          <span className={`inline-block rounded-lg border px-2 py-0.5 font-bold text-[9px] ${info.colorClass}`}>
                            {info.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {/* Recently Added Section */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-500">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            <h3 className="text-base font-extrabold text-slate-800">Recently Added Medicines</h3>
          </div>
          <Link
            to="/dashboard/products"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-500 transition"
          >
            Manage Catalog &rarr;
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          {recentlyAdded.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400 font-medium">No medicines in the catalog yet.</p>
          ) : (
            <table className="w-full text-left text-xs text-slate-655">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5">Medicine</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5">Price</th>
                  <th className="py-2.5">Stock</th>
                  <th className="py-2.5 text-right">Added On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentlyAdded.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-bold text-slate-805">{item.name.toUpperCase()}</td>
                    <td className="py-3">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 font-bold text-[10px] text-slate-500">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 text-slate-700 font-mono font-medium">Rs. {parseFloat(item.price).toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`font-bold ${item.stock < 10 ? 'text-amber-600' : 'text-slate-600'}`}>
                        {item.stock} units
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-400 font-mono font-semibold">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
