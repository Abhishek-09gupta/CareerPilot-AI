import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Users, 
  PlusCircle, 
  BarChart3, 
  Trash2, 
  Award, 
  Code, 
  Check, 
  RefreshCw 
} from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Database lists
  const [usersList, setUsersList] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Forms State
  const [aptForm, setAptForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '0',
    category: 'Quantitative Aptitude',
    difficulty: 'Easy',
    marks: 1
  });

  const [codingForm, setCodingForm] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    tags: '',
    sampleInput: '',
    sampleOutput: '',
    constraints: '',
    solution: ''
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'analytics') {
      fetchGlobalAnalytics();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminUsers();
      if (res.success) {
        setUsersList(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminAnalytics();
      if (res.success) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAptOptionChange = (idx, val) => {
    const updatedOptions = [...aptForm.options];
    updatedOptions[idx] = val;
    setAptForm({ ...aptForm, options: updatedOptions });
  };

  const handleAddAptitude = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await api.addAptitudeQuestion(aptForm);
      if (res.success) {
        setSuccessMessage('Aptitude question added successfully!');
        // Reset form
        setAptForm({
          question: '',
          options: ['', '', '', ''],
          correctAnswer: '0',
          category: 'Quantitative Aptitude',
          difficulty: 'Easy',
          marks: 1
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to add question');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddCoding = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    const formattedPayload = {
      ...codingForm,
      tags: codingForm.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    try {
      const res = await api.addCodingQuestion(formattedPayload);
      if (res.success) {
        setSuccessMessage('Coding question added successfully!');
        // Reset form
        setCodingForm({
          title: '',
          description: '',
          difficulty: 'Easy',
          tags: '',
          sampleInput: '',
          sampleOutput: '',
          constraints: '',
          solution: ''
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to add coding question');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.adminTitleRow}>
        <h2 style={{ color: '#fff', fontSize: '1.4rem' }}>Admin Control Center</h2>
        <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
          Secure Terminal
        </span>
      </div>

      <div style={styles.tabBar}>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'users' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} />
          <span>User Directory</span>
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'aptitude' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('aptitude')}
        >
          <PlusCircle size={16} />
          <span>Add Aptitude</span>
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'coding' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('coding')}
        >
          <PlusCircle size={16} />
          <span>Add Coding</span>
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'analytics' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={16} />
          <span>System Analytics</span>
        </button>
      </div>

      {successMessage && (
        <div style={styles.alertSuccess}>
          <Check size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={styles.alertError}>
          <span>⚠️ {errorMessage}</span>
        </div>
      )}

      {/* VIEWPORT LAYOUT */}
      <div className="glass-panel" style={styles.panelCard}>
        {loading ? (
          <div style={styles.loaderContainer}>
            <RefreshCw className="animate-spin" size={24} color="#8b5cf6" />
            <span style={{ marginLeft: '10px', color: '#9ca3af' }}>Syncing server records...</span>
          </div>
        ) : activeTab === 'users' ? (
          <div style={styles.userListContainer}>
            <h3 style={{ marginBottom: '15px', color: '#fff' }}>Registered Users ({usersList.length})</h3>
            <div style={styles.usersTable}>
              <div style={styles.tableHeader}>
                <div style={{ flex: 1.5 }}>Name / Email</div>
                <div style={{ flex: 1 }}>College</div>
                <div style={{ flex: 1 }}>Branch / Year</div>
                <div style={{ flex: 0.5 }}>Role</div>
              </div>
              
              {usersList.map((usr) => (
                <div key={usr._id} style={styles.tableRow}>
                  <div style={{ flex: 1.5 }}>
                    <div style={{ fontWeight: '600', color: '#fff' }}>{usr.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{usr.email}</div>
                  </div>
                  <div style={{ flex: 1, fontSize: '0.85rem', color: '#d1d5db' }}>{usr.college || 'N/A'}</div>
                  <div style={{ flex: 1, fontSize: '0.85rem', color: '#d1d5db' }}>
                    {usr.branch || 'N/A'} {usr.year ? `(${usr.year} Yr)` : ''}
                  </div>
                  <div style={{ flex: 0.5 }}>
                    <span style={{ 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontSize: '0.7rem', 
                      fontWeight: 'bold',
                      background: usr.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                      color: usr.role === 'admin' ? '#ef4444' : '#3b82f6'
                    }}>
                      {usr.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'aptitude' ? (
          <form onSubmit={handleAddAptitude} style={styles.form}>
            <h3 style={{ marginBottom: '20px', color: '#fff' }}>Create Aptitude Challenge</h3>
            
            <div className="form-group">
              <label className="form-label">Question Stem</label>
              <textarea
                className="form-input"
                style={{ height: '80px', resize: 'none' }}
                placeholder="Write the mathematical or logical problem statement..."
                value={aptForm.question}
                onChange={(e) => setAptForm({ ...aptForm, question: e.target.value })}
                required
              />
            </div>

            <div style={styles.formRow}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={aptForm.category}
                  onChange={(e) => setAptForm({ ...aptForm, category: e.target.value })}
                >
                  <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                  <option value="Logical Reasoning">Logical Reasoning</option>
                  <option value="Verbal Ability">Verbal Ability</option>
                </select>
              </div>

              <div className="form-group" style={{ width: '120px' }}>
                <label className="form-label">Difficulty</label>
                <select
                  className="form-input"
                  value={aptForm.difficulty}
                  onChange={(e) => setAptForm({ ...aptForm, difficulty: e.target.value })}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="form-group" style={{ width: '100px' }}>
                <label className="form-label">Marks</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max="10"
                  value={aptForm.marks}
                  onChange={(e) => setAptForm({ ...aptForm, marks: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div style={styles.optionsBlock}>
              <label className="form-label">Options Choices</label>
              <div style={styles.optionsGrid}>
                {aptForm.options.map((opt, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 'bold' }}>{idx + 1}</span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => handleAptOptionChange(idx, e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '20px', width: '200px' }}>
              <label className="form-label">Correct Option Index</label>
              <select
                className="form-input"
                value={aptForm.correctAnswer}
                onChange={(e) => setAptForm({ ...aptForm, correctAnswer: e.target.value })}
              >
                <option value="0">Option 1 (Index 0)</option>
                <option value="1">Option 2 (Index 1)</option>
                <option value="2">Option 3 (Index 2)</option>
                <option value="3">Option 4 (Index 3)</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: 'fit-content', marginTop: '20px' }}
              disabled={actionLoading}
            >
              {actionLoading ? 'Saving question...' : 'Insert Question'}
            </button>
          </form>
        ) : activeTab === 'coding' ? (
          <form onSubmit={handleAddCoding} style={styles.form}>
            <h3 style={{ marginBottom: '20px', color: '#fff' }}>Create Coding Challenge</h3>

            <div style={styles.formRow}>
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label">Challenge Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Find Prime Pairs"
                  value={codingForm.title}
                  onChange={(e) => setCodingForm({ ...codingForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Difficulty</label>
                <select
                  className="form-input"
                  value={codingForm.difficulty}
                  onChange={(e) => setCodingForm({ ...codingForm, difficulty: e.target.value })}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Problem Statement</label>
              <textarea
                className="form-input"
                style={{ height: '100px', resize: 'none' }}
                placeholder="Detail the programming question prompt..."
                value={codingForm.description}
                onChange={(e) => setCodingForm({ ...codingForm, description: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tags (comma-separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Array, Hash Table, Dynamic Programming"
                value={codingForm.tags}
                onChange={(e) => setCodingForm({ ...codingForm, tags: e.target.value })}
              />
            </div>

            <div style={styles.formRow}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Sample Input</label>
                <textarea
                  className="form-input"
                  style={{ height: '60px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                  placeholder="nums = [3, 1, 4], target = 8"
                  value={codingForm.sampleInput}
                  onChange={(e) => setCodingForm({ ...codingForm, sampleInput: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Sample Output</label>
                <textarea
                  className="form-input"
                  style={{ height: '60px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                  placeholder="[0, 2]"
                  value={codingForm.sampleOutput}
                  onChange={(e) => setCodingForm({ ...codingForm, sampleOutput: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Editorial solution (Reference template code)</label>
              <textarea
                className="form-input"
                style={{ height: '140px', fontFamily: 'monospace', fontSize: '0.85rem', resize: 'none' }}
                placeholder="function solve() { ... }"
                value={codingForm.solution}
                onChange={(e) => setCodingForm({ ...codingForm, solution: e.target.value })}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: 'fit-content' }}
              disabled={actionLoading}
            >
              {actionLoading ? 'Saving question...' : 'Insert Coding Challenge'}
            </button>
          </form>
        ) : (
          /* System Analytics Dashboard */
          analytics && (
            <div style={styles.analyticsContainer}>
              <h3 style={{ marginBottom: '25px', color: '#fff' }}>Global Portal Metrics</h3>
              
              <div style={styles.statsGrid}>
                <div style={styles.statBox}>
                  <span style={styles.statBoxLabel}>Total Students</span>
                  <span style={styles.statBoxValue}>{analytics.totalUsers}</span>
                </div>
                <div style={styles.statBox}>
                  <span style={styles.statBoxLabel}>Aptitude Bank</span>
                  <span style={styles.statBoxValue}>{analytics.totalAptitudeQuestions} Qs</span>
                </div>
                <div style={styles.statBox}>
                  <span style={styles.statBoxLabel}>Coding Library</span>
                  <span style={styles.statBoxValue}>{analytics.totalCodingQuestions} Qs</span>
                </div>
                <div style={styles.statBox}>
                  <span style={styles.statBoxLabel}>Quiz Attempts</span>
                  <span style={styles.statBoxValue}>{analytics.totalSubmissions} attempts</span>
                </div>
              </div>

              <div style={styles.breakdownCard} style={{ marginTop: '30px' }}>
                <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '15px' }}>Quiz Submission Volume by Module</h4>
                <div style={styles.progressTracker}>
                  <div style={styles.trackerRow}>
                    <span>Aptitude Quizzes: <strong>{analytics.testTypeBreakdown.aptitude}</strong></span>
                    <span>Coding Challenges: <strong>{analytics.testTypeBreakdown.coding}</strong></span>
                  </div>
                  <div style={styles.trackerRow}>
                    <span>Mock Interviews: <strong>{analytics.testTypeBreakdown.interview}</strong></span>
                    <span>Resumes Scored: <strong>{analytics.testTypeBreakdown.resume}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  adminTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabBar: {
    display: 'flex',
    gap: '10px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '10px',
    flexWrap: 'wrap',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    background: 'rgba(139, 92, 246, 0.15)',
    color: '#fff',
  },
  panelCard: {
    padding: '30px',
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 0',
  },
  // Alerts
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '12px 20px',
    borderRadius: '10px',
    color: '#10b981',
    fontSize: '0.85rem',
  },
  alertError: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    padding: '12px 20px',
    borderRadius: '10px',
    color: '#ef4444',
    fontSize: '0.85rem',
  },
  // Table styles
  usersTable: {
    display: 'flex',
    flexDirection: 'column',
  },
  tableHeader: {
    display: 'flex',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    color: '#6b7280',
    fontSize: '0.8rem',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tableRow: {
    display: 'flex',
    padding: '16px',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
  },
  // Form styles
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formRow: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  optionsBlock: {
    background: 'rgba(0, 0, 0, 0.1)',
    padding: '20px',
    borderRadius: '12px',
    marginTop: '10px',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '15px',
    marginTop: '10px',
  },
  // Analytics
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '20px',
  },
  statBox: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statBoxLabel: {
    fontSize: '0.8rem',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: '6px',
  },
  statBoxValue: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#fff',
  },
  trackerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px dashed rgba(255, 255, 255, 0.04)',
    fontSize: '0.9rem',
    color: '#9ca3af',
  },
};

export default AdminPanel;
