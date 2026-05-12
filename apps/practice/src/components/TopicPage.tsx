import { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle2, Circle, ChevronDown, ListChecks, AlignLeft } from 'lucide-react';
import type { Topic } from '@/types';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';

interface TopicPageProps {
  topic: Topic;
  expandedQuestions: Set<string>;
  completedQuestions: Set<string>;
  questionMode: 'essay' | 'choice';
  onToggleQuestion: (topicId: string, questionId: number) => void;
  onMarkComplete: (topicId: string, questionId: number) => void;
  onQuestionModeChange: (mode: 'essay' | 'choice') => void;
}

const difficultyLabels: Record<string, { text: string; color: string }> = {
  easy: { text: '简单', color: '#10B981' },
  medium: { text: '中等', color: '#F59E0B' },
  hard: { text: '困难', color: '#DC2626' },
};

function AnswerRenderer({ content, purpose }: { content: string; purpose?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      Prism.highlightAllUnder(ref.current);
    }
  }, [content]);

  return (
    <div ref={ref} className="answer-renderer">
      {purpose && (
        <div className="sec-purpose">
          <h5>考察目的</h5>
          <p>{purpose}</p>
        </div>
      )}
      <div className="answer-text" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}

function ChoiceCard({ choice, onComplete }: {
  choice: { question: string; choices: string[]; correct: number; explanation: string };
  onComplete: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = useCallback((idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === choice.correct) {
      onComplete();
    }
  }, [showResult, choice.correct, onComplete]);

  return (
    <div className="choice-card">
      <div className="choice-question">{choice.question}</div>
      <div className="choice-options">
        {choice.choices.map((opt, idx) => (
          <button
            key={idx}
            className={`choice-option ${
              showResult
                ? idx === choice.correct
                  ? 'correct'
                  : idx === selected
                    ? 'wrong'
                    : ''
                : ''
            } ${selected === idx ? 'selected' : ''}`}
            onClick={() => handleSelect(idx)}
            disabled={showResult}
          >
            <span className="choice-letter">{String.fromCharCode(65 + idx)}</span>
            <span className="choice-text">{opt}</span>
          </button>
        ))}
      </div>
      {showResult && (
        <div className="choice-explanation">
          <span className={selected === choice.correct ? 'correct-text' : 'wrong-text'}>
            {selected === choice.correct ? '✅ 回答正确！' : '❌ 回答错误'}
          </span>
          <p>{choice.explanation}</p>
        </div>
      )}
    </div>
  );
}

export function TopicPage({
  topic,
  expandedQuestions,
  completedQuestions,
  questionMode,
  onToggleQuestion,
  onMarkComplete,
  onQuestionModeChange,
}: TopicPageProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const expandedRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const lastExpandedKey = useRef<string | null>(null);

  const filteredQuestions = topic.questions.filter(q =>
    difficultyFilter === 'all' || q.difficulty === difficultyFilter
  );

  const topicProgress = topic.questions.filter(q =>
    completedQuestions.has(`${topic.id}-${q.id}`)
  ).length;

  const handleToggle = useCallback((topicId: string, questionId: number) => {
    const key = `${topicId}-${questionId}`;
    const willExpand = !expandedQuestions.has(key);
    onToggleQuestion(topicId, questionId);

    if (willExpand) {
      lastExpandedKey.current = key;
      setTimeout(() => {
        const el = expandedRefs.current.get(key);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  }, [expandedQuestions, onToggleQuestion]);

  return (
    <div className="topic-page">
      {/* Topic Header */}
      <div className="topic-header" style={{ borderLeftColor: topic.color }}>
        <div className="topic-header-content">
          <div className="topic-title-row">
            <h2 style={{ color: topic.color }}>{topic.title}</h2>
            <span
              className="topic-progress-badge"
              style={{ background: `${topic.color}20`, color: topic.color }}
            >
              {topicProgress}/50 已完成
            </span>
          </div>
          <p className="topic-subtitle">{topic.subtitle}</p>
          <p className="topic-description">{topic.description}</p>
        </div>
      </div>

      <div className="topic-body">
        <div className="questions-section">
          {/* Mode + Filter Bar */}
          <div className="filter-bar">
            <div className="mode-switch">
              <button
                className={`mode-switch-btn ${questionMode === 'essay' ? 'active' : ''}`}
                onClick={() => onQuestionModeChange('essay')}
              >
                <AlignLeft size={14} /> 简答题
              </button>
              <button
                className={`mode-switch-btn ${questionMode === 'choice' ? 'active' : ''}`}
                onClick={() => onQuestionModeChange('choice')}
              >
                <ListChecks size={14} /> 选择题
              </button>
            </div>
            <div className="filter-group">
              <span className="filter-label">难度:</span>
              {[
                { key: 'all', label: '全部' },
                { key: 'easy', label: '简单' },
                { key: 'medium', label: '中等' },
                { key: 'hard', label: '困难' },
              ].map(f => (
                <button
                  key={f.key}
                  className={`filter-btn ${difficultyFilter === f.key ? 'active' : ''}`}
                  onClick={() => setDifficultyFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question List */}
          <div className="question-list">
            {questionMode === 'choice' ? (
              filteredQuestions.map((q) => (
                <ChoiceCard
                  key={q.id}
                  choice={q.choice}
                  onComplete={() => onMarkComplete(topic.id, q.id)}
                />
              ))
            ) : (
              filteredQuestions.map((q, idx) => {
                const key = `${topic.id}-${q.id}`;
                const isExpanded = expandedQuestions.has(key);
                const isCompleted = completedQuestions.has(key);
                const diff = difficultyLabels[q.difficulty];

                return (
                  <div
                    key={q.id}
                    ref={el => { if (el) expandedRefs.current.set(key, el); }}
                    className={`question-card ${isExpanded ? 'expanded' : ''} ${isCompleted ? 'completed' : ''}`}
                  >
                    <div
                      className="question-header"
                      onClick={() => handleToggle(topic.id, q.id)}
                    >
                      <div className="question-left">
                        <span className="question-num">{idx + 1}</span>
                        <div
                          className="question-complete-btn"
                          onClick={(e) => { e.stopPropagation(); onMarkComplete(topic.id, q.id); }}
                          title={isCompleted ? '标记为未完成' : '标记为已完成'}
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={18} style={{ color: '#10B981' }} />
                          ) : (
                            <Circle size={18} style={{ color: 'var(--text-muted)' }} />
                          )}
                        </div>
                        <span className="question-text">{q.question}</span>
                      </div>
                      <div className="question-right">
                        <span
                          className="difficulty-badge"
                          style={{ background: `${diff.color}20`, color: diff.color }}
                        >
                          {diff.text}
                        </span>
                        <ChevronDown
                          size={16}
                          className={`question-chevron ${isExpanded ? 'rotated' : ''}`}
                        />
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="question-body">
                        <AnswerRenderer content={q.answer} purpose={q.purpose} />
                        <div className="tags-section">
                          {q.tags.map(tag => (
                            <span key={tag} className="tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
