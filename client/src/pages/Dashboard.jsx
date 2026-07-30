import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Award, 
  Code, 
  FileText, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Gamified daily checklist state
  const [dailyGoals, setDailyGoals] = useState([
    { id: 1, text: 'Solve 1 Coding Challenge', done: false },
    { id: 2, text: 'Practice 1 Aptitude Quiz', done: false },
    { id: 3, text: 'Analyze Resume ATS compatibility', done: false },
    { id: 4, text: 'Simulate a Technical mock interview', done: false }
  ]);

  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.getDashboard();
      if (response.success) {
        setMetrics(response.data);
      } else {
        setError(response.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Could not connect to API server. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const toggleGoal = (id) => {
    setDailyGoals(prev => prev.map(g => g.id === id ? { ...g, done: !g.done } : g));
  };

  const completedGoalsCount = dailyGoals.filter(g => g.done).length;
  const checklistProgress = Math.round((completedGoalsCount / dailyGoals.length) * 100);

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <RefreshCw className="animate-spin" size={32} color="#8b5cf6" />
        <span style={{ marginLeft: '12px', color: '#9ca3af' }}>Assembling your dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel" style={styles.errorContainer}>
        <h3>⚠️ Connection Issue</h3>
        <p style={{ margin: '10px 0 20px', color: '#9ca3af' }}>{error}</p>
        <button className="btn btn-primary" onClick={fetchDashboardData}>
          Try Reconnecting
        </button>
      </div>
    );
  }

  const statCards = [
    { 
      name: 'Aptitude Accuracy', 
      val: metrics ? `${metrics.avgAptitudeAccuracy}%` : '0%', 
      desc: `${metrics ? metrics.testsAttempted : 0} Tests Attempted`, 
      color: '#06b6d4', 
      icon: Award 
    },
    { 
      name: 'Coding Solved', 
      val: metrics ? `${metrics.codingSolved}/${metrics.totalCodingQuestions}` : '0', 
      desc: `${metrics ? metrics.codingPercentage : 0}% Solved`, 
      color: '#8b5cf6', 
      icon: Code 
    },
    { 
      name: 'Resume ATS Score', 
      val: metrics && metrics.latestResumeScore > 0 ? `${metrics.latestResumeScore}%` : 'N/A', 
      desc: metrics && metrics.latestResumeScore > 0 ? 'Analyzed' : 'Not Uploaded', 
      color: '#ec4899', 
      icon: FileText 
    },
    { 
      name: 'AI Mock Interview', 
      val: metrics && metrics.avgInterviewScore > 0 ? `${metrics.avgInterviewScore}/100` : 'N/A', 
      desc: 'Average Score', 
      color: '#3b82f6', 
      icon: MessageSquare 
    },
  ];

  return (
    <div style={styles.container}>
      {/* Stat Grid */}
      <div style={styles.grid}>
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-panel" style={styles.statCard}>
              <div style={styles.statHeader}>
                <span style={styles.statLabel}>{card.name}</span>
                <div style={{ ...styles.statIconWrapper, background: `rgba(${card.color === '#8b5cf6' ? '139, 92, 246' : card.color === '#06b6d4' ? '6, 182, 212' : card.color === '#ec4899' ? '236, 72, 153' : '59, 130, 246'}, 0.15)` }}>
                  <Icon size={20} color={card.color} />
                </div>
              </div>
              <div style={styles.statValue}>{card.val}</div>
              <div style={styles.statDesc}>{card.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Main Row */}
      <div style={styles.mainRow}>
        {/* Left Column: Recommendations & Activity */}
        <div style={styles.leftCol}>
          {/* AI recommendations */}
          <div className="glass-panel" style={styles.sectionCard}>
            <div style={styles.sectionTitleRow}>
              <Sparkles size={20} color="#8b5cf6" />
              <h3>AI Recommendations</h3>
            </div>
            <p style={styles.sectionSubtitle}>Personalized steps to maximize your selection chances</p>
            
            <div style={styles.recList}>
              {metrics && metrics.recommendations.map((rec) => (
                <div key={rec.id} style={styles.recItem}>
                  <div style={styles.recContent}>
                    <div style={styles.recTitleRow}>
                      <span style={styles.recTitle}>{rec.title}</span>
                      <span style={{ 
                        ...styles.priorityBadge, 
                        background: rec.priority === 'High' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: rec.priority === 'High' ? '#ef4444' : '#f59e0b'
                      }}>
                        {rec.priority} Priority
                      </span>
                    </div>
                    <p style={styles.recDesc}>{rec.description}</p>
                  </div>
                  <button 
                    className="btn btn-secondary" 
                    style={styles.recBtn}
                    onClick={() => navigate(rec.action)}
                  >
                    <span>Prepare</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-panel" style={styles.sectionCard}>
            <h3>Recent Preparation Activity</h3>
            <div style={styles.activityList}>
              {metrics && metrics.recentActivity.length > 0 ? (
                metrics.recentActivity.map((act) => (
                  <div key={act._id} style={styles.activityItem}>
                    <div style={{
                      ...styles.actDot,
                      background: act.testType === 'coding' ? '#8b5cf6' : act.testType === 'aptitude' ? '#06b6d4' : act.testType === 'resume' ? '#ec4899' : '#3b82f6'
                    }} />
                    <div style={styles.actContent}>
                      <span style={styles.actDesc}>{act.description}</span>
                      <span style={styles.actDate}>
                        {new Date(act.date).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={styles.emptyText}>No recent activity logged. Start practicing now!</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Daily goals */}
        <div style={styles.rightCol}>
          <div className="glass-panel" style={styles.checklistCard}>
            <h3 style={{ marginBottom: '15px' }}>Daily Placement Goals</h3>
            
            {/* Progress tracker */}
            <div style={styles.progressRingWrapper}>
              <div style={styles.progressText}>
                <span style={styles.progressPercent}>{checklistProgress}%</span>
                <span style={styles.progressSub}>Goal Achieved</span>
              </div>
              <div style={styles.progressTrackBar}>
                <div style={{ ...styles.progressFillBar, width: `${checklistProgress}%` }} />
              </div>
            </div>

            <div style={styles.goalsList}>
              {dailyGoals.map(goal => (
                <div 
                  key={goal.id} 
                  style={{
                    ...styles.goalItem,
                    ...(goal.done ? styles.goalItemDone : {})
                  }}
                  onClick={() => toggleGoal(goal.id)}
                >
                  <div style={styles.checkbox}>
                    {goal.done ? <CheckCircle2 size={18} color="#10b981" /> : <div style={styles.checkboxEmpty} />}
                  </div>
                  <span style={goal.done ? styles.goalTextDone : styles.goalText}>
                    {goal.text}
                  </span>
                </div>
              ))}
            </div>

            <div style={styles.checklistFooter}>
              <TrendingUp size={16} color="#10b981" />
              <span>Complete daily tasks to build habit streaks.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
  },
  errorContainer: {
    padding: '40px',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '40px auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },
  statCard: {
    padding: '24px',
    borderRadius: '16px',
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  statLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#9ca3af',
  },
  statIconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.02em',
  },
  statDesc: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '4px',
  },
  mainRow: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  leftCol: {
    flex: '2 1 500px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  rightCol: {
    flex: '1 1 300px',
  },
  sectionCard: {
    padding: '24px',
  },
  sectionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  sectionSubtitle: {
    fontSize: '0.8rem',
    color: '#6b7280',
    marginBottom: '20px',
  },
  recList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  recItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '12px',
    gap: '16px',
  },
  recContent: {
    flex: 1,
  },
  recTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  recTitle: {
    fontWeight: '600',
    color: '#fff',
    fontSize: '0.95rem',
  },
  priorityBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  recDesc: {
    fontSize: '0.8rem',
    color: '#9ca3af',
  },
  recBtn: {
    padding: '8px 14px',
    fontSize: '0.8rem',
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '15px',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '12px',
    borderBottom: '1px dashed rgba(255, 255, 255, 0.05)',
  },
  actDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  actContent: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  actDesc: {
    fontSize: '0.85rem',
    color: '#f3f4f6',
  },
  actDate: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  checklistCard: {
    padding: '24px',
    height: 'fit-content',
  },
  progressRingWrapper: {
    marginBottom: '20px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    padding: '16px',
    borderRadius: '12px',
  },
  progressText: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '10px',
  },
  progressPercent: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#10b981',
  },
  progressSub: {
    fontSize: '0.75rem',
    color: '#9ca3af',
  },
  progressTrackBar: {
    height: '6px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFillBar: {
    height: '100%',
    background: '#10b981',
    borderRadius: '3px',
    transition: 'width 0.4s ease',
  },
  goalsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  goalItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  goalItemDone: {
    background: 'rgba(16, 185, 129, 0.03)',
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxEmpty: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    border: '2px solid rgba(255, 255, 255, 0.2)',
  },
  goalText: {
    fontSize: '0.85rem',
    color: '#f3f4f6',
  },
  goalTextDone: {
    fontSize: '0.85rem',
    color: '#6b7280',
    textDecoration: 'line-through',
  },
  checklistFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '20px',
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  emptyText: {
    fontSize: '0.8rem',
    color: '#6b7280',
    textAlign: 'center',
    padding: '20px 0',
  },
};

export default Dashboard;
