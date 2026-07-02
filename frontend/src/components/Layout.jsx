import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const navLinkClassName = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
    isActive
      ? 'bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100/50'
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
  }`;

const Layout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  // Mobile Drawer Toggle
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Search autocomplete states
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const searchRef = useRef(null);

  // Debounced search query lookup
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const response = await api.get(`/products/search?q=${searchQuery}`);
        setSuggestions(response.data);
      } catch (err) {
        console.error('Error fetching search suggestions:', err);
      }
    }, 200);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Click outside suggestions dropdown detector
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const highlightText = (text, highlight) => {
    if (!text) return '';
    if (!highlight.trim()) return text;
    
    const escapedHighlight = highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-emerald-500/20 text-emerald-700 rounded px-0.5 font-semibold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const NavigationMenu = () => (
    <nav className="flex flex-col gap-1.5">
      <NavLink 
        to="/dashboard" 
        end 
        onClick={() => setIsMobileSidebarOpen(false)}
        className={navLinkClassName}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
        Overview
      </NavLink>
      <NavLink 
        to="/dashboard/products" 
        onClick={() => setIsMobileSidebarOpen(false)}
        className={navLinkClassName}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
        Products Catalog
      </NavLink>
      <NavLink 
        to="/dashboard/scanner" 
        onClick={() => setIsMobileSidebarOpen(false)}
        className={navLinkClassName}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
        </svg>
        Bill Scanner
      </NavLink>
      <NavLink 
        to="/dashboard/expiry" 
        onClick={() => setIsMobileSidebarOpen(false)}
        className={navLinkClassName}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Expiry Manager
      </NavLink>
      {admin?.role === 'admin' && (
        <NavLink 
          to="/dashboard/users" 
          onClick={() => setIsMobileSidebarOpen(false)}
          className={navLinkClassName}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 20a11.385 11.385 0 01-4.912-.763v-.109m0 0a3 3 0 00-5.377-1.802 9.047 9.047 0 00-1.088 7.923M15 10a3 3 0 11-6 0 3 3 0 016 0zm6-3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5-3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
          User Accounts
        </NavLink>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-sm px-4 lg:px-8 py-3.5 flex items-center justify-between">
        
        {/* Left Brand Area */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="rounded-lg p-2 hover:bg-slate-100 text-slate-600 lg:hidden transition"
            title="Toggle Sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white font-black text-xl shadow shadow-emerald-200">
              M
            </span>
            <div>
              <h1 className="text-base font-extrabold text-slate-850 tracking-tight leading-none">MediShop</h1>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Pharmacy SaaS</span>
            </div>
          </div>
        </div>

        {/* Global Smart Medicine Search */}
        <div ref={searchRef} className="relative flex-grow max-w-xs md:max-w-md mx-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Smart Search Medicines..."
              value={searchQuery}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-650"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-50 w-full rounded-2xl border border-slate-200 bg-white shadow-2xl p-1.5 max-h-80 overflow-y-auto">
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedProduct(item);
                    setShowDropdown(false);
                    setSearchQuery('');
                  }}
                  className="w-full flex items-center justify-between text-left rounded-xl px-3 py-2 transition hover:bg-slate-50"
                >
                  <div className="min-w-0 pr-3">
                    <p className="font-bold text-xs text-slate-800 truncate">
                      {highlightText(item.name.toUpperCase(), searchQuery.toUpperCase())}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {item.company ? highlightText(item.company, searchQuery) : ''}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-lg border ${
                    item.stock < 10 
                      ? 'bg-rose-50 text-rose-600 border-rose-100' 
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    Qty: {item.stock}
                  </span>
                </button>
              ))}
            </div>
          )}
          {showDropdown && searchQuery.trim() && suggestions.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-50 w-full rounded-2xl border border-slate-200 bg-white shadow-2xl p-4 text-center text-xs text-slate-400">
              No medicines match "{searchQuery}"
            </div>
          )}
        </div>

        {/* Right User Box */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-slate-800 leading-tight">{admin?.name}</p>
            <p className="text-[10px] text-slate-400 font-medium">{admin?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 px-3.5 py-2 text-xs font-bold text-slate-600 shadow-sm transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Structural Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row lg:gap-6 px-4 lg:px-8 py-6">
        
        {/* Left Desktop Sidebar */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sticky top-24">
            <NavigationMenu />
          </div>
        </aside>

        {/* Mobile Sidebar Overlay Drawer */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsMobileSidebarOpen(false)}
            ></div>
            
            {/* Drawer */}
            <div className="relative w-full max-w-xs bg-white p-6 shadow-2xl flex flex-col gap-6 animate-in slide-in-from-left duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white font-black text-lg">
                    M
                  </span>
                  <span className="font-extrabold text-slate-800 text-sm">MediShop Menu</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="rounded-lg p-1 text-slate-450 hover:bg-slate-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <NavigationMenu />
              
              <div className="mt-auto border-t border-slate-100 pt-4 text-xs text-slate-400">
                Logged in as:<br />
                <span className="font-bold text-slate-700">{admin?.name}</span>
              </div>
            </div>
          </div>
        )}

        {/* Content Outlet */}
        <main className="flex-grow min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Global Medicine Details Pop-up Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1 text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                  {selectedProduct.category || 'Tablet'}
                </span>
                <h3 className="text-lg font-bold text-slate-850 mt-2">{selectedProduct.name.toUpperCase()}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-650">
              {/* Description */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</h4>
                <p className="mt-1 text-slate-800 leading-relaxed font-medium">{selectedProduct.description || 'No description available.'}</p>
              </div>

              {/* Company & Batch */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3.5">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Company Name</h4>
                  <p className="mt-1 text-slate-800 font-bold">{selectedProduct.company || ''}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Batch Number</h4>
                  <p className="mt-1 text-slate-700 font-mono font-semibold">{selectedProduct.batchNumber || 'N/A'}</p>
                </div>
              </div>

              {/* Stock & Expiry */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3.5">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Available Stock</h4>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${
                      selectedProduct.stock < 10 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                    }`}></span>
                    <p className="text-slate-800 font-extrabold">{selectedProduct.stock} units</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expiry Date</h4>
                  <p className="mt-1 text-slate-700 font-mono font-semibold">{selectedProduct.expiryDate || 'No Expiry Date'}</p>
                </div>
              </div>

              {/* Purchase Price & Selling Price & Margin */}
              <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-3.5">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Purchase Price</h4>
                  <p className="mt-1 text-slate-800 font-mono font-semibold">
                    {selectedProduct.purchasePrice ? `Rs. ${parseFloat(selectedProduct.purchasePrice).toFixed(2)}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selling Price</h4>
                  <p className="mt-1 text-emerald-600 font-mono font-bold">
                    Rs. {parseFloat(selectedProduct.price).toFixed(2)}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Profit Markup</h4>
                  <p className="mt-1 text-blue-600 font-bold">
                    {selectedProduct.purchasePrice && selectedProduct.purchasePrice > 0
                      ? `+${((selectedProduct.price - selectedProduct.purchasePrice) / selectedProduct.purchasePrice * 100).toFixed(0)}%`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="rounded-xl bg-slate-100 hover:bg-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-slate-200/80 bg-white px-4 py-5 text-center text-xs text-slate-400">
        <div className="mx-auto max-w-7xl font-medium">
          Secure Pharmacy Admin Management Console. Designed with medical shop productivity in mind.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
