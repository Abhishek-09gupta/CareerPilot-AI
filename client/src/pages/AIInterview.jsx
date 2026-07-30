import React, { useState } from 'react';
import api from '../services/api';
import { 
  MessageSquareCode, 
  Send, 
  Award, 
  HelpCircle, 
  Volume2, 
  CheckCircle2,
  RefreshCw,
  Play
} from 'lucide-react';

const AIInterview = () => {
  // Interview Config
  const [company, setCompany] = useState('General');
  const [type, setType] = useState('Technical');
  
  // Interactive Arena
  const [inSession, setInSession] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { questionId: answer }
  const [activeAnswer, setActiveAnswer] = useState('');
  
  // States
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [results, setResults] = useState(null);

  const handleStartSession = async () => {
    setLoading(true);
    setResults(null);
    try {
      const res = await api.generateInterviewQuestions(company, type);
      if (res.success && res.questions.length > 0) {
        setQuestions(res.questions);
        setCurrentIdx(0);
        setUserAnswers({});
        setActiveAnswer('');
        setInSession(true);
      } else {
        alert('Could not generate mock questions. Try again later.');
      }
    } catch (err) {
      alert('Error connecting to Gemini API: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (!activeAnswer.trim()) {
      alert('Please type an answer to proceed.');
      return;
    }
    
    const activeQ = questions[currentIdx];
    setUserAnswers({
      ...userAnswers,
      [activeQ.id]: activeAnswer,
    });
    
    setActiveAnswer('');
    
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Completed last question
      handleSubmitInterview();
    }
  };

  const handleSubmitInterview = async () => {
    setInSession(false);
    setEvaluating(true);

    // Prepare responses format for backend [{ questionId, question, answer }]
    const formattedResponses = questions.map(q => ({
      questionId: q.id,
      question: q.question,
      answer: userAnswers[q.id] || activeAnswer, // fallback if this was the last answer
    }));

    try {
      const res = await api.submitInterviewAnswers(company, type, formattedResponses);
      if (res.success) {
        setResults(res.data);
      } else {
        alert('Failed to evaluate: ' + res.message);
      }
    } catch (err) {
      alert('Error during evaluation: ' + err.message);
    } finally {
      setEvaluating(false);
    }
  };

  const getMetricColor = (val) => {
    if (val >= 80) return '#10b981';
    if (val >= 60) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <RefreshCw className="animate-spin" size={32} color="#8b5cf6" />
        <span style={{ marginLeft: '12px', color: '#9ca3af' }}>Contacting AI Interview Board...</span>
      </div>
    );
  }

  if (evaluating) {
    return (
      <div style={styles.loaderContainer}>
        <RefreshCw className="animate-spin" size={32} color="#8b5cf6" style={{ marginBottom: '15px' }} />
        <h4 style={{ color: '#fff' }}>Analyzing answers using Gemini AI...</h4>
        <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '5px' }}>
          Grading technical knowledge, vocabulary syntax, confidence indices, and suggestion mapping.
        </p>
      </div>
    );
  }

  // INTERVIEW EVALUATION RESULTS
  if (results) {
    return (
      <div style={styles.container}>
        <div style={styles.resultsCard} className="glass-panel animate-fade-in">
          <div style={styles.resultsHeader}>
            <Award size={40} color="#10b981" />
            <div>
              <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>AI Evaluation Complete</h2>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>HR/Technical mockup reviews for {company}</p>
            </div>
          </div>

          <div style={styles.metricGrid}>
            <div style={styles.metricCard}>
              <span style={styles.metricLabel}>Overall Rating</span>
              <span style={{ ...styles.metricValue, color: getMetricColor(results.overallScore) }}>
                {results.overallScore}%
              </span>
            </div>
            <div style={styles.metricCard}>
              <span style={styles.metricLabel}>Communication</span>
              <span style={{ ...styles.metricValue, color: getMetricColor(results.communicationScore) }}>
                {results.communicationScore}%
              </span>
            </div>
            <div style={styles.metricCard}>
              <span style={styles.metricLabel}>Delivery Confidence</span>
              <span style={{ ...styles.metricValue, color: getMetricColor(results.confidenceScore) }}>
                {results.confidenceScore}%
              </span>
            </div>
          </div>

          <div style={styles.tipsSection}>
            <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '10px' }}>Suggested Delivery Improvements</h4>
            <ul style={styles.tipsList}>
              {results.suggestedImprovements.map((tip, idx) => (
                <li key={idx} style={styles.tipItem}>{tip}</li>
              ))}
            </ul>
          </div>

          <button className="btn btn-primary" style={{ marginTop: '10px', width: 'fit-content' }} onClick={() => setResults(null)}>
            Simulate Another Interview
          </button>
        </div>

        {/* Detailed Question Review */}
        <h3 style={{ margin: '30px 0 15px', color: '#fff' }}>Detailed Answer Breakdown</h3>
        <div style={styles.qaBreakdownList}>
          {questions.map((q, idx) => {
            const evaluation = results.questionEvaluations.find(e => e.questionId === q.id);
            const answer = userAnswers[q.id];
            
            return (
              <div key={q.id} className="glass-panel" style={styles.qaItemCard}>
                <div style={styles.qaItemHeader}>
                  <span style={styles.qaItemNum}>Question {idx + 1}</span>
                  {evaluation && (
                    <span style={{ ...styles.qaItemScore, color: getMetricColor(evaluation.correctnessScore) }}>
                      Score: {evaluation.correctnessScore}%
                    </span>
                  )}
                </div>
                
                <h4 style={styles.qaQuestion}>{q.question}</h4>
                
                <div style={styles.qaAnswerBox}>
                  <span style={styles.boxLabel}>Your Response:</span>
                  <p style={styles.boxText}>{answer || '(No response captured)'}</p>
                </div>

                {evaluation && (
                  <div style={styles.qaFeedbackBox}>
                    <span style={{ ...styles.boxLabel, color: '#8b5cf6' }}>AI Feedback:</span>
                    <p style={styles.boxText}>{evaluation.feedback}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ACTIVE INTERVIEW CHAT WORKSPACE
  if (inSession && questions.length > 0) {
    const activeQ = questions[currentIdx];
    const isLastQuestion = currentIdx === questions.length - 1;

    return (
      <div style={styles.container}>
        <div style={styles.chatWrapper}>
          {/* Chat header */}
          <div className="glass-panel" style={styles.chatHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={styles.aiAvatar}>AI</div>
              <div>
                <h4 style={{ color: '#fff' }}>{company} Mock Interviewer</h4>
                <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Category: {type} — Active Session</p>
              </div>
            </div>
            <span style={styles.progressCounter}>
              Question {currentIdx + 1} of {questions.length}
            </span>
          </div>

          {/* Question bubble */}
          <div className="glass-panel animate-fade-in" style={styles.aiBubble}>
            <div style={styles.bubbleHeader}>
              <HelpCircle size={16} color="#8b5cf6" />
              <span>Interviewer prompt</span>
            </div>
            <p style={styles.bubbleText}>{activeQ.question}</p>
            <div style={styles.speakRow}>
              <Volume2 size={16} color="#6b7280" style={{ cursor: 'pointer' }} onClick={() => {
                if ('speechSynthesis' in window) {
                  const speech = new SpeechSynthesisUtterance(activeQ.question);
                  speech.rate = 1.0;
                  window.speechSynthesis.speak(speech);
                }
              }} />
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Listen Question</span>
            </div>
          </div>

          {/* User response card */}
          <div className="glass-panel" style={styles.userResponseCard}>
            <div style={styles.labelRow}>
              <span style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: '600' }}>Your Response</span>
              <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>Be detailed. Mention technologies, roadmaps, and results.</span>
            </div>
            
            <textarea
              className="form-input"
              style={styles.answerTextarea}
              placeholder="Type your response to the interviewer's prompt..."
              value={activeAnswer}
              onChange={(e) => setActiveAnswer(e.target.value)}
            />

            <div style={styles.responseFooter}>
              <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                Press Submit to record answer and load next question.
              </span>
              <button className="btn btn-primary" onClick={handleNextQuestion}>
                <span>{isLastQuestion ? 'Submit Interview' : 'Submit Answer'}</span>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // INTERVIEW SETUP CONFIG
  return (
    <div style={styles.container}>
      <div style={styles.setupCard} className="glass-panel">
        <div style={styles.setupHeader}>
          <MessageSquareCode size={36} color="#8b5cf6" />
          <div>
            <h3 style={{ fontSize: '1.3rem', color: '#fff' }}>AI Mock Interview Board</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '2px' }}>
              Simulate actual HR or Technical placement interviews. Backed by Gemini evaluation models.
            </p>
          </div>
        </div>

        <div style={styles.setupGrid}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Target Company</label>
            <select 
              className="form-input" 
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            >
              <option value="General">General Practice</option>
              <option value="TCS">TCS (Ninja/Digital)</option>
              <option value="Infosys">Infosys</option>
              <option value="Accenture">Accenture</option>
              <option value="Capgemini">Capgemini</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Evaluation Type</label>
            <select 
              className="form-input" 
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="Technical">Technical (Core DSA, OOP, DBMS, Web)</option>
              <option value="HR">HR & Behavioral (Situation, STAR method)</option>
            </select>
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} onClick={handleStartSession}>
          <Play size={18} />
          <span>Launch AI Interview Session</span>
        </button>
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
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
  },
  setupCard: {
    padding: '30px',
    maxWidth: '600px',
    margin: '40px auto',
  },
  setupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '20px',
    marginBottom: '24px',
  },
  setupGrid: {
    display: 'flex',
    gap: '20px',
    marginBottom: '15px',
    flexWrap: 'wrap',
  },
  // Chat viewport styles
  chatWrapper: {
    maxWidth: '720px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  chatHeader: {
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(139, 92, 246, 0.15)',
    color: '#8b5cf6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    border: '1px solid rgba(139, 92, 246, 0.3)',
  },
  progressCounter: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    fontWeight: '600',
  },
  aiBubble: {
    padding: '24px',
    position: 'relative',
    background: 'rgba(139, 92, 246, 0.03)',
    borderColor: 'rgba(139, 92, 246, 0.12)',
  },
  bubbleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.75rem',
    color: '#8b5cf6',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  bubbleText: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#fff',
    lineHeight: '1.6',
  },
  speakRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '15px',
  },
  userResponseCard: {
    padding: '24px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '10px',
  },
  answerTextarea: {
    width: '100%',
    height: '140px',
    resize: 'none',
    padding: '16px',
    fontSize: '0.95rem',
    lineHeight: '1.5',
    background: 'rgba(0,0,0,0.2)',
  },
  responseFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '15px',
  },
  // Evaluation Result styles
  resultsCard: {
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  resultsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '20px',
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '20px',
  },
  metricCard: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: '0.8rem',
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: '6px',
  },
  metricValue: {
    fontSize: '2rem',
    fontWeight: '800',
  },
  tipsSection: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    padding: '20px',
    borderRadius: '12px',
  },
  tipsList: {
    paddingLeft: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  tipItem: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    lineHeight: '1.4',
  },
  qaBreakdownList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  qaItemCard: {
    padding: '24px',
  },
  qaItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  qaItemNum: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#8b5cf6',
  },
  qaItemScore: {
    fontWeight: '700',
    fontSize: '0.85rem',
  },
  qaQuestion: {
    fontSize: '1.05rem',
    color: '#fff',
    marginBottom: '15px',
  },
  qaAnswerBox: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    padding: '14px',
    borderRadius: '8px',
    marginBottom: '10px',
  },
  qaFeedbackBox: {
    background: 'rgba(139, 92, 246, 0.02)',
    border: '1px solid rgba(139, 92, 246, 0.08)',
    padding: '14px',
    borderRadius: '8px',
  },
  boxLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    display: 'block',
    marginBottom: '4px',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  boxText: {
    fontSize: '0.85rem',
    color: '#d1d5db',
    lineHeight: '1.5',
  },
};

export default AIInterview;
