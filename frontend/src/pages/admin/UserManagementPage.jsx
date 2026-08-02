import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatsCard } from '../../components/common/StatsCard';
import { Badge } from '../../components/common/Badge';
import { userService } from '../../services/userService';
import {
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  UserPlus,
  Search,
  Filter,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  Building2,
  Stethoscope
} from 'lucide-react';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [newUserForm, setNewUserForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'system_admin',
    hospital_name: 'Metro General Hospital',
    department: 'Administration'
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateUser(userId, { role: newRole });
      loadUsers();
    } catch (err) {
      alert("Failed to update user role.");
    }
  };

  const handleDeactivate = async (userId) => {
    if (window.confirm("Are you sure you want to deactivate this account?")) {
      try {
        await userService.deactivateUser(userId);
        loadUsers();
      } catch (err) {
        alert(err.response?.data?.detail || "Failed to deactivate user.");
      }
    }
  };

  const handleActivate = async (userId) => {
    try {
      await userService.activateUser(userId);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to activate user.");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      await userService.createUser(newUserForm);
      setIsModalOpen(false);
      loadUsers();
      setNewUserForm({
        full_name: '',
        email: '',
        password: '',
        role: 'system_admin',
        hospital_name: 'Metro General Hospital',
        department: 'Administration'
      });
    } catch (err) {
      setFormError(err.response?.data?.detail || "Failed to create new user account.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.hospital_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'All' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const activeCount = users.filter(u => u.is_active).length;
  const doctorCount = users.filter(u => u.role === 'doctor').length;
  const adminCount = users.filter(u => u.role === 'hospital_admin' || u.role === 'system_admin').length;

  return (
    <DashboardLayout title="User Account Registry & Access Control (RBAC)">
      {/* Top User Management KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <StatsCard
          title="Total User Accounts"
          value={users.length}
          subtitle="Registered platform accounts"
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Active Accounts"
          value={activeCount}
          subtitle="Accounts with active access"
          icon={UserCheck}
          color="green"
        />
        <StatsCard
          title="Clinical Doctors"
          value={doctorCount}
          subtitle="Physicians & specialists"
          icon={Stethoscope}
          color="purple"
        />
        <StatsCard
          title="System & Hospital Admins"
          value={adminCount}
          subtitle="Administrative users"
          icon={ShieldCheck}
          color="amber"
        />
      </div>

      {/* User Management Card & Actions */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              User Account Permissions & Role Matrix
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Create admins/users, assign RBAC roles, activate or deactivate accounts
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Create New Admin / User Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
              style={{ gap: '0.5rem', fontSize: '0.8125rem' }}
            >
              <UserPlus size={16} />
              <span>+ Create New Admin / User</span>
            </button>

            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, hospital..."
                className="form-control"
                style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem', minWidth: '200px' }}
              />
            </div>

            {/* Role Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Filter size={14} style={{ color: 'var(--text-muted)' }} />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="form-control"
                style={{ fontSize: '0.8125rem', padding: '0.375rem 0.65rem' }}
              >
                <option value="All">All Roles</option>
                <option value="doctor">Doctors</option>
                <option value="hospital_admin">Hospital Admins</option>
                <option value="researcher">Researchers</option>
                <option value="system_admin">System Admins</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem' }}>Full Name</th>
                <th style={{ padding: '0.75rem' }}>Email Address</th>
                <th style={{ padding: '0.75rem' }}>Hospital / Department</th>
                <th style={{ padding: '0.75rem' }}>Assigned RBAC Role</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No matching user accounts found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>{u.full_name}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem' }}>{u.hospital_name} ({u.department || 'N/A'})</td>
                    <td style={{ padding: '0.75rem' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="form-control"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 'auto', fontWeight: '500' }}
                      >
                        <option value="doctor">Doctor</option>
                        <option value="hospital_admin">Hospital Admin</option>
                        <option value="researcher">Healthcare Researcher</option>
                        <option value="system_admin">System Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <Badge variant={u.is_active ? 'success' : 'danger'}>
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      {u.is_active ? (
                        <button
                          onClick={() => handleDeactivate(u.id)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem', color: 'var(--danger-700)', gap: '0.35rem' }}
                        >
                          <UserX size={14} /> Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(u.id)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem', color: 'var(--success-700)', borderColor: 'var(--success-200)', backgroundColor: 'var(--success-50)', gap: '0.35rem' }}
                        >
                          <CheckCircle2 size={14} /> Activate Account
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating New Admin / User */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="card modal-card" style={{ width: '100%', maxWidth: '520px', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={22} style={{ color: 'var(--primary-600)' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Create New Admin / User Account
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--danger-50)', color: 'var(--danger-700)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUserSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={newUserForm.full_name}
                    onChange={handleFormChange}
                    placeholder="e.g. Dr. Alex Morgan"
                    className="form-control"
                  />
                </div>

                <div>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={newUserForm.email}
                    onChange={handleFormChange}
                    placeholder="e.g. alex.morgan@healthforecast.ai"
                    className="form-control"
                  />
                </div>

                <div>
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={newUserForm.password}
                    onChange={handleFormChange}
                    placeholder="Enter account password"
                    className="form-control"
                  />
                </div>

                <div>
                  <label className="form-label">Assign System / Access Role *</label>
                  <select
                    name="role"
                    value={newUserForm.role}
                    onChange={handleFormChange}
                    className="form-control"
                  >
                    <option value="system_admin">System Admin</option>
                    <option value="hospital_admin">Hospital Admin</option>
                    <option value="doctor">Doctor</option>
                    <option value="researcher">Healthcare Researcher</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Hospital Name</label>
                    <input
                      type="text"
                      name="hospital_name"
                      value={newUserForm.hospital_name}
                      onChange={handleFormChange}
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={newUserForm.department}
                      onChange={handleFormChange}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserManagementPage;
