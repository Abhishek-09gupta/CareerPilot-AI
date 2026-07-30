import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    setLoadingLocal(true);
    setErrorMsg('');

    try {
      const res = await login({ email, password });
      if (res.success) {
        navigate('/');
      } else {
        setErrorMsg(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setErrorMsg('Network error. Is the server running?');
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="glass-panel animate-fade-in">
        <div style={styles.header}>
          <GraduationCap size={44} color="#8b5cf6" />
          <h2 style={styles.title}>Welcome back to <span className="gradient-text">CareerPilot</span></h2>
          <p style={styles.subtitle}>Log in to continue your placement preparation</p>
        </div>

        {errorMsg && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                type="email"
                placeholder="you@college.edu"
                className="form-input"
                style={styles.inputWithIcon}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={styles.labelRow}>
              <label className="form-label">Password</label>
              <Link to="/forgot-password" style={styles.forgotLink}>Forgot?</Link>
            </div>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type="password"
                placeholder="••••••••"
                className="form-input"
                style={styles.inputWithIcon}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={styles.submitBtn}
            disabled={loadingLocal}
          >
            {loadingLocal ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footerText}>
          New to CareerPilot? <Link to="/register" style={styles.link}>Create an account</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#0b0f19',
    backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.05), transparent 60%)',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '40px 30px',
    borderRadius: '20px',
    textAlign: 'center',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: '700',
    marginTop: '15px',
    color: '#fff',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    marginTop: '6px',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    padding: '12px',
    borderRadius: '10px',
    color: '#ef4444',
    fontSize: '0.85rem',
    textAlign: 'left',
    marginBottom: '20px',
  },
  form: {
    textAlign: 'left',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#6b7280',
  },
  inputWithIcon: {
    paddingLeft: '44px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotLink: {
    fontSize: '0.8rem',
    color: '#8b5cf6',
    fontWeight: '600',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    fontSize: '1rem',
    marginTop: '10px',
  },
  footerText: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    marginTop: '24px',
  },
  link: {
    color: '#8b5cf6',
    fontWeight: '600',
  },
};

export default Login;
