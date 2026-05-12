import { useState } from 'react';
import { ProgressBar } from './ProgressBar';
import { Menu, BookOpen, Sparkles, PanelLeftClose } from 'lucide-react';
import type { Topic, GlobalMode } from '@/types';

interface SidebarProps {
  topics: Topic[];
  activeTopic: string;
  globalMode: GlobalMode;
  completedQuestions: Set<string>;
  onSelectTopic: (id: string) => void;
  onToggleGlobalMode: (mode: GlobalMode) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({
  topics,
  activeTopic,
  globalMode,
  completedQuestions,
  onSelectTopic,
  onToggleGlobalMode,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

  const totalQuestions = topics.reduce((sum, t) => sum + t.questions.length, 0);
  const totalCompleted = Array.from(completedQuestions).filter(key => {
    const [topicId] = key.split('-');
    return topics.some(t => t.id === topicId);
  }).length;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="mobile-menu-btn"
        onClick={onToggle}
        title="Toggle sidebar"
      >
        {isOpen ? <PanelLeftClose size={18} /> : <Menu size={18} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar-container ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar">
          {/* Header */}
          <div className="sidebar-header">
            <div className="logo">
              <div className="logo-icon">AI</div>
              <div>
                <div className="logo-text">Agent面试宝典</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>14个维度 · 700题</div>
              </div>
            </div>
            <button className="close-btn" onClick={onToggle}>
              <PanelLeftClose size={18} />
            </button>
          </div>

          {/* Stats */}
          <div className="sidebar-stats">
            <div className="stat-item">
              <span className="stat-num">{Math.round((totalCompleted / totalQuestions) * 100)}%</span>
              <span className="stat-label">总进度</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">{totalCompleted}</span>
              <span className="stat-label">已完成</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">{totalQuestions - totalCompleted}</span>
              <span className="stat-label">待学习</span>
            </div>
          </div>

          {/* Global Mode Switch */}
          <div className="global-mode-switch">
            <button
              className={`mode-btn ${globalMode === 'topic' ? 'active' : ''}`}
              onClick={() => onToggleGlobalMode('topic')}
            >
              <BookOpen size={13} /> 专题学习
            </button>
            <button
              className={`mode-btn ${globalMode === 'draw' ? 'active' : ''}`}
              onClick={() => onToggleGlobalMode('draw')}
            >
              <Sparkles size={13} /> 随机抽卡
            </button>
          </div>

          {/* Nav */}
          <nav className="sidebar-nav">
            <div className="nav-label">专题列表</div>
            {topics.map((topic, index) => {
              const isActive = activeTopic === topic.id;
              const isHovered = hoveredTopic === topic.id;
              const topicProgress = topic.questions.filter(q =>
                completedQuestions.has(`${topic.id}-${q.id}`)
              ).length;
              const progressPercent = Math.round((topicProgress / topic.questions.length) * 100);

              return (
                <button
                  key={topic.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    onSelectTopic(topic.id);
                    if (window.innerWidth <= 768) onToggle();
                  }}
                  onMouseEnter={() => setHoveredTopic(topic.id)}
                  onMouseLeave={() => setHoveredTopic(null)}
                >
                  {isActive && <div className="nav-indicator" style={{ background: topic.color }} />}
                  <span
                    className="nav-index"
                    style={
                      isActive || isHovered
                        ? { background: topic.color, color: '#fff' }
                        : {}
                    }
                  >
                    {index + 1}
                  </span>
                  <div className="nav-content">
                    <div className="nav-title">
                      <span className="nav-subtitle">{topic.title}</span>
                    </div>
                    <div className="nav-meta">
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {topicProgress}/{topic.questions.length}
                      </span>
                      <span
                        className="nav-progress"
                        style={{
                          color:
                            progressPercent >= 80
                              ? '#10B981'
                              : progressPercent >= 40
                                ? '#F59E0B'
                                : '#EF4444',
                        }}
                      >
                        {progressPercent}%
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="sidebar-footer">
            <ProgressBar
              progress={Math.round((totalCompleted / Math.max(totalQuestions, 1)) * 100)}
              total={totalQuestions}
              completed={totalCompleted}
            />
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onToggle} />}
    </>
  );
}
