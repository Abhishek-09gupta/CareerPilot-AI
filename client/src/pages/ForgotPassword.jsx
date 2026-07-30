import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { GraduationCap, Mail, Lock, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [step, setStep] = useState(1); // 1: Email, 2: Verification & Reset
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [demoOtp, setDemoOtp] = useState(''); // Store demo OTP so user doesn't have to look up logs

  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data = await api.forgotPassword(email);
      if (data.success) {
        setSuccessMsg(data.message);
        if (data.otp) {
          setDemoOtp(data.otp);
        }
        setStep(2);
      } else {
        setErrorMsg(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const data = await api.resetPassword({ email, otp, newPassword });
      if (data.success) {
        setSuccessMsg('Password reset successfully! Redirecting...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setErrorMsg(data.message || 'Reset failed');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="glass-panel animate-fade-in">
        <div style={styles.header}>
          <GraduationCap size={44} color="#8b5cf6" />
          <h2 style={styles.title}>Reset Password</h2>
          <p style={styles.subtitle}>
            {step === 1 
              ? 'Enter your registered email to request an OTP code.' 
              : 'Enter the code and specify your new password.'
            }
          </p>
        </div>

        {errorMsg && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={styles.successAlert}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {demoOtp && step === 2 && (
          <div style={styles.demoOtpAlert}>
            <strong>🔑 Demo Mode OTP: </strong>
            <span style={{ fontFamily: 'monospace', letterSpacing: '2px', fontSize: '1.1rem', color: '#06b6d4' }}>
              {demoOtp}
            </span>
            <p style={{ fontSize: '0.75rem', marginTop: '5px', color: '#9ca3af' }}>
              (Printed here to avoid having to review backend terminal logs!)
            </p>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} style={styles.form}>
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

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Get OTP Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndReset} style={styles.form}>
            <div className="form-group">
              <label className="form-label">6-Digit OTP Code</label>
              <div style={styles.inputWrapper}>
                <ShieldCheck size={18} style={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  className="form-input"
                  style={styles.inputWithIcon}
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} style={styles.inputIcon} />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  className="form-input"
                  style={styles.inputWithIcon}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Verify & Set Password'}
            </button>
          </form>
        )}

        <p style={styles.footerText}>
          Remembered your password? <Link to="/login" style={styles.link}>Back to Login</Link>
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
    marginBottom: '20px',
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
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '12px',
    borderRadius: '10px',
    color: '#10b981',
    fontSize: '0.85rem',
    textAlign: 'left',
    marginBottom: '20px',
  },
  demoOtpAlert: {
    background: 'rgba(6, 182, 212, 0.08)',
    border: '1px dashed rgba(6, 182, 212, 0.3)',
    padding: '12px',
    borderRadius: '10px',
    color: '#fff',
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

export default ForgotPassword;
