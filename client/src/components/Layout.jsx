import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Award, 
  Code, 
  FileText, 
  MessageSquareCode, 
  Building, 
  BarChart3, 
  ShieldAlert, 
  LogOut,
  User,
  GraduationCap
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Aptitude Practice', path: '/aptitude', icon: Award },
    { name: 'Coding Arena', path: '/coding', icon: Code },
    { name: 'Resume Analyzer', path: '/resume', icon: FileText },
    { name: 'AI Mock Interview', path: '/interview', icon: MessageSquareCode },
    { name: 'Company Guides', path: '/company', icon: Building },
    { name: 'Performance Analytics', path: '/analytics', icon: BarChart3 },
  ];

  // Add Admin Panel link if user is admin
  if (user && user.role === 'admin') {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: ShieldAlert });
  }

  return (
    <div style={styles.layoutContainer}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logoSection}>
          <GraduationCap size={32} color="#8b5cf6" />
          <div>
            <h1 style={styles.logoTitle}>CareerPilot <span style={styles.logoAccent}>AI</span></h1>
            <p style={styles.logoSubtitle}>Placement Portal</p>
          </div>
        </div>

        <nav style={styles.navigation}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.name} 
                to={item.path} 
                style={{
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {})
                }}
              >
                <Icon size={20} color={isActive ? '#8b5cf6' : '#9ca3af'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={handleLogout} style={styles.logoutButton}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={styles.mainWrapper}>
        {/* Top Navbar */}
        <header style={styles.navbar}>
          <div style={styles.welcomeText}>
            <h2>Hello, {user ? user.name : 'Learner'} 👋</h2>
            <p style={styles.subtext}>Prepare smart. Get placed.</p>
          </div>

          <div style={styles.profileSection}>
            <div style={styles.profileDetails}>
              <span style={styles.profileName}>{user ? user.name : ''}</span>
              <span style={styles.profileRole}>
                {user ? `${user.branch || 'CSE'} ${user.year ? `${user.year} Yr` : ''}` : 'Student'}
              </span>
            </div>
            <div style={styles.avatar}>
              {user && user.profileImage ? (
                <img src={user.profileImage} alt="Profile" style={styles.avatarImg} />
              ) : (
                <User size={20} color="#8b5cf6" />
              )}
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main style={styles.viewport}>
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const styles = {
  layoutContainer: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0b0f19',
  },
  sidebar: {
    width: '260px',
    background: 'rgba(17, 24, 39, 0.8)',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 100,
  },
  logoSection: {
    padding: '24px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  logoTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.02em',
  },
  logoAccent: {
    color: '#8b5cf6',
  },
  logoSubtitle: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '-2px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  navigation: {
    padding: '20px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    overflowY: 'auto',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    color: '#9ca3af',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  navLinkActive: {
    background: 'rgba(139, 92, 246, 0.1)',
    color: '#fff',
    fontWeight: '600',
    borderLeft: '3px solid #8b5cf6',
    borderRadius: '0 10px 10px 0',
    paddingLeft: '13px',
  },
  sidebarFooter: {
    padding: '20px 16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  },
  logoutButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  mainWrapper: {
    flex: 1,
    marginLeft: '260px',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  navbar: {
    height: '70px',
    background: 'rgba(11, 15, 25, 0.7)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 30px',
    position: 'sticky',
    top: 0,
    zIndex: 99,
  },
  welcomeText: {
    display: 'flex',
    flexDirection: 'column',
  },
  subtext: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    marginTop: '2px',
  },
  profileSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  profileDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  profileName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#fff',
  },
  profileRole: {
    fontSize: '0.75rem',
    color: '#9ca3af',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'rgba(139, 92, 246, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  viewport: {
    padding: '30px',
    flex: 1,
  },
};

export default Layout;
