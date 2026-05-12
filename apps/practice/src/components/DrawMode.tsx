import { useState, useEffect, useCallback, useRef } from 'react';
import type { Topic, InterviewQuestion } from '@/types';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-javascript';

interface DrawModeProps {
  topics: Topic[];
  completedQuestions: Set<string>;
  onMarkComplete: (topicId: string, questionId: number) => void;
}

interface DrawnCard {
  topic: Topic;
  question: InterviewQuestion;
  mode: 'essay' | 'choice';
}

const difficultyLabels: Record<string, { text: string; color: string }> = {
  easy: { text: '简单', color: '#10B981' },
  medium: { text: '中等', color: '#F59E0B' },
  hard: { text: '困难', color: '#DC2626' },
};

export function DrawMode({ topics, completedQuestions, onMarkComplete }: DrawModeProps) {
  const [drawnCard, setDrawnCard] = useState<DrawnCard | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [mode, setMode] = useState<'essay' | 'choice'>('essay');
  const [history, setHistory] = useState<Array<{ topicId: string; qid: number; known: boolean; topicTitle: string }>>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  const drawQuestion = useCallback(() => {
    setIsShuffling(true);
    setShowAnswer(false);
    setSelectedChoice(null);
    setTimeout(() => {
      const allQuestions = topics.flatMap(topic =>
        topic.questions.map(q => ({ topic, question: q }))
      );
      const unanswered = allQuestions.filter(
        ({ topic, question }) => !completedQuestions.has(`${topic.id}-${question.id}`)
      );
      const pool = unanswered.length > 0 ? unanswered : allQuestions;
      const randomItem = pool[Math.floor(Math.random() * pool.length)];
      setDrawnCard({ topic: randomItem.topic, question: randomItem.question, mode });
      setIsShuffling(false);
    }, 600);
  }, [topics, completedQuestions, mode]);

  const handleKnown = useCallback(() => {
    if (!drawnCard) return;
    onMarkComplete(drawnCard.topic.id, drawnCard.question.id);
    setCorrectCount(c => c + 1);
    setHistory(h => [...h, {
      topicId: drawnCard.topic.id,
      qid: drawnCard.question.id,
      known: true,
      topicTitle: drawnCard.topic.title,
    }]);
    drawQuestion();
  }, [drawnCard, onMarkComplete, drawQuestion]);

  const handleUnknown = useCallback(() => {
    if (!drawnCard) return;
    setWrongCount(w => w + 1);
    setHistory(h => [...h, {
      topicId: drawnCard.topic.id,
      qid: drawnCard.question.id,
      known: false,
      topicTitle: drawnCard.topic.title,
    }]);
    setShowAnswer(true);
  }, [drawnCard]);

  const handleSelectChoice = useCallback((idx: number) => {
    if (selectedChoice !== null) return;
    setSelectedChoice(idx);
    if (idx === drawnCard?.question.choice.correct) {
      onMarkComplete(drawnCard.topic.id, drawnCard.question.id);
      setCorrectCount(c => c + 1);
      setHistory(h => [...h, {
        topicId: drawnCard.topic.id,
        qid: drawnCard.question.id,
        known: true,
        topicTitle: drawnCard.topic.title,
      }]);
    }
  }, [selectedChoice, drawnCard, onMarkComplete]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (!drawnCard) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          drawQuestion();
        }
        return;
      }

      if (mode === 'choice' && selectedChoice === null) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 4) {
          e.preventDefault();
          handleSelectChoice(num - 1);
          return;
        }
      }

      if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        handleKnown();
      } else if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        handleUnknown();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        drawQuestion();
      } else if (e.key === ' ') {
        e.preventDefault();
        if (!showAnswer && selectedChoice !== null) {
          setShowAnswer(true);
        } else {
          drawQuestion();
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [drawnCard, mode, selectedChoice, showAnswer, drawQuestion, handleKnown, handleUnknown, handleSelectChoice]);

  // Highlight code when answer shown
  useEffect(() => {
    if (showAnswer && answerRef.current) {
      Prism.highlightAllUnder(answerRef.current);
    }
  }, [showAnswer]);

  if (!drawnCard) {
    return (
      <div className="draw-mode">
        <div className="draw-initial">
          <div className="draw-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <h2>随机抽卡模式</h2>
          <p>随机抽取一道面试题，检验你的掌握程度</p>
          <div className="draw-hint">按 <kbd style={{ padding: '2px 8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' }}>Space</kbd> 开始抽卡</div>
          <div className="draw-actions">
            <button className="draw-btn primary" onClick={drawQuestion}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              开始抽卡
            </button>
          </div>
        </div>

        {history.length > 0 && (
          <div className="draw-history">
            <h4>历史记录</h4>
            <div className="draw-history-list">
              {[...history].reverse().map((h, idx) => (
                <div key={idx} className={`draw-history-item ${h.known ? 'correct' : 'wrong'}`}>
                  <div className="draw-history-dot" />
                  <span className="draw-history-topic">{h.topicTitle}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const isCompleted = completedQuestions.has(`${drawnCard.topic.id}-${drawnCard.question.id}`);
  const diff = difficultyLabels[drawnCard.question.difficulty];
  const showReveal = selectedChoice !== null || showAnswer;

  return (
    <div className="draw-mode">
      {/* Stats */}
      <div className="draw-stats">
        <div className="draw-stat">
          <div className="draw-stat-num" style={{ color: '#10B981' }}>{correctCount}</div>
          <div className="draw-stat-label">已掌握</div>
        </div>
        <div className="draw-stat">
          <div className="draw-stat-num" style={{ color: '#EF4444' }}>{wrongCount}</div>
          <div className="draw-stat-label">需复习</div>
        </div>
        <div className="draw-stat">
          <div className="draw-stat-num" style={{ color: 'var(--text-muted)' }}>{correctCount + wrongCount}</div>
          <div className="draw-stat-label">已抽</div>
        </div>
      </div>

      {/* Mode Switch */}
      <div className="global-mode-switch" style={{ maxWidth: 760, width: '100%', padding: 0, border: 'none' }}>
        <button className={`mode-btn ${mode === 'essay' ? 'active' : ''}`} onClick={() => { setMode('essay'); setShowAnswer(false); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg>
          简答模式
        </button>
        <button className={`mode-btn ${mode === 'choice' ? 'active' : ''}`} onClick={() => { setMode('choice'); setSelectedChoice(null); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          选择模式
        </button>
      </div>

      {/* Card */}
      <div className={`draw-card ${isShuffling ? 'shuffling' : ''}`}>
        {/* Header */}
        <div className="draw-card-header" style={{ borderColor: drawnCard.topic.color }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="draw-card-topic" style={{ color: drawnCard.topic.color }}>
              {drawnCard.topic.title}
            </span>
            <span className="difficulty-badge" style={{ background: `${diff.color}20`, color: diff.color, fontSize: 11 }}>
              {diff.text}
            </span>
          </div>
          <div className="draw-card-badges">
            {isCompleted && (
              <span className="completed-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                已完成
              </span>
            )}
          </div>
        </div>

        {/* Question */}
        <div className="draw-card-question">{drawnCard.question.question}</div>

        {/* Choice Mode */}
        {mode === 'choice' && (
          <div className="draw-choice-options">
            {drawnCard.question.choice.choices.map((opt, idx) => (
              <button
                key={idx}
                className={`draw-choice-btn ${
                  selectedChoice !== null
                    ? idx === drawnCard.question.choice.correct
                      ? 'correct'
                      : idx === selectedChoice
                        ? 'wrong'
                        : ''
                    : ''
                }`}
                onClick={() => handleSelectChoice(idx)}
                disabled={selectedChoice !== null}
              >
                <span className="choice-letter" style={{ fontSize: 14, width: 32, height: 32 }}>{String.fromCharCode(65 + idx)}</span>
                <span>{opt}</span>
              </button>
            ))}
            {selectedChoice !== null && (
              <div className="draw-card-explanation" style={{ marginTop: 8, animation: 'fadeSlideIn 0.3s ease' }}>
                {selectedChoice === drawnCard.question.choice.correct ? (
                  <><strong style={{ color: '#10B981' }}>✅ 正确！</strong> {drawnCard.question.choice.explanation}</>
                ) : (
                  <><strong style={{ color: '#EF4444' }}>❌ 错误</strong> {drawnCard.question.choice.explanation}</>
                )}
              </div>
            )}
          </div>
        )}

        {/* Answer Section */}
        {(mode === 'essay' || showReveal) && (
          <div className="draw-card-answer answer-renderer" ref={answerRef}>
            {drawnCard.question.purpose && (
              <div className="sec-purpose">
                <h5>考察目的</h5>
                <p>{drawnCard.question.purpose}</p>
              </div>
            )}
            <div className="answer-text" dangerouslySetInnerHTML={{ __html: drawnCard.question.answer }} />
            <div className="tags-section">
              {drawnCard.question.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="draw-actions">
        <button className="draw-btn success" onClick={handleKnown} title="快捷键: K">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          掌握了
        </button>
        <button className="draw-btn danger" onClick={handleUnknown} title="快捷键: J">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          需复习
        </button>
        <button className="draw-btn secondary" onClick={drawQuestion} title="快捷键: N">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
          下一题
        </button>
      </div>

      {/* Keyboard Hints */}
      <div className="keyboard-hint">
        <span><kbd>K</kbd> 掌握</span>
        <span><kbd>J</kbd> 复习</span>
        <span><kbd>N</kbd> 下一题</span>
        {mode === 'choice' && <span><kbd>1-4</kbd> 选择</span>}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="draw-history">
          <h4>最近记录</h4>
          <div className="draw-history-list">
            {[...history].reverse().slice(0, 8).map((h, idx) => (
              <div key={idx} className={`draw-history-item ${h.known ? 'correct' : 'wrong'}`}>
                <div className="draw-history-dot" />
                <span className="draw-history-topic">{h.topicTitle}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
