import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, Mail, User, BookOpen, School, AlertCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    branch: '',
    year: '4th', // Default to final/pre-final year
  });
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setErrorMsg('Name, Email and Password are required');
      return;
    }

    setLoadingLocal(true);
    setErrorMsg('');

    try {
      const res = await register(formData);
      if (res.success) {
        navigate('/');
      } else {
        setErrorMsg(res.message || 'Registration failed');
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
          <h2 style={styles.title}>Join <span className="gradient-text">CareerPilot</span></h2>
          <p style={styles.subtitle}>Create your student profile and start preparing</p>
        </div>

        {errorMsg && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                className="form-input"
                style={styles.inputWithIcon}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                type="email"
                name="email"
                placeholder="john@college.edu"
                className="form-input"
                style={styles.inputWithIcon}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="form-input"
                style={styles.inputWithIcon}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">College</label>
              <div style={styles.inputWrapper}>
                <School size={18} style={styles.inputIcon} />
                <input
                  type="text"
                  name="college"
                  placeholder="IIT / NIT / LPU..."
                  className="form-input"
                  style={styles.inputWithIcon}
                  value={formData.college}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group" style={{ width: '120px' }}>
              <label className="form-label">Grad Year</label>
              <select
                name="year"
                className="form-input"
                style={{ paddingRight: '10px' }}
                value={formData.year}
                onChange={handleChange}
              >
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Branch</label>
            <div style={styles.inputWrapper}>
              <BookOpen size={18} style={styles.inputIcon} />
              <input
                type="text"
                name="branch"
                placeholder="Computer Science, ECE, IT..."
                className="form-input"
                style={styles.inputWithIcon}
                value={formData.branch}
                onChange={handleChange}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={styles.submitBtn}
            disabled={loadingLocal}
          >
            {loadingLocal ? 'Creating Profile...' : 'Sign Up'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account? <Link to="/login" style={styles.link}>Sign in instead</Link>
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
    padding: '20px 0',
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    padding: '30px',
    borderRadius: '20px',
    textAlign: 'center',
    margin: '20px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginTop: '10px',
    color: '#fff',
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    marginTop: '4px',
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
    marginBottom: '15px',
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
  row: {
    display: 'flex',
    gap: '15px',
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
    marginTop: '20px',
  },
  link: {
    color: '#8b5cf6',
    fontWeight: '600',
  },
};

export default Register;
