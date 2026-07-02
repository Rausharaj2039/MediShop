import { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../context/ToastContext';

const ProductsPage = () => {
  const { showToast } = useToast();
  
  // Products listing states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Pagination states
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Add / Edit Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null); // null = Add, number = Edit
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    batchNumber: '',
    stock: '0',
    purchasePrice: '',
    price: '',
    expiryDate: '',
    category: 'Tablet',
    description: '',
  });
  const [formError, setFormError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Custom Delete Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/products');
      setProducts(response.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch medicines catalog. Check if server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Client-side search and pagination calculations
  const filteredProducts = products
    .filter((p) => {
      const cleanSearch = search.trim().toLowerCase();
      if (!cleanSearch) return true;
      return (
        p.name.toLowerCase().includes(cleanSearch) ||
        (p.company && p.company.toLowerCase().includes(cleanSearch)) ||
        (p.batchNumber && p.batchNumber.toLowerCase().includes(cleanSearch))
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const itemsPerPage = 6;
  const computedTotalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, computedTotalPages);

  const visibleProducts = filteredProducts.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to page 1 on new search
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const openAddModal = () => {
    setEditId(null);
    setFormData({
      name: '',
      company: '',
      batchNumber: '',
      stock: '0',
      purchasePrice: '',
      price: '',
      expiryDate: '',
      category: 'Tablet',
      description: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditId(product.id);
    setFormData({
      name: product.name || '',
      company: product.company || '',
      batchNumber: product.batchNumber || '',
      stock: (product.stock !== undefined && product.stock !== null) ? product.stock.toString() : '',
      purchasePrice: (product.purchasePrice !== undefined && product.purchasePrice !== null) ? product.purchasePrice.toString() : '',
      price: (product.price !== undefined && product.price !== null) ? product.price.toString() : '',
      expiryDate: product.expiryDate || '',
      category: product.category || 'Tablet',
      description: product.description || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Front-end validations
    if (!formData.name || !formData.name.trim()) {
      setFormError('Medicine Name is required.');
      return;
    }
    if (!formData.category) {
      setFormError('Category is required.');
      return;
    }

    const parsedPrice = parseFloat(formData.price);
    const parsedStock = formData.stock !== '' ? parseInt(formData.stock, 10) : 0;

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError('Selling price must be a positive number.');
      return;
    }
    if (isNaN(parsedStock) || parsedStock < 0) {
      setFormError('Quantity/Stock must be an integer greater than or equal to 0.');
      return;
    }

    let parsedPurchasePrice = null;
    if (formData.purchasePrice !== '' && formData.purchasePrice !== null && formData.purchasePrice !== undefined) {
      parsedPurchasePrice = parseFloat(formData.purchasePrice);
      if (isNaN(parsedPurchasePrice) || parsedPurchasePrice <= 0) {
        setFormError('Purchase price must be a positive number.');
        return;
      }
      if (parsedPurchasePrice > parsedPrice) {
        setFormError('Purchase price cannot exceed the selling price.');
        return;
      }
    }

    try {
      setFormSubmitting(true);
      
      const payload = {
        name: formData.name.trim(),
        company: formData.company && formData.company.trim() ? formData.company.trim() : null,
        batchNumber: formData.batchNumber && formData.batchNumber.trim() ? formData.batchNumber.trim() : null,
        stock: parsedStock,
        purchasePrice: parsedPurchasePrice,
        price: parsedPrice,
        category: formData.category,
        expiryDate: formData.expiryDate || null,
        description: formData.description && formData.description.trim() ? formData.description.trim() : null,
        image: null,
      };

      if (editId === null) {
        // Add
        await api.post('/products', payload);
        showToast('Medicine added to inventory successfully.', 'success');
      } else {
        // Edit
        await api.put(`/products/${editId}`, payload);
        showToast('Medicine details updated successfully.', 'success');
      }
      
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      setFormError(err.response?.data?.message || 'Failed to save product details. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Trigger custom delete modal
  const openDeleteDialog = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/products/${productToDelete.id}`);
      showToast(`Medicine "${productToDelete.name}" removed from catalog.`, 'success');
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      showToast(err.response?.data?.message || 'Failed to remove medicine. Please try again.', 'error');
    }
  };

  const calculateMarkup = (sell, buy) => {
    if (!buy || buy <= 0) return null;
    const diff = sell - buy;
    const pct = (diff / buy) * 100;
    return pct.toFixed(0);
  };

  const getExpiryStatus = (expiryStr) => {
    if (!expiryStr) return { text: 'No Expiry', color: 'text-slate-450 bg-slate-50 border-slate-200' };
    const expiry = new Date(expiryStr);
    const today = new Date();
    expiry.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: 'Expired', color: 'text-rose-600 bg-rose-50 border-rose-100' };
    } else if (diffDays <= 30) {
      return { text: 'Expiring Soon', color: 'text-rose-600 bg-rose-50 border-rose-100 font-semibold' };
    } else if (diffDays <= 90) {
      return { text: 'Warning Expiry', color: 'text-amber-600 bg-amber-50 border-amber-100' };
    }
    return { text: 'Safe Expiry', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
  };

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
            Catalog Management
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-850">Pharmacy Inventory</h2>
          <p className="mt-1 text-xs text-slate-500 font-medium">Add, search, edit, and paginate your sqlite inventory items.</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-450 px-5 py-3 text-xs font-bold text-slate-955 shadow-sm transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Add New Medicine
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-white p-4 text-rose-600 text-xs shadow-sm font-semibold">
          {error}
        </div>
      )}

      {/* Filter and Search Box Controls */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by Medicine, Company, or Batch Number..."
            value={search}
            onChange={handleSearchChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Table Display */}
      <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-white">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-100 border-t-emerald-500"></div>
            <p className="text-xs text-slate-400 font-bold">Fetching inventory details...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white flex flex-col items-center justify-center">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-3 border border-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-700">No Medicines Found</p>
            <p className="text-[10px] text-slate-400 mt-1">There are no records matching "{search}" or your catalog is empty.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-655">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3">Medicine Details</th>
                  <th className="px-6 py-3">Company Name</th>
                  <th className="px-6 py-3">Batch Number</th>
                  <th className="px-6 py-3 text-center">Stock Level</th>
                  <th className="px-6 py-3 text-right">Purchase Price</th>
                  <th className="px-6 py-3 text-right">Selling Price</th>
                  <th className="px-6 py-3 font-mono text-center">Expiry Date</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleProducts.map((product) => {
                  const markup = calculateMarkup(product.price, product.purchasePrice);
                  const expiryStatus = getExpiryStatus(product.expiryDate);
                  
                  return (
                    <tr key={product.id} className="hover:bg-slate-50/40 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{product.name.toUpperCase()}</p>
                          <span className="inline-block mt-1 text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                            {product.category || 'Tablet'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{product.company || ''}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500 font-semibold">{product.batchNumber || 'N/A'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 font-bold rounded-lg border text-[10px] ${
                          product.stock < 10 
                            ? 'bg-rose-50 text-rose-600 border-rose-100' 
                            : 'bg-slate-100 text-slate-500 border-slate-200/50'
                        }`}>
                          {product.stock} left
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-slate-500 font-semibold">
                        {product.purchasePrice ? `Rs. ${parseFloat(product.purchasePrice).toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right font-mono">
                        <div>
                          <p className="font-bold text-emerald-600">Rs. {parseFloat(product.price).toFixed(2)}</p>
                          {markup && (
                            <span className="text-[9px] font-bold text-blue-500">
                              +{markup}% markup
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-center text-slate-400 font-medium">
                        {product.expiryDate || 'No Expiry'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${expiryStatus.color}`}>
                          {expiryStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(product)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 transition"
                            title="Edit Medicine"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.83 20.013a4.5 4.5 0 01-1.897 1.13l-3.885 1.13 1.13-3.885a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteDialog(product)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Delete Medicine"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && filteredProducts.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-white">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Page {activePage} of {computedTotalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={activePage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition disabled:opacity-40"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: computedTotalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                      activePage === page
                        ? 'bg-emerald-500 text-slate-955 shadow'
                        : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={activePage === computedTotalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, computedTotalPages))}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* Title Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                  {editId === null ? 'Create Entry' : 'Update Record'}
                </p>
                <h3 className="text-lg font-bold text-slate-800 mt-1">
                  {editId === null ? 'Add New Medicine' : 'Edit Medicine Details'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error prompt */}
            {formError && (
              <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-semibold text-rose-600">
                {formError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4 text-slate-700">
              
              {/* Medicine Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Medicine Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Paracetamol 650mg"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white"
                  required
                />
              </div>

              {/* Company & Batch */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Company Name</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="e.g. Cipla Ltd."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Batch Number</label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. PARA102"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Category & Expiry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Drops">Drops</option>
                    <option value="Device">Device</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Purchase Price</label>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Selling Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Stock Qty *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="0"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2.5"
                  placeholder="Optional details, side effects, active formulas, etc."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-955 shadow-sm hover:bg-emerald-450 transition disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editId === null ? 'Save Medicine' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <h3 className="text-center text-base font-bold text-slate-850">Remove Medicine</h3>
            <p className="text-center text-xs text-slate-450 mt-2 leading-relaxed">
              Are you sure you want to delete <span className="font-extrabold text-slate-700">"{productToDelete?.name}"</span>? This action is permanent and cannot be undone.
            </p>
            
            <div className="flex gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setProductToDelete(null);
                }}
                className="flex-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2.5 text-xs font-bold text-slate-600 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 rounded-xl bg-rose-500 hover:bg-rose-600 py-2.5 text-xs font-bold text-white shadow-sm transition"
              >
                Delete Medicine
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductsPage;
