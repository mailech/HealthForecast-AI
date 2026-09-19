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
      updateUser(response.data);
      setEditing(false);
      setSaved(true);
      setError('');
      setTimeout(() => setSaved(false), 3000);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <DashboardLayout>
      <Breadcrumb items={[{ label: 'Profile' }]} />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">My Profile</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Manage your personal credentials and healthcare role.</p>
        </div>
        {saved && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-4 py-2 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-700"
          >
            <FiCheckCircle size={15} /> Profile updated successfully
          </motion.div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div>
          <UserProfileCard user={user} />
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Personal Information</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-2 text-xs py-2 px-3">
                <FiEdit2 size={13} /> Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  disabled={!editing}
                  className={`input-field text-sm ${!editing ? 'bg-zinc-50 dark:bg-zinc-800/50 cursor-not-allowed text-zinc-500' : ''}`}
                  {...register('full_name', { required: 'Name is required' })}
                />
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  disabled
                  className="input-field text-sm bg-zinc-50 dark:bg-zinc-800/50 cursor-not-allowed text-zinc-500"
                  {...register('email')}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-1.5">Department</label>
                <input
                  type="text"
                  disabled={!editing}
                  className={`input-field text-sm ${!editing ? 'bg-zinc-50 dark:bg-zinc-800/50 cursor-not-allowed text-zinc-500' : ''}`}
                  {...register('department')}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  disabled={!editing}
                  placeholder="+1 555-0000"
                  className={`input-field text-sm ${!editing ? 'bg-zinc-50 dark:bg-zinc-800/50 cursor-not-allowed text-zinc-500' : ''}`}
                  {...register('phone')}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-1.5">Role</label>
                <input
                  type="text"
                  disabled
                  className="input-field text-sm bg-zinc-50 dark:bg-zinc-800/50 cursor-not-allowed capitalize text-zinc-500"
                  value={user?.role?.replace('_', ' ')}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-1.5">Join Date</label>
                <input
                  type="text"
                  disabled
                  className="input-field text-sm bg-zinc-50 dark:bg-zinc-800/50 cursor-not-allowed text-zinc-500"
                  value={user?.joinDate || 'N/A'}
                  readOnly
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl mt-4 border border-red-200">{error}</p>}

            {editing && (
              <div className="flex gap-3 mt-6">
                <button type="submit" className="btn-primary flex items-center gap-2 text-xs py-2.5 px-4 font-bold uppercase tracking-wider">
                  <FiSave size={14} /> Save Changes
                </button>
                <button type="button" onClick={() => setEditing(false)} className="btn-secondary text-xs py-2.5 px-4 font-bold uppercase tracking-wider">
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
