import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaHeartbeat, FaEnvelope, FaLock, FaSpinner, FaArrowLeft, FaUserMd, FaHospital, FaDatabase, FaUsersCog } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import './Login.css';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  // Extract selected role parameter
  const selectedRole = searchParams.get('role') || 'doctor';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm();

  // If already logged in, redirect to correct dashboard
  useEffect(() => {
    if (user) {
      redirectUser(user.role);
    }
  }, [user]);

  // Check if redirect query exists (e.g. token expired)
  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      toast.error('Session expired. Please log in again.');
    }
  }, [searchParams]);

  const redirectUser = (role) => {
    switch (role) {
      case 'doctor':
        navigate('/doctor-dashboard');
        break;
      case 'hospital_admin':
        navigate('/admin-dashboard');
        break;
      case 'researcher':
        navigate('/researcher-dashboard');
        break;
      case 'system_admin':
        navigate('/sysadmin-dashboard');
        break;
      default:
        navigate('/unauthorized');
        break;
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const loggedUser = await login(data.email, data.password);
      
      // Enforce selected role matching
      if (loggedUser.role !== selectedRole) {
        toast.error(`Access Denied: This account is registered as a ${loggedUser.role.replace('_', ' ')}, not a ${selectedRole.replace('_', ' ')}.`);
        setLoading(false);
        return;
      }

      toast.success(`Welcome back, ${loggedUser.name}!`);
      redirectUser(loggedUser.role);
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill logins
  const handleQuickFill = (email) => {
    setValue('email', email);
    setValue('password', 'password123');
  };

  // Role customization mappings
  const getRoleDetails = () => {
    switch (selectedRole) {
      case 'hospital_admin':
        return {
          title: 'Administrative Sign In',
          subtitle: 'Welcome to the Hospital Operations Center',
          icon: <FaHospital />,
          email: 'admin@healthforecast.com',
          roleLabel: 'Hospital Administrator'
        };
      case 'researcher':
        return {
          title: 'Research Portal Sign In',
          subtitle: 'Welcome to the Population Research Hub',
          icon: <FaDatabase />,
          email: 'researcher@healthforecast.com',
          roleLabel: 'Healthcare Researcher'
        };
      case 'system_admin':
        return {
          title: 'System Operations Sign In',
          subtitle: 'Welcome to the IT and MLOps Control Console',
          icon: <FaUsersCog />,
          email: 'sysadmin@healthforecast.com',
          roleLabel: 'System Administrator'
        };
      default:
        return {
          title: 'Clinical Specialist Sign In',
          subtitle: 'Welcome to the Medical Operations Portal',
          icon: <FaUserMd />,
          email: 'doctor@healthforecast.com',
          roleLabel: 'Doctor / Medical Staff'
        };
    }
  };

  const details = getRoleDetails();

  return (
    <div className="login-container">
      <motion.div 
        className="login-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Link to="/" className="flex-center" style={{ 
          alignSelf: 'flex-start', 
          gap: '0.4rem', 
          fontSize: '0.85rem', 
          color: 'var(--text-secondary)',
          marginBottom: '1.5rem',
          justifyContent: 'flex-start',
          width: 'fit-content'
        }}>
          <FaArrowLeft />
          <span>Change Role</span>
        </Link>

        <div className="login-header">
          <div className="flex-center" style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '12px', 
            background: 'var(--primary-light)', 
            color: 'var(--primary)',
            fontSize: '1.75rem',
            margin: '0 auto 1rem'
          }}>
            {details.icon}
          </div>
          <h1 className="login-title">{details.title}</h1>
          <p className="login-subtitle">{details.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <FaEnvelope style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                id="email"
                type="email"
                className="form-control"
                style={{ paddingLeft: '36px' }}
                placeholder={details.email}
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
            </div>
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                id="password"
                type="password"
                className="form-control"
                style={{ paddingLeft: '36px' }}
                placeholder="••••••••"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
            </div>
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', height: '44px' }} disabled={loading}>
            {loading ? <FaSpinner className="spin" style={{ animation: 'spin 1s linear infinite' }} /> : 'Sign In'}
          </button>
        </form>

        <div className="quick-fill-section">
          <span className="quick-fill-label">Quick Sign In Pre-fill</span>
          <button className="quick-fill-btn" style={{ width: '100%', alignItems: 'center' }} onClick={() => handleQuickFill(details.email)}>
            <span className="quick-fill-role">Login as {details.roleLabel}</span>
            <span className="quick-fill-email">{details.email}</span>
          </button>
        </div>
      </motion.div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
