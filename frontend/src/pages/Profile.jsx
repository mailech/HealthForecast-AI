import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiSave, FiEdit2, FiCheckCircle } from 'react-icons/fi';
import DashboardLayout from '../layouts/DashboardLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import UserProfileCard from '../components/common/UserProfileCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: user });
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    try {
      const response = await api.put('/auth/me', { full_name: data.full_name, phone: data.phone });
      updateUser(response.data); setEditing(false); setSaved(true); setError(''); setTimeout(() => setSaved(false), 3000);
    } catch (requestError) { setError(requestError.message); }
  };

  return (
    <DashboardLayout>
      <Breadcrumb items={[{ label: 'Profile' }]} />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your personal information</p>
        </div>
        {saved && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl text-sm font-medium border border-green-200 dark:border-green-800">
            <FiCheckCircle size={16} /> Profile updated!
          </motion.div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div>
          <UserProfileCard user={user} />
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Personal Information</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-2 text-sm py-2">
                <FiEdit2 size={14} /> Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input type="text" disabled={!editing} className={`input-field ${!editing ? 'bg-slate-50 dark:bg-slate-700/50 cursor-not-allowed' : ''}`}
                  {...register('full_name', { required: 'Name is required' })} />
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <input type="email" disabled className="input-field bg-slate-50 dark:bg-slate-700/50 cursor-not-allowed"
                  {...register('email')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Department</label>
                <input type="text" disabled={!editing} className={`input-field ${!editing ? 'bg-slate-50 dark:bg-slate-700/50 cursor-not-allowed' : ''}`}
                  {...register('department')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                <input type="text" disabled={!editing} placeholder="+1 555-0000" className={`input-field ${!editing ? 'bg-slate-50 dark:bg-slate-700/50 cursor-not-allowed' : ''}`}
                  {...register('phone')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
                <input type="text" disabled className="input-field bg-slate-50 dark:bg-slate-700/50 cursor-not-allowed capitalize"
                  value={user?.role?.replace('_', ' ')} readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Join Date</label>
                <input type="text" disabled className="input-field bg-slate-50 dark:bg-slate-700/50 cursor-not-allowed"
                  value={user?.joinDate || 'N/A'} readOnly />
              </div>
            </div>

            {editing && (
              <div className="flex gap-3 mt-6">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <FiSave size={16} /> Save Changes
                </button>
                <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            )}
          </form>
          {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}
