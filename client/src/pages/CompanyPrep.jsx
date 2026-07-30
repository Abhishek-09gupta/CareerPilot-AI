import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Building, 
  Map, 
  DollarSign, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Award
} from 'lucide-react';

const CompanyPrep = () => {
  const [companies, setCompanies] = useState([]);
  const [activeCompany, setActiveCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.getCompanies();
      if (res.success && res.data.length > 0) {
        setCompanies(res.data);
        setActiveCompany(res.data[0]); // Default to first company
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <RefreshCw className="animate-spin" size={32} color="#8b5cf6" />
        <span style={{ marginLeft: '12px', color: '#9ca3af' }}>Assembling hiring roadmaps...</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.splitRow}>
        {/* Sidebar of Companies */}
        <div className="glass-panel" style={styles.sidebar}>
          <h3 style={{ marginBottom: '15px', color: '#fff' }}>Target Companies</h3>
          <div style={styles.list}>
            {companies.map((c) => {
              const isActive = activeCompany && activeCompany._id === c._id;
              return (
                <div 
                  key={c._id}
                  style={{
                    ...styles.listItem,
                    ...(isActive ? styles.listItemActive : {})
                  }}
                  onClick={() => setActiveCompany(c)}
                >
                  <div style={styles.companyIconWrapper}>
                    <Building size={16} color={isActive ? '#8b5cf6' : '#9ca3af'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: isActive ? '#fff' : '#d1d5db', fontSize: '0.9rem' }}>{c.companyName}</h4>
                    <span style={styles.sidebarSalary}>{c.salaryOverview.split(' ')[0]} {c.salaryOverview.split(' ')[1] || ''}</span>
                  </div>
                  <ChevronRight size={16} color="#6b7280" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Roadmap Display Workspace */}
        {activeCompany && (
          <div className="glass-panel animate-fade-in" style={styles.detailsCard}>
            <div style={styles.detailsHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Building size={32} color="#8b5cf6" />
                <div>
                  <h2 style={{ color: '#fff', fontSize: '1.4rem' }}>{activeCompany.companyName} Career Roadmap</h2>
                  <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Full preparation syllabus and recruitment roadmap</p>
                </div>
              </div>

              <div style={styles.salaryTag}>
                <DollarSign size={16} color="#10b981" />
                <span>{activeCompany.salaryOverview}</span>
              </div>
            </div>

            <p style={styles.description}>{activeCompany.description}</p>

            <div style={styles.gridSection}>
              {/* Hiring Stages */}
              <div style={styles.stageCard}>
                <div style={styles.sectionTitleRow}>
                  <Award size={18} color="#06b6d4" />
                  <span>Hiring Stages</span>
                </div>
                <div style={styles.stageList}>
                  {activeCompany.interviewProcess.map((step, idx) => (
                    <div key={idx} style={styles.stageItem}>
                      <div style={styles.stageBadge}>{idx + 1}</div>
                      <span style={styles.stageText}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roadmaps */}
              <div style={styles.stageCard}>
                <div style={styles.sectionTitleRow}>
                  <Map size={18} color="#8b5cf6" />
                  <span>Preparation Milestones</span>
                </div>
                <div style={styles.stageList}>
                  {activeCompany.roadmap.map((step, idx) => (
                    <div key={idx} style={styles.roadmapItem}>
                      <div style={styles.roadmapDot} />
                      <span style={styles.stageText}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resources list */}
            {activeCompany.resources && activeCompany.resources.length > 0 && (
              <div style={styles.resourcesArea}>
                <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '12px' }}>Recommended Study Materials</h4>
                <div style={styles.resourcesList}>
                  {activeCompany.resources.map((res, idx) => (
                    <a 
                      key={idx} 
                      href={res.link} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={styles.resourceItem}
                    >
                      <BookOpen size={16} color="#8b5cf6" />
                      <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '500' }}>{res.title}</span>
                      <ExternalLink size={14} color="#6b7280" style={{ marginLeft: 'auto' }} />
                    </a>
                  ))}
                </div>
              </div>
            )}
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
    gap: '20px',
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
  },
  splitRow: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  sidebar: {
    width: '280px',
    padding: '24px',
    height: 'fit-content',
    flexShrink: 0,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '10px',
    cursor: 'pointer',
    border: '1px solid transparent',
    transition: 'all 0.2s ease',
  },
  listItemActive: {
    background: 'rgba(139, 92, 246, 0.08)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  companyIconWrapper: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.02)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarSalary: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  detailsCard: {
    flex: 1,
    padding: '30px',
    minWidth: '320px',
  },
  detailsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '20px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  salaryTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '6px 12px',
    borderRadius: '8px',
    color: '#10b981',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
  description: {
    color: '#9ca3af',
    fontSize: '0.9rem',
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  gridSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '30px',
  },
  stageCard: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    padding: '20px',
    borderRadius: '12px',
  },
  sectionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#fff',
    fontWeight: '700',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    marginBottom: '15px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    paddingBottom: '8px',
  },
  stageList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  stageItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  stageBadge: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    background: 'rgba(6, 182, 212, 0.15)',
    color: '#06b6d4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: '700',
  },
  roadmapItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  roadmapDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#8b5cf6',
    marginTop: '6px',
    flexShrink: 0,
  },
  stageText: {
    fontSize: '0.85rem',
    color: '#d1d5db',
    lineHeight: '1.4',
  },
  resourcesArea: {
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '20px',
  },
  resourcesList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '12px',
  },
  resourceItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
};

export default CompanyPrep;
