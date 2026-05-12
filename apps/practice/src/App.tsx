import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopicPage } from '@/components/TopicPage';
import { DrawMode } from '@/components/DrawMode';
import type { Topic, GlobalMode } from '@/types';
import './App.css';
import './components/styles.css';

function App() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [activeTopic, setActiveTopic] = useState<string>('demand-validation');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());
  const [globalMode, setGlobalMode] = useState<GlobalMode>('topic');
  const [questionMode, setQuestionMode] = useState<'essay' | 'choice'>('essay');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth <= 768) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load data
  useEffect(() => {
    fetch('./topics.json')
      .then(r => r.json())
      .then((data: Topic[]) => {
        setTopics(data);
        // Restore progress
        const saved = localStorage.getItem('agent-interview-progress');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.completed) {
              setCompletedQuestions(new Set(parsed.completed));
            }
          } catch { /* ignore */ }
        }
      })
      .catch(err => console.error('Failed to load topics:', err));
  }, []);

  // Persist progress
  useEffect(() => {
    if (completedQuestions.size > 0) {
      localStorage.setItem('agent-interview-progress', JSON.stringify({
        completed: Array.from(completedQuestions),
        updatedAt: new Date().toISOString(),
      }));
    }
  }, [completedQuestions]);

  const handleToggleQuestion = useCallback((topicId: string, questionId: number) => {
    const key = `${topicId}-${questionId}`;
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleMarkComplete = useCallback((topicId: string, questionId: number) => {
    const key = `${topicId}-${questionId}`;
    setCompletedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleToggleGlobalMode = useCallback((mode: GlobalMode) => {
    setGlobalMode(mode);
    setExpandedQuestions(new Set());
  }, []);

  const currentTopic = topics.find(t => t.id === activeTopic);

  return (
    <div className="app-layout">
      <Sidebar
        topics={topics}
        activeTopic={activeTopic}
        globalMode={globalMode}
        completedQuestions={completedQuestions}
        onSelectTopic={setActiveTopic}
        onToggleGlobalMode={handleToggleGlobalMode}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(v => !v)}
      />
      <main className="main-content">
        {globalMode === 'topic' && currentTopic ? (
          <TopicPage
            topic={currentTopic}
            expandedQuestions={expandedQuestions}
            completedQuestions={completedQuestions}
            questionMode={questionMode}
            onToggleQuestion={handleToggleQuestion}
            onMarkComplete={handleMarkComplete}
            onQuestionModeChange={setQuestionMode}
          />
        ) : globalMode === 'draw' && topics.length > 0 ? (
          <DrawMode
            topics={topics}
            completedQuestions={completedQuestions}
            onMarkComplete={handleMarkComplete}
          />
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-muted)',
            fontSize: 14,
          }}>
            加载中...
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
