import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Zap, 
  RefreshCw 
} from 'lucide-react';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    historyList: [],
    radarData: [],
    barData: [],
  });

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch user profile and dashboard stats
      const dash = await api.getDashboard();
      const apt = await api.getAptitudeHistory();
      const int = await api.getInterviewHistory();

      if (dash.success) {
        const metrics = dash.data;
        
        // Formulate Radar Chart Data: Weak vs Strong Areas
        const radar = [
          { subject: 'Aptitude Accuracy', value: metrics.avgAptitudeAccuracy || 30, fullMark: 100 },
          { subject: 'Coding Percentage', value: metrics.codingPercentage || 20, fullMark: 100 },
          { subject: 'Resume ATS', value: metrics.latestResumeScore || 40, fullMark: 100 },
          { subject: 'AI Interview', value: metrics.avgInterviewScore || 30, fullMark: 100 },
        ];

        // Formulate Bar Chart Data: Attempts Breakdown
        const bar = [
          { name: 'Aptitude Quizzes', count: metrics.testsAttempted || 0, fill: '#06b6d4' },
          { name: 'Coding Challenges', count: metrics.codingSolved || 0, fill: '#8b5cf6' },
          { name: 'Mock Interviews', count: int.success ? int.data.length : 0, fill: '#3b82f6' },
          { name: 'Resumes Analyzed', count: metrics.latestResumeScore > 0 ? 1 : 0, fill: '#ec4899' },
        ];

        // Formulate Area Chart Data: Historical logs Chronological line
        const mergedHistory = [];
        
        if (apt.success) {
          apt.data.forEach(item => {
            mergedHistory.push({
              name: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
              score: item.accuracy,
              type: 'Aptitude',
              timestamp: new Date(item.date).getTime()
            });
          });
        }

        if (int.success) {
          int.data.forEach(item => {
            mergedHistory.push({
              name: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
              score: item.score,
              type: 'Interview',
              timestamp: new Date(item.date).getTime()
            });
          });
        }

        // Sort by timestamp
        mergedHistory.sort((a, b) => a.timestamp - b.timestamp);

        setAnalyticsData({
          historyList: mergedHistory,
          radarData: radar,
          barData: bar
        });
      }
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <RefreshCw className="animate-spin" size={32} color="#8b5cf6" />
        <span style={{ marginLeft: '12px', color: '#9ca3af' }}>Calculating progress statistics...</span>
      </div>
    );
  }

  const hasData = analyticsData.historyList.length > 0 || 
                  analyticsData.barData.some(d => d.count > 0);

  // Mock descriptive statistics if history is empty to display premium layout visuals
  const demoHistoryData = [
    { name: 'Day 1', score: 45, type: 'Aptitude' },
    { name: 'Day 3', score: 60, type: 'Aptitude' },
    { name: 'Day 5', score: 55, type: 'Interview' },
    { name: 'Day 7', score: 78, type: 'Aptitude' },
    { name: 'Day 10', score: 85, type: 'Interview' }
  ];

  const demoRadarData = [
    { subject: 'Aptitude Accuracy', value: 72, fullMark: 100 },
    { subject: 'Coding Percentage', value: 55, fullMark: 100 },
    { subject: 'Resume ATS', value: 80, fullMark: 100 },
    { subject: 'AI Interview', value: 68, fullMark: 100 }
  ];

  const finalHistory = hasData ? analyticsData.historyList : demoHistoryData;
  const finalRadar = hasData ? analyticsData.radarData : demoRadarData;

  return (
    <div style={styles.container}>
      {!hasData && (
        <div className="glass-panel" style={styles.demoNotification}>
          <Zap size={18} color="#f59e0b" />
          <span>
            <strong>Demo Analytics: </strong> You haven't completed quizzes or uploads yet. Illustrative charts are displayed below.
          </span>
        </div>
      )}

      <div style={styles.mainGrid}>
        {/* Left Column: Progress Curve */}
        <div className="glass-panel" style={styles.chartCardLarge}>
          <div style={styles.cardHeader}>
            <TrendingUp size={20} color="#8b5cf6" />
            <h3 style={{ color: '#fff', fontSize: '1.05rem' }}>Performance Accuracy Curve</h3>
          </div>
          <p style={styles.cardSubtitle}>Chronological accuracy percentage score across modules</p>
          
          <div style={{ width: '100%', height: '280px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={finalHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip 
                  contentStyle={styles.tooltipStyle}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Skill Radar */}
        <div className="glass-panel" style={styles.chartCardSmall}>
          <div style={styles.cardHeader}>
            <Activity size={20} color="#06b6d4" />
            <h3 style={{ color: '#fff', fontSize: '1.05rem' }}>Core Placement Capability</h3>
          </div>
          <p style={styles.cardSubtitle}>Radar analysis mapping current screening readiness</p>

          <div style={{ width: '100%', height: '280px', marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" r="70%" data={finalRadar}>
                <PolarGrid stroke="rgba(255, 255, 255, 0.05)" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#4b5563" fontSize={8} />
                <Radar 
                  name="Capability" 
                  dataKey="value" 
                  stroke="#06b6d4" 
                  fill="#06b6d4" 
                  fillOpacity={0.25} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Column: Activity Histogram */}
        {hasData && (
          <div className="glass-panel" style={styles.chartCardLarge} style={{ gridColumn: 'span 2' }}>
            <div style={styles.cardHeader}>
              <BarChart3 size={20} color="#ec4899" />
              <h3 style={{ color: '#fff', fontSize: '1.05rem' }}>Attempts Histogram Breakdown</h3>
            </div>
            <p style={styles.cardSubtitle}>Comparative total task count accomplished by modules</p>

            <div style={{ width: '100%', height: '240px', marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={styles.tooltipStyle}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {analyticsData.barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
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
  demoNotification: {
    background: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    padding: '12px 20px',
    color: '#fff',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.85rem',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
  },
  chartCardLarge: {
    padding: '24px',
    borderRadius: '16px',
    minWidth: '320px',
  },
  chartCardSmall: {
    padding: '24px',
    borderRadius: '16px',
    minWidth: '240px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  cardSubtitle: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '4px',
  },
  tooltipStyle: {
    background: '#111827',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    fontSize: '0.8rem',
    color: '#fff',
  },
};

export default Analytics;
