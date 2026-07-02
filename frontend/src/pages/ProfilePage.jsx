import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { admin } = useAuth();

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">Profile</p>
      <h2 className="mt-2 text-3xl font-bold text-white">Admin account</h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm text-slate-400">Name</p>
          <p className="mt-2 text-lg font-semibold text-white">{admin?.name}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm text-slate-400">Email</p>
          <p className="mt-2 text-lg font-semibold text-white">{admin?.email}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm text-slate-400">Role</p>
          <p className="mt-2 text-lg font-semibold capitalize text-white">{admin?.role}</p>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
