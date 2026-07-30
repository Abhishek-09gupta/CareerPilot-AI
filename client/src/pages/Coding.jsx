import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Code, 
  ChevronDown, 
  HelpCircle, 
  BookOpen, 
  Terminal, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Search,
  ChevronRight
} from 'lucide-react';

const Coding = () => {
  const [questions, setQuestions] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null); // Full question details
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  // Filters
  const [difficulty, setDifficulty] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Code editor states
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [showHint, setShowHint] = useState(false);
  const [showEditorial, setShowEditorial] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [difficulty]);

  const fetchQuestions = async () => {
    setListLoading(true);
    try {
      const res = await api.getCodingQuestions(difficulty, '');
      if (res.success) {
        setQuestions(res.data);
      }
    } catch (err) {
      console.error('Failed to load coding questions:', err);
    } finally {
      setListLoading(false);
    }
  };

  const handleSelectQuestion = async (qId) => {
    setLoading(true);
    setSubmitResult(null);
    setShowHint(false);
    setShowEditorial(false);
    try {
      const res = await api.getCodingQuestionDetails(qId);
      if (res.success) {
        setActiveQuestion(res.data);
        
        // Load default code skeleton based on language
        if (res.data.title === 'Two Sum') {
          setCode(`// Write your Two Sum solution here\nfunction twoSum(nums, target) {\n  \n}`);
        } else if (res.data.title === 'Reverse String') {
          setCode(`// Reverse the character array in-place\nfunction reverseString(s) {\n  \n}`);
        } else if (res.data.title === 'Valid Parentheses') {
          setCode(`// Check matching braces parentheses\nfunction isValid(s) {\n  \n}`);
        } else {
          setCode(`// Write your code here\nfunction solution() {\n  \n}`);
        }
      }
    } catch (err) {
      alert('Failed to load question details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!code.trim()) {
      alert('Please write code before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await api.submitCodingSolution(activeQuestion._id, code, language);
      if (res.success) {
        setSubmitResult(res.data);
      } else {
        alert('Compilation failed: ' + res.message);
      }
    } catch (err) {
      alert('Network compile error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter list locally for search
  const filteredQuestions = questions.filter(q => 
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (activeQuestion) {
    return (
      <div style={styles.workspaceContainer}>
        {/* Workspace Header */}
        <div className="glass-panel" style={styles.workspaceHeader}>
          <button style={styles.backBtn} onClick={() => setActiveQuestion(null)}>
            <ArrowLeftIcon />
            <span>Back to Question List</span>
          </button>
          <div style={styles.workspaceTitleRow}>
            <h2 style={{ color: '#fff', fontSize: '1.25rem' }}>{activeQuestion.title}</h2>
            <span className={`badge badge-${activeQuestion.difficulty.toLowerCase()}`}>
              {activeQuestion.difficulty}
            </span>
          </div>
        </div>

        {/* Challenge Split Screen */}
        <div style={styles.splitGrid}>
          {/* Left Panel: Description */}
          <div className="glass-panel" style={styles.descriptionPanel}>
            <div style={styles.tabHeader}>
              <span style={styles.activeTab}><BookOpen size={16} /> Description</span>
            </div>
            
            <div style={styles.panelContent}>
              <p style={styles.descParagraph}>{activeQuestion.description}</p>
              
              <div style={styles.exampleSection}>
                <h4 style={styles.metaTitle}>Sample Input</h4>
                <pre style={styles.codeBlock}>{activeQuestion.sampleInput}</pre>
                
                <h4 style={styles.metaTitle} style={{ marginTop: '15px' }}>Sample Output</h4>
                <pre style={styles.codeBlock}>{activeQuestion.sampleOutput}</pre>
              </div>

              {activeQuestion.constraints && (
                <div style={styles.constraintsSection}>
                  <h4 style={styles.metaTitle}>Constraints</h4>
                  <pre style={{ ...styles.codeBlock, color: '#f59e0b' }}>{activeQuestion.constraints}</pre>
                </div>
              )}

              <div style={styles.collapsibleArea}>
                <button 
                  style={styles.collapseToggle} 
                  onClick={() => setShowHint(!showHint)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle size={16} color="#8b5cf6" />
                    <span>Need a Hint?</span>
                  </div>
                  <ChevronDown size={16} />
                </button>
                {showHint && (
                  <div style={styles.collapseBody}>
                    <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                      Try thinking about time complexity. If you're using nested loops, how could you optimize the storage search using a Hash Set or Map?
                    </p>
                  </div>
                )}

                <button 
                  style={{ ...styles.collapseToggle, marginTop: '10px' }} 
                  onClick={() => setShowEditorial(!showEditorial)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={16} color="#06b6d4" />
                    <span>Editorial Solution</span>
                  </div>
                  <ChevronDown size={16} />
                </button>
                {showEditorial && (
                  <div style={styles.collapseBody}>
                    <pre style={styles.editorialBlock}>{activeQuestion.solution}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Editor & Output */}
          <div style={styles.editorContainer}>
            {/* Editor Console Header */}
            <div className="glass-panel" style={styles.editorHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={18} color="#8b5cf6" />
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff' }}>Code Editor</span>
              </div>
              <select 
                className="form-input" 
                style={styles.languageSelect}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python 3</option>
                <option value="cpp">C++ (GCC 14)</option>
                <option value="java">Java (JDK 21)</option>
              </select>
            </div>

            {/* Code editor textarea */}
            <div className="glass-panel" style={styles.editorWorkspace}>
              <div style={styles.lineNumbers}>
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} style={styles.lineNumber}>{i + 1}</div>
                ))}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={styles.codeTextarea}
                spellCheck="false"
              />
            </div>

            {/* Action buttons */}
            <div style={styles.actionsBar}>
              <button 
                className="btn btn-primary" 
                style={{ padding: '10px 24px' }}
                onClick={handleSubmitCode}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Compiling & Running...' : 'Submit Code'}
              </button>
            </div>

            {/* Submit Results output panel */}
            {submitResult && (
              <div className="glass-panel animate-fade-in" style={styles.outputPanel}>
                <div style={styles.outputHeader}>
                  <h4 style={{ color: '#fff', fontSize: '0.95rem' }}>Execution Results</h4>
                  {submitResult.status === 'Accepted' ? (
                    <span style={{ ...styles.statusBadge, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                      <CheckCircle size={14} /> Accepted
                    </span>
                  ) : (
                    <span style={{ ...styles.statusBadge, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                      <XCircle size={14} /> {submitResult.status}
                    </span>
                  )}
                </div>

                <div style={styles.outputBody}>
                  <div style={styles.outputMetricRow}>
                    <span>Test Cases: <strong>{submitResult.testCasesPassed}/{submitResult.totalTestCases} Passed</strong></span>
                    <span>Accuracy: <strong>{submitResult.accuracy}%</strong></span>
                  </div>
                  
                  {submitResult.errorMessage && (
                    <pre style={styles.errorLogs}>{submitResult.errorMessage}</pre>
                  )}

                  {submitResult.status === 'Accepted' && (
                    <p style={styles.congratsText}>🎉 Splendid work! Your code successfully passes all validation conditions.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // LIST SCREEN
  return (
    <div style={styles.container}>
      {/* Header filters */}
      <div className="glass-panel" style={styles.filterCard}>
        <div style={styles.searchWrapper}>
          <Search size={18} color="#6b7280" />
          <input
            type="text"
            placeholder="Search questions by name or tags (e.g. Array, Stack)..."
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={styles.difficultyFilter}>
          <button 
            style={{ ...styles.filterTab, ...(difficulty === '' ? styles.filterTabActive : {}) }}
            onClick={() => setDifficulty('')}
          >
            All Challenges
          </button>
          <button 
            style={{ ...styles.filterTab, ...(difficulty === 'Easy' ? styles.filterTabActive : {}) }}
            onClick={() => setDifficulty('Easy')}
          >
            Easy
          </button>
          <button 
            style={{ ...styles.filterTab, ...(difficulty === 'Medium' ? styles.filterTabActive : {}) }}
            onClick={() => setDifficulty('Medium')}
          >
            Medium
          </button>
          <button 
            style={{ ...styles.filterTab, ...(difficulty === 'Hard' ? styles.filterTabActive : {}) }}
            onClick={() => setDifficulty('Hard')}
          >
            Hard
          </button>
        </div>
      </div>

      {/* List view */}
      <div className="glass-panel" style={styles.listCard}>
        {listLoading ? (
          <div style={styles.listLoader}>
            <RefreshCw className="animate-spin" size={24} color="#8b5cf6" />
            <span style={{ marginLeft: '10px', color: '#9ca3af' }}>Fetching coding library...</span>
          </div>
        ) : filteredQuestions.length > 0 ? (
          <div style={styles.questionsTable}>
            <div style={styles.tableHeader}>
              <div style={{ flex: 2 }}>Title</div>
              <div style={{ flex: 1 }}>Difficulty</div>
              <div style={{ flex: 1.5 }}>Tags</div>
              <div style={{ width: '100px' }}>Action</div>
            </div>
            
            {filteredQuestions.map((q) => (
              <div key={q._id} style={styles.tableRow}>
                <div style={{ flex: 2, fontWeight: '600', color: '#fff' }}>{q.title}</div>
                <div style={{ flex: 1 }}>
                  <span className={`badge badge-${q.difficulty.toLowerCase()}`}>
                    {q.difficulty}
                  </span>
                </div>
                <div style={{ flex: 1.5, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {q.tags.map((tag, idx) => (
                    <span key={idx} style={styles.tagBadge}>{tag}</span>
                  ))}
                </div>
                <div style={{ width: '100px' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={styles.solveBtn}
                    onClick={() => handleSelectQuestion(q._id)}
                  >
                    <span>Solve</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.emptyText}>No coding questions found matching search criteria.</p>
        )}
      </div>
    </div>
  );
};

// Simple Arrow icon fallback helper
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  filterCard: {
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: '280px',
  },
  searchInput: {
    width: '100%',
    padding: '10px 16px 10px 40px',
    background: 'rgba(17, 24, 39, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
  },
  difficultyFilter: {
    display: 'flex',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '4px',
    borderRadius: '8px',
  },
  filterTab: {
    padding: '6px 12px',
    border: 'none',
    background: 'transparent',
    color: '#9ca3af',
    fontSize: '0.85rem',
    fontWeight: '600',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  filterTabActive: {
    background: 'rgba(139, 92, 246, 0.15)',
    color: '#fff',
  },
  listCard: {
    padding: '24px',
  },
  listLoader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 0',
  },
  questionsTable: {
    display: 'flex',
    flexDirection: 'column',
  },
  tableHeader: {
    display: 'flex',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    color: '#6b7280',
    fontSize: '0.85rem',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tableRow: {
    display: 'flex',
    padding: '16px',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
    transition: 'background 0.2s ease',
  },
  tagBadge: {
    padding: '2px 8px',
    fontSize: '0.7rem',
    fontWeight: '600',
    borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.04)',
    color: '#9ca3af',
  },
  solveBtn: {
    padding: '6px 12px',
    fontSize: '0.8rem',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '40px 0',
    fontSize: '0.9rem',
  },
  // Workspace specific styles
  workspaceContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    height: 'calc(100vh - 120px)',
  },
  workspaceHeader: {
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  workspaceTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  splitGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    flex: 1,
    minHeight: 0, // Crucial for overflow scroll parameters
  },
  descriptionPanel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflowY: 'auto',
  },
  tabHeader: {
    padding: '12px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  activeTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#fff',
    fontWeight: '700',
    fontSize: '0.9rem',
  },
  panelContent: {
    padding: '20px',
    flex: 1,
    overflowY: 'auto',
  },
  descParagraph: {
    fontSize: '0.95rem',
    lineHeight: '1.6',
    color: '#d1d5db',
    whiteSpace: 'pre-wrap',
  },
  exampleSection: {
    marginTop: '25px',
  },
  metaTitle: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  codeBlock: {
    background: '#070a13',
    padding: '14px',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    color: '#34d399',
    overflowX: 'auto',
  },
  constraintsSection: {
    marginTop: '25px',
  },
  collapsibleArea: {
    marginTop: '30px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '20px',
  },
  collapseToggle: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '10px',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
  },
  collapseBody: {
    padding: '16px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '0 0 10px 10px',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderTop: 'none',
  },
  editorialBlock: {
    background: '#070a13',
    padding: '14px',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    color: '#a78bfa',
    overflowX: 'auto',
    whiteSpace: 'pre',
  },
  // Editor panel styles
  editorContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  editorHeader: {
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: '16px 16px 0 0',
  },
  languageSelect: {
    padding: '6px 12px',
    fontSize: '0.8rem',
    width: '180px',
    background: 'rgba(0, 0, 0, 0.4)',
  },
  editorWorkspace: {
    flex: 1,
    display: 'flex',
    background: '#070a13',
    borderTop: 'none',
    borderRadius: '0',
    position: 'relative',
    overflow: 'hidden',
  },
  lineNumbers: {
    width: '40px',
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '16px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRight: '1px solid rgba(255, 255, 255, 0.02)',
    userSelect: 'none',
  },
  lineNumber: {
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    color: '#4b5563',
    height: '24px',
  },
  codeTextarea: {
    flex: 1,
    padding: '16px',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#e5e7eb',
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: '0.9rem',
    lineHeight: '24px',
    resize: 'none',
  },
  actionsBar: {
    padding: '12px 0',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  outputPanel: {
    padding: '20px',
    marginTop: '10px',
  },
  outputHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '700',
  },
  outputMetricRow: {
    display: 'flex',
    gap: '24px',
    fontSize: '0.85rem',
    color: '#9ca3af',
    marginBottom: '15px',
  },
  errorLogs: {
    background: '#1f1315',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#f87171',
    padding: '12px',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    overflowX: 'auto',
  },
  congratsText: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
};

export default Coding;
