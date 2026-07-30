import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Award, 
  Timer, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Play,
  ArrowLeft
} from 'lucide-react';

const Aptitude = () => {
  // Test Setup states
  const [category, setCategory] = useState('Quantitative Aptitude');
  const [difficulty, setDifficulty] = useState('Medium');
  
  // Active Test states
  const [inTest, setInTest] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: selectedIndex }
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [loading, setLoading] = useState(false);
  const [testTimeLimit, setTestTimeLimit] = useState(0);

  // Results states
  const [results, setResults] = useState(null);
  const [viewHistory, setViewHistory] = useState(false);
  const [history, setHistory] = useState([]);

  // Fetch past history on load
  useEffect(() => {
    loadHistory();
  }, []);

  // Timer tick effect
  useEffect(() => {
    if (!inTest || timeLeft <= 0) {
      if (inTest && timeLeft === 0) {
        handleAutoSubmit();
      }
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [inTest, timeLeft]);

  const loadHistory = async () => {
    try {
      const res = await api.getAptitudeHistory();
      if (res.success) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error('Failed to load test history:', err);
    }
  };

  const handleStartTest = async () => {
    setLoading(true);
    setResults(null);
    try {
      const res = await api.getAptitudeQuestions(category, difficulty);
      if (res.success && res.data.length > 0) {
        setQuestions(res.data);
        setCurrentIdx(0);
        setSelectedAnswers({});
        // Assign 1.5 minutes per question
        const totalSecs = res.data.length * 90;
        setTimeLeft(totalSecs);
        setTestTimeLimit(totalSecs);
        setInTest(true);
      } else {
        alert('No questions found for the selected category and difficulty. Try changing parameters.');
      }
    } catch (err) {
      alert('Error loading questions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId, optionIdx) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [qId]: optionIdx.toString(),
    });
  };

  const handleAutoSubmit = () => {
    alert('⏱️ Time limit reached! Submitting test automatically.');
    handleSubmitTest();
  };

  const handleSubmitTest = async () => {
    setInTest(false);
    setLoading(true);
    
    // Prepare answers payload
    const submissionAnswers = questions.map(q => ({
      questionId: q._id,
      selectedOption: selectedAnswers[q._id] !== undefined ? selectedAnswers[q._id] : '-1', // -1 for unattempted
    }));

    const timeTaken = testTimeLimit - timeLeft;

    try {
      const res = await api.submitAptitudeTest(submissionAnswers, timeTaken, category);
      if (res.success) {
        setResults(res.data);
        loadHistory(); // Reload history
      } else {
        alert('Failed to submit test: ' + res.message);
      }
    } catch (err) {
      alert('Network error submitting answers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <RefreshCw className="animate-spin" size={32} color="#8b5cf6" />
        <span style={{ marginLeft: '12px', color: '#9ca3af' }}>Evaluating database records...</span>
      </div>
    );
  }

  // RESULT SCREEN
  if (results) {
    return (
      <div style={styles.container}>
        <div style={styles.resultsHeader} className="glass-panel animate-fade-in">
          <div style={styles.scoreRow}>
            <Award size={48} color="#10b981" />
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>Quiz Results: {results.accuracy}%</h2>
              <p style={{ color: '#9ca3af' }}>Accuracy level achieved for {category}</p>
            </div>
          </div>
          
          <div style={styles.statsSummaryGrid}>
            <div style={styles.summaryStatBox}>
              <span style={styles.summaryLabel}>Score</span>
              <span style={styles.summaryValue}>{results.score} Marks</span>
            </div>
            <div style={styles.summaryStatBox}>
              <span style={styles.summaryLabel}>Accuracy</span>
              <span style={styles.summaryValue}>{results.accuracy}%</span>
            </div>
            <div style={styles.summaryStatBox}>
              <span style={styles.summaryLabel}>Questions</span>
              <span style={styles.summaryValue}>{results.correctCount}/{results.totalQuestions}</span>
            </div>
            <div style={styles.summaryStatBox}>
              <span style={styles.summaryLabel}>Time Taken</span>
              <span style={styles.summaryValue}>{formatTime(results.timeTaken)}</span>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
            <button className="btn btn-primary" onClick={() => setResults(null)}>
              Practice Again
            </button>
            <button className="btn btn-secondary" onClick={() => { setResults(null); setViewHistory(true); }}>
              View Attempt History
            </button>
          </div>
        </div>

        {/* Detailed Question Review */}
        <h3 style={{ margin: '30px 0 15px', color: '#fff' }}>Answer Review</h3>
        <div style={styles.reviewList}>
          {results.summary.map((item, idx) => (
            <div key={idx} className="glass-panel" style={styles.reviewCard}>
              <div style={styles.reviewHeader}>
                <span style={styles.reviewNumber}>Question {idx + 1}</span>
                {item.isCorrect ? (
                  <span style={styles.correctBadge}><CheckCircle2 size={16} /> Correct</span>
                ) : (
                  <span style={styles.incorrectBadge}><XCircle size={16} /> Incorrect</span>
                )}
              </div>
              <p style={styles.questionText}>{item.questionText}</p>
              
              <div style={styles.optionsGrid}>
                {item.options.map((opt, optIdx) => {
                  const isCorrectAnswer = optIdx.toString() === item.correctAnswer.toString();
                  const isUserAnswer = optIdx.toString() === item.userAnswer.toString();
                  
                  let optStyle = styles.reviewOption;
                  if (isCorrectAnswer) optStyle = { ...optStyle, ...styles.reviewOptionCorrect };
                  else if (isUserAnswer && !isCorrectAnswer) optStyle = { ...optStyle, ...styles.reviewOptionIncorrect };

                  return (
                    <div key={optIdx} style={optStyle}>
                      <span>{optIdx + 1}. {opt}</span>
                      {isCorrectAnswer && <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#10b981' }}>CORRECT ANSWER</span>}
                      {isUserAnswer && !isCorrectAnswer && <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#ef4444' }}>YOUR ANSWER</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ACTIVE TEST SCREEN
  if (inTest && questions.length > 0) {
    const currentQuestion = questions[currentIdx];
    const isLastQuestion = currentIdx === questions.length - 1;

    return (
      <div style={styles.container}>
        {/* Test Navbar */}
        <div className="glass-panel" style={styles.testNavbar}>
          <div>
            <h3 style={{ color: '#fff' }}>{category} Test</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Difficulty: {difficulty}</p>
          </div>
          <div style={styles.timerBox}>
            <Timer size={20} color="#f59e0b" />
            <span style={{ color: timeLeft < 30 ? '#ef4444' : '#fff', fontWeight: '700', fontSize: '1.2rem', fontFamily: 'monospace' }}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div style={styles.testWorkspace}>
          {/* Question Navigator */}
          <div className="glass-panel" style={styles.navigatorPanel}>
            <h4 style={{ marginBottom: '15px', color: '#fff', fontSize: '0.9rem', textTransform: 'uppercase' }}>Questions</h4>
            <div style={styles.navigatorGrid}>
              {questions.map((q, idx) => {
                const isSelected = selectedAnswers[q._id] !== undefined;
                const isActive = currentIdx === idx;
                
                let btnStyle = styles.navButton;
                if (isActive) btnStyle = { ...btnStyle, ...styles.navActive };
                else if (isSelected) btnStyle = { ...btnStyle, ...styles.navAttempted };

                return (
                  <button 
                    key={idx} 
                    style={btnStyle}
                    onClick={() => setCurrentIdx(idx)}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <button 
              className="btn btn-accent" 
              style={{ width: '100%', marginTop: '30px' }}
              onClick={handleSubmitTest}
            >
              Submit Test
            </button>
          </div>

          {/* Active Question Panel */}
          <div className="glass-panel" style={styles.questionPanel}>
            <div style={styles.questionMeta}>
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <span className="badge badge-medium">{difficulty}</span>
            </div>
            
            <p style={styles.activeQuestionText}>{currentQuestion.question}</p>

            <div style={styles.activeOptionsList}>
              {currentQuestion.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentQuestion._id] === optIdx.toString();
                return (
                  <div 
                    key={optIdx} 
                    style={{
                      ...styles.optionCard,
                      ...(isSelected ? styles.optionCardSelected : {})
                    }}
                    onClick={() => handleSelectOption(currentQuestion._id, optIdx)}
                  >
                    <div style={{
                      ...styles.radioCircle,
                      ...(isSelected ? styles.radioCircleSelected : {})
                    }}>
                      {isSelected && <div style={styles.radioDot} />}
                    </div>
                    <span style={styles.optionText}>{opt}</span>
                  </div>
                );
              })}
            </div>

            <div style={styles.controlRow}>
              <button 
                className="btn btn-secondary" 
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(currentIdx - 1)}
              >
                <ChevronLeft size={18} />
                <span>Prev</span>
              </button>
              
              {isLastQuestion ? (
                <button 
                  className="btn btn-accent" 
                  onClick={handleSubmitTest}
                >
                  Submit Test
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={() => setCurrentIdx(currentIdx + 1)}
                >
                  <span>Next</span>
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SELECTION & HISTORY SCREEN
  return (
    <div style={styles.container}>
      <div style={styles.mainSelectionRow}>
        {/* Left selector card */}
        <div className="glass-panel" style={styles.selectorCard}>
          <div style={styles.cardHeader}>
            <Award size={28} color="#8b5cf6" />
            <h3 style={{ fontSize: '1.25rem' }}>Configure Aptitude Test</h3>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '25px' }}>
            Choose a subject and difficulty level to test your capability. Tests are timed with 1.5 minutes per question.
          </p>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select 
              className="form-input" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Quantitative Aptitude">Quantitative Aptitude</option>
              <option value="Logical Reasoning">Logical Reasoning</option>
              <option value="Verbal Ability">Verbal Ability</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label className="form-label">Difficulty</label>
            <select 
              className="form-input" 
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="Easy">Easy (1 Mark)</option>
              <option value="Medium">Medium (2 Marks)</option>
              <option value="Hard">Hard (3 Marks)</option>
            </select>
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleStartTest}>
            <Play size={18} />
            <span>Launch Test Arena</span>
          </button>
        </div>

        {/* Right attempts history list */}
        <div className="glass-panel" style={styles.historyCard}>
          <h3 style={{ marginBottom: '15px' }}>Test History Logs</h3>
          <div style={styles.historyScroll}>
            {history.length > 0 ? (
              history.map((h, idx) => (
                <div key={idx} style={styles.historyItem}>
                  <div style={styles.historyMeta}>
                    <span style={{ fontWeight: '600', color: '#fff' }}>{h.details.category || 'Aptitude Test'}</span>
                    <span style={styles.historyDate}>{new Date(h.date).toLocaleDateString()}</span>
                  </div>
                  <div style={styles.historyResults}>
                    <span style={{ color: '#10b981', fontWeight: '600' }}>Score: {h.score}</span>
                    <span style={{ color: '#9ca3af' }}>Accuracy: {h.accuracy}%</span>
                    <span style={{ color: '#6b7280' }}>Time: {formatTime(h.timeTaken)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={styles.emptyText}>No past attempts found. Build confidence by completing a test!</p>
            )}
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
    minHeight: '50vh',
  },
  mainSelectionRow: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  selectorCard: {
    padding: '30px',
    flex: '1 1 350px',
    height: 'fit-content',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
    color: '#fff',
  },
  historyCard: {
    padding: '30px',
    flex: '2 1 450px',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '440px',
  },
  historyScroll: {
    overflowY: 'auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '10px',
  },
  historyItem: {
    padding: '14px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '10px',
  },
  historyMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },
  historyDate: {
    fontSize: '0.8rem',
    color: '#6b7280',
  },
  historyResults: {
    display: 'flex',
    gap: '20px',
    fontSize: '0.85rem',
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    padding: '30px 0',
    fontSize: '0.9rem',
  },
  // Active test arena styles
  testNavbar: {
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    padding: '8px 16px',
    borderRadius: '10px',
  },
  testWorkspace: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap-reverse',
  },
  navigatorPanel: {
    width: '240px',
    padding: '24px',
    height: 'fit-content',
    flexShrink: 0,
  },
  navigatorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '8px',
  },
  navButton: {
    height: '36px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.02)',
    color: '#9ca3af',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  navActive: {
    border: '2px solid #8b5cf6',
    background: 'rgba(139, 92, 246, 0.15)',
    color: '#fff',
  },
  navAttempted: {
    background: 'rgba(6, 182, 212, 0.15)',
    borderColor: '#06b6d4',
    color: '#06b6d4',
  },
  questionPanel: {
    flex: 1,
    padding: '30px',
    minWidth: '300px',
  },
  questionMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: '#9ca3af',
    marginBottom: '20px',
  },
  activeQuestionText: {
    fontSize: '1.15rem',
    fontWeight: '500',
    color: '#fff',
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  activeOptionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '40px',
  },
  optionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  optionCardSelected: {
    background: 'rgba(139, 92, 246, 0.06)',
    borderColor: '#8b5cf6',
  },
  radioCircle: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#8b5cf6',
  },
  radioDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#8b5cf6',
  },
  optionText: {
    fontSize: '0.95rem',
    color: '#f3f4f6',
  },
  controlRow: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '20px',
  },
  // Evaluation screen styles
  resultsHeader: {
    padding: '30px',
  },
  scoreRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '20px',
    marginBottom: '20px',
    color: '#fff',
  },
  statsSummaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
  },
  summaryStatBox: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    padding: '16px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: '0.8rem',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  summaryValue: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
  },
  reviewList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  reviewCard: {
    padding: '24px',
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  reviewNumber: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#8b5cf6',
  },
  correctBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#10b981',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
  incorrectBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#ef4444',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
  questionText: {
    fontSize: '1.05rem',
    color: '#fff',
    marginBottom: '15px',
    lineHeight: '1.5',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '12px',
  },
  reviewOption: {
    padding: '12px 16px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    color: '#9ca3af',
    fontSize: '0.9rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewOptionCorrect: {
    background: 'rgba(16, 185, 129, 0.06)',
    borderColor: '#10b981',
    color: '#fff',
  },
  reviewOptionIncorrect: {
    background: 'rgba(239, 68, 68, 0.06)',
    borderColor: '#ef4444',
    color: '#fff',
  },
};

export default Aptitude;
