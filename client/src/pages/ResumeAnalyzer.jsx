import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  FileText, 
  UploadCloud, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  FileCode, 
  ListTodo, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

const ResumeAnalyzer = () => {
  const { user, syncProfile } = useAuth();
  
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) {
      alert('Please select a resume file first.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResults(null);

    try {
      // Step 1: Upload to Cloudinary
      const uploadRes = await api.uploadResume(file);
      if (uploadRes.success) {
        // Step 2: Trigger Gemini ATS Analysis
        const analysisRes = await api.analyzeResume(file);
        if (analysisRes.success) {
          setResults(analysisRes.data);
          syncProfile(); // Sync profile details (extracted skills list)
        } else {
          setErrorMsg(analysisRes.message || 'ATS Analysis failed.');
        }
      } else {
        setErrorMsg(uploadRes.message || 'Failed to upload resume.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error communicating with analyzer server.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <div style={styles.container}>
      <div style={styles.splitRow}>
        {/* Left Panel: Upload */}
        <div className="glass-panel" style={styles.uploadCard}>
          <h3>Resume Document Upload</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: '5px 0 25px' }}>
            We support PDF, DOC, and DOCX formats up to 5MB. Uploading will update your active student profile.
          </p>

          <div 
            style={{
              ...styles.dragArea,
              ...(dragActive ? styles.dragAreaActive : {}),
              ...(file ? styles.dragAreaHasFile : {})
            }}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              id="file-upload-input" 
              style={{ display: 'none' }} 
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            
            <label htmlFor="file-upload-input" style={styles.dragLabel}>
              {file ? (
                <>
                  <FileCode size={48} color="#8b5cf6" />
                  <span style={styles.fileName}>{file.name}</span>
                  <span style={styles.fileSize}>{Math.round(file.size / 1024)} KB</span>
                </>
              ) : (
                <>
                  <UploadCloud size={48} color="#6b7280" />
                  <span style={styles.dragText}>Drag & drop resume here, or <strong style={{ color: '#8b5cf6' }}>browse files</strong></span>
                  <span style={styles.dragSub}>Supports PDF, DOC, DOCX</span>
                </>
              )}
            </label>
          </div>

          {file && (
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '20px' }}
              onClick={handleUploadAndAnalyze}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  <span>AI parsing active...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Run AI ATS Analyzer</span>
                </>
              )}
            </button>
          )}

          {user && user.resume && (
            <div style={styles.savedResumeArea}>
              <span style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Active Resume File</span>
              <a href={user.resume} target="_blank" rel="noreferrer" style={styles.resumeFileLink}>
                <FileText size={16} />
                <span>{user.resumeName || 'View active resume document'}</span>
              </a>
            </div>
          )}
        </div>

        {/* Right Panel: Results */}
        <div className="glass-panel" style={styles.resultsCard}>
          {loading ? (
            <div style={styles.placeholderContainer}>
              <RefreshCw className="animate-spin" size={32} color="#8b5cf6" style={{ marginBottom: '15px' }} />
              <h4>AI Gemini parsing is running...</h4>
              <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '5px', textAlign: 'center' }}>
                Analyzing formatting structure, grammatical phrasing, keyword density, and technical skill gaps.
              </p>
            </div>
          ) : results ? (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Score block */}
              <div style={styles.scoreBlock}>
                {/* SVG Score Ring */}
                <div style={styles.ringWrapper}>
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                    <circle 
                      cx="60" 
                      cy="60" 
                      r="50" 
                      fill="transparent" 
                      stroke={getScoreColor(results.atsScore)} 
                      strokeWidth="8" 
                      strokeDasharray="314.16"
                      strokeDashoffset={314.16 - (314.16 * results.atsScore) / 100}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div style={styles.ringText}>
                    <span style={styles.ringScore}>{results.atsScore}</span>
                    <span style={styles.ringLabel}>ATS</span>
                  </div>
                </div>

                <div style={styles.scoreDetails}>
                  <h3 style={{ color: '#fff' }}>ATS Score Grade</h3>
                  <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '4px' }}>
                    {results.atsScore >= 80 
                      ? 'Excellent compatibility! Your resume contains targeted keywords and complies with corporate recruiters\' formatting requirements.' 
                      : results.atsScore >= 60 
                      ? 'Moderate compatibility. Consider resolving critical skill gaps and grammar suggestions to improve screening outcomes.' 
                      : 'Low compatibility. Major restructuring needed. Incorporate industry-specific keywords and expand project achievements.'
                    }
                  </p>
                </div>
              </div>

              {/* Suggestions grid */}
              <div style={styles.feedbackGrid}>
                {/* Grammar */}
                <div style={styles.feedbackSection}>
                  <div style={styles.sectionHeader}>
                    <AlertCircle size={16} color="#ef4444" />
                    <span>Formatting & Grammar ({results.grammarSuggestions.length})</span>
                  </div>
                  <ul style={styles.feedbackList}>
                    {results.grammarSuggestions.map((s, idx) => (
                      <li key={idx} style={styles.feedbackListItem}>{s}</li>
                    ))}
                  </ul>
                </div>

                {/* Skill Gaps */}
                <div style={styles.feedbackSection}>
                  <div style={styles.sectionHeader}>
                    <ListTodo size={16} color="#f59e0b" />
                    <span>Skill Gap Detection ({results.skillGapDetection.length})</span>
                  </div>
                  <ul style={styles.feedbackList}>
                    {results.skillGapDetection.map((s, idx) => (
                      <li key={idx} style={styles.feedbackListItem}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Keywords */}
              <div style={styles.keywordSection}>
                <div style={styles.sectionHeader}>
                  <Award size={16} color="#06b6d4" />
                  <span>Suggested Recruiter Keywords to Incorporate</span>
                </div>
                <div style={styles.keywordGrid}>
                  {results.keywordSuggestions.map((kw, idx) => (
                    <span key={idx} style={styles.keywordBadge}>{kw}</span>
                  ))}
                </div>
              </div>

              {/* General Tips */}
              <div style={styles.feedbackSection}>
                <div style={styles.sectionHeader}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Resume Formatting & Content Improvement Tips</span>
                </div>
                <ul style={styles.feedbackList}>
                  {results.resumeImprovementTips.map((s, idx) => (
                    <li key={idx} style={styles.feedbackListItem}>{s}</li>
                  ))}
                </ul>
              </div>

            </div>
          ) : errorMsg ? (
            <div style={styles.placeholderContainer}>
              <AlertCircle size={32} color="#ef4444" style={{ marginBottom: '10px' }} />
              <h4>Analysis Error</h4>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '5px', textAlign: 'center' }}>
                {errorMsg}
              </p>
            </div>
          ) : (
            <div style={styles.placeholderContainer}>
              <FileText size={48} color="#4b5563" style={{ marginBottom: '15px' }} />
              <h4>Awaiting Resume File</h4>
              <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '5px', textAlign: 'center' }}>
                Select and upload a resume on the left panel to display ATS feedback, suggestions, and keyword matching.
              </p>
            </div>
          )}
        </div>
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
  splitRow: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  uploadCard: {
    padding: '30px',
    flex: '1 1 300px',
    height: 'fit-content',
  },
  dragArea: {
    border: '2px dashed rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '30px 20px',
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.01)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  dragAreaActive: {
    borderColor: '#8b5cf6',
    background: 'rgba(139, 92, 246, 0.05)',
  },
  dragAreaHasFile: {
    borderColor: 'rgba(139, 92, 246, 0.4)',
    background: 'rgba(139, 92, 246, 0.02)',
  },
  dragLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  dragText: {
    fontSize: '0.85rem',
    color: '#9ca3af',
  },
  dragSub: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  fileName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#fff',
    maxWidth: '240px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  fileSize: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  savedResumeArea: {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  resumeFileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '8px',
    color: '#8b5cf6',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  resultsCard: {
    padding: '30px',
    flex: '2 1 450px',
    minHeight: '400px',
  },
  placeholderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#9ca3af',
  },
  scoreBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    padding: '20px',
    borderRadius: '16px',
    flexWrap: 'wrap',
  },
  ringWrapper: {
    position: 'relative',
    width: '120px',
    height: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ringText: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  ringScore: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#fff',
    lineHeight: '1',
  },
  ringLabel: {
    fontSize: '0.65rem',
    color: '#6b7280',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: '2px',
  },
  scoreDetails: {
    flex: 1,
    minWidth: '240px',
  },
  feedbackGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
  },
  feedbackSection: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    padding: '16px',
    borderRadius: '12px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    paddingBottom: '8px',
  },
  feedbackList: {
    paddingLeft: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  feedbackListItem: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    lineHeight: '1.4',
  },
  keywordSection: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    padding: '16px',
    borderRadius: '12px',
  },
  keywordGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  keywordBadge: {
    padding: '6px 12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    borderRadius: '6px',
    background: 'rgba(6, 182, 212, 0.08)',
    color: '#06b6d4',
    border: '1px solid rgba(6, 182, 212, 0.15)',
  },
};

export default ResumeAnalyzer;
