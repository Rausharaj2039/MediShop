import { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../context/ToastContext';

const UsersPage = () => {
  const { showToast } = useToast();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Password reset modal states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // Delete User Confirmation states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Password visibility toggle states
  const [visiblePasswords, setVisiblePasswords] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/auth/users');
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error fetching users directory:', err);
      setError(err.response?.data?.message || 'Failed to load user accounts list.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const cleanSearch = search.trim().toLowerCase();
    if (!cleanSearch) return true;
    return (
      u.name.toLowerCase().includes(cleanSearch) ||
      u.email.toLowerCase().includes(cleanSearch)
    );
  });

  const totalUsersCount = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const regularCount = users.filter(u => u.role === 'user').length;

  const togglePasswordVisibility = (userId) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setPasswordError(null);
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setSelectedUser(null);
    setNewPassword('');
    setPasswordError(null);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.trim().length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setPasswordSubmitting(true);
      setPasswordError(null);

      await api.put(`/auth/users/${selectedUser.id}/password`, {
        newPassword: newPassword.trim()
      });

      showToast(`Successfully updated password for "${selectedUser.name}"!`, 'success');
      closePasswordModal();
      fetchUsers(); // Refresh
    } catch (err) {
      console.error('Error updating user password:', err);
      setPasswordError(err.response?.data?.message || 'Failed to update user password.');
      showToast('Failed to update password.', 'error');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteSubmit = async () => {
    try {
      setDeleteSubmitting(true);
      await api.delete(`/auth/users/${userToDelete.id}`);
      showToast(`Account for user "${userToDelete.name}" was successfully deleted.`, 'success');
      closeDeleteModal();
      fetchUsers(); // Refresh list and counts
    } catch (err) {
      console.error('Error deleting user account:', err);
      showToast(err.response?.data?.message || 'Failed to delete user account.', 'error');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Header Info Panel */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
          Admin Console
        </p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-850">Users Accounts Directory</h2>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          View details of all registered users, monitor their separated database files, and manage account credentials.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-white p-4 text-rose-600 text-xs shadow-sm font-semibold">
          {error}
        </div>
      )}

      {/* Stats KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Accounts</span>
          <p className="mt-2 text-3xl font-black text-slate-800">{totalUsersCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-emerald-600">Admin Accounts</span>
          <p className="mt-2 text-3xl font-black text-emerald-600">{adminCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-blue-600">Regular Users</span>
          <p className="mt-2 text-3xl font-black text-blue-600">{regularCount}</p>
        </div>
      </div>

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
            placeholder="Search by Name or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Users Directory Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-white">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-100 border-t-emerald-500"></div>
            <p className="text-xs text-slate-400 font-bold">Loading User Details...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white flex flex-col items-center justify-center">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-3 border border-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 20a11.385 11.385 0 01-4.912-.763v-.109m0 0a3 3 0 00-5.377-1.802 9.047 9.047 0 00-1.088 7.923M15 10a3 3 0 11-6 0 3 3 0 016 0zm6-3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5-3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-700">No User Accounts Found</p>
            <p className="text-[10px] text-slate-400 mt-1">There are no user accounts matching "{search}" or registrations list is empty.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-655">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3">Account Owner</th>
                  <th className="px-6 py-3">Email Address</th>
                  <th className="px-6 py-3 text-center">Account Role</th>
                  <th className="px-6 py-3">Password (Hash)</th>
                  <th className="px-6 py-3 text-center">Joined On</th>
                  <th className="px-6 py-3 text-center">Database Stats</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const showPass = visiblePasswords[user.id];
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/40 transition">
                      <td className="px-6 py-4 font-bold text-slate-800 text-sm">{user.name}</td>
                      <td className="px-6 py-4 text-slate-550 font-medium font-mono">{user.email}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                          user.role === 'admin' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-slate-500 max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="truncate flex-grow font-semibold">
                            {showPass ? user.password : '••••••••••••••••••••••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="text-slate-400 hover:text-slate-600 transition"
                            title={showPass ? 'Hide Password Hash' : 'Reveal Password Hash'}
                          >
                            {showPass ? (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-400 font-medium">
                        {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 font-bold rounded-lg border text-[10px] ${
                          user.productCount > 0 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-slate-100 text-slate-500 border-slate-200/50'
                        }`}>
                          {user.productCount} medicines saved
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openPasswordModal(user)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:text-emerald-600 px-3 py-1.5 text-[10px] font-bold text-slate-700 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-3.5 w-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                            Password
                          </button>
                          
                          {user.role !== 'admin' && (
                            <button
                              type="button"
                              onClick={() => openDeleteModal(user)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-100 bg-white hover:bg-rose-50 hover:text-rose-600 px-3 py-1.5 text-[10px] font-bold text-rose-500 transition"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-3.5 w-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Change Password Modal Overlay */}
      {isPasswordModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                  Manage Access
                </p>
                <h3 className="text-base font-bold text-slate-800 mt-1">
                  Change Password for {selectedUser.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={closePasswordModal}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
              {passwordError && (
                <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-[11px] text-rose-600 font-semibold">
                  {passwordError}
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  New Password *
                </label>
                <input
                  type="password"
                  placeholder="Enter new plain-text password..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordSubmitting}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-450 px-4 py-2.5 text-xs font-bold text-slate-955 shadow-md transition disabled:opacity-50"
                >
                  {passwordSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Account Confirmation Dialog */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center">
            
            {/* Warning Trash Icon Indicator */}
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-rose-50 text-rose-500 border border-rose-100 mb-4 animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            <h3 className="text-base font-bold text-slate-800">Delete User Account</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed font-semibold">
              Are you sure you want to delete the account for <strong className="text-slate-700">"{userToDelete.name}"</strong>? 
              <span className="block mt-1 text-rose-600">This will permanently destroy their registration and delete their isolated SQLite database.</span>
            </p>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteSubmitting}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={deleteSubmitting}
                className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition disabled:opacity-50"
              >
                {deleteSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default UsersPage;
