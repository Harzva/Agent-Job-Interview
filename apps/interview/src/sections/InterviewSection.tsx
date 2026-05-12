import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, Brain, Code, Database, Target, Server, Users, CheckCircle2, XCircle, Clock, ArrowRight, RotateCcw, X, Filter } from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import type { Question, ChoiceQuestion, InterviewMode } from '@/types';

const iconMap: Record<string, React.ReactNode> = {
  Brain: <Brain size={16} />,
  Code: <Code size={16} />,
  Database: <Database size={16} />,
  Target: <Target size={16} />,
  Server: <Server size={16} />,
  Users: <Users size={16} />,
};

const categoryLabels: Record<string, string> = {
  algo_rl: '算法研究员',
  engineering: '全栈工程师',
  data_strategy: '数据策略',
  product: '产品经理',
  system: '系统设计',
  behavior: '行为面试',
};

interface Props {
  questions: Record<string, Question[]>;
  choiceQuestions: ChoiceQuestion[];
  interviewModes: InterviewMode[];
  jobFilter?: string[] | null;
  onClearJobFilter?: () => void;
}

type ViewMode = 'qa' | 'choice' | 'mock';

export default function InterviewSection({ questions, choiceQuestions, interviewModes, jobFilter, onClearJobFilter }: Props) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('qa');
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set());
  const [expandedFollowUps, setExpandedFollowUps] = useState<Set<string>>(new Set());
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('interview-answered') || '[]')); }
    catch { return new Set(); }
  });

  // Choice mode state
  const [choiceAnswers, setChoiceAnswers] = useState<Record<string, { selected: number; correct: boolean }>>({});
  const [choiceScore, setChoiceScore] = useState(0);

  // Mock interview state
  const [mockActive, setMockActive] = useState(false);
  const [mockIndex, setMockIndex] = useState(0);
  const [mockRevealed, setMockRevealed] = useState(false);
  const [mockAnsweredIds, setMockAnsweredIds] = useState<Set<string>>(new Set());
  const [mockTimer, setMockTimer] = useState(0);

  // Handle job filter from positions section
  useEffect(() => {
    if (jobFilter && jobFilter.length > 0) {
      setActiveCategory('all');
      setSearchQuery('');
      setViewMode('qa');
    }
  }, [jobFilter]);

  // Reset display count when category or search changes
  useEffect(() => {
    setDisplayCount(30);
  }, [activeCategory, searchQuery, jobFilter]);

  useEffect(() => {
    localStorage.setItem('interview-answered', JSON.stringify([...answeredIds]));
  }, [answeredIds]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (mockActive && !mockRevealed) {
      interval = setInterval(() => setMockTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [mockActive, mockRevealed]);

  const allQuestions = useMemo(() => {
    const result: Question[] = [];
    Object.values(questions).forEach(arr => result.push(...arr));
    return result;
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    let qs: Question[];
    if (jobFilter && jobFilter.length > 0) {
      qs = [];
      jobFilter.forEach(cat => {
        if (questions[cat]) qs.push(...questions[cat]);
      });
    } else {
      qs = activeCategory === 'all' ? allQuestions : (questions[activeCategory] || []);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      qs = qs.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.question.toLowerCase().includes(q)
      );
    }
    return qs;
  }, [activeCategory, searchQuery, allQuestions, questions, jobFilter]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allQuestions.length };
    interviewModes.forEach(m => { counts[m.id] = (questions[m.id] || []).length; });
    return counts;
  }, [allQuestions, questions, interviewModes]);

  const totalQuestions = allQuestions.length;
  const answeredCount = answeredIds.size;

  // Pagination for Q&A mode
  const [displayCount, setDisplayCount] = useState(30);
  const paginatedQuestions = filteredQuestions.slice(0, displayCount);
  const hasMore = displayCount < filteredQuestions.length;

  const toggleAnswer = (id: string) => {
    setExpandedAnswers(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
    if (!answeredIds.has(id)) {
      setAnsweredIds(prev => new Set([...prev, id]));
    }
  };

  const handleChoiceSelect = (questionId: string, optionIndex: number, correctOption: number) => {
    if (choiceAnswers[questionId]) return;
    const isCorrect = optionIndex === correctOption;
    setChoiceAnswers(prev => ({ ...prev, [questionId]: { selected: optionIndex, correct: isCorrect } }));
    if (isCorrect) setChoiceScore(s => s + 1);
  };

  // Mock interview
  const mockQuestions = useMemo(() => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(10, shuffled.length));
  }, [allQuestions, mockActive]);

  const startMock = () => {
    setMockActive(true);
    setMockIndex(0);
    setMockRevealed(false);
    setMockAnsweredIds(new Set());
    setMockTimer(0);
  };

  const exitMock = () => {
    setMockActive(false);
  };

  const nextMockQuestion = () => {
    if (mockIndex < mockQuestions.length - 1) {
      setMockIndex(i => i + 1);
      setMockRevealed(false);
      setMockTimer(0);
    } else {
      setMockActive(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <section id="interview" className="py-16 md:py-24 bg-[#0B0F1A]">
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="font-display font-semibold text-[28px] md:text-[40px] text-[#F8FAFC] mb-2">
            {totalQuestions} 道面试真题
          </h2>
          <p className="text-[#94A3B8] text-sm md:text-base">
            覆盖 6 大类别，逐题攻克
          </p>
        </motion.div>

        {/* Job Filter Banner */}
        <AnimatePresence>
          {jobFilter && jobFilter.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-[rgba(14,165,233,0.08)] border border-[rgba(14,165,233,0.2)] rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Filter size={16} className="text-[#0EA5E9]" />
                <div>
                  <span className="text-sm text-[#F8FAFC]">
                    当前显示岗位专属题目
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {jobFilter.map(cat => (
                      <span key={cat} className="text-[10px] px-2 py-0.5 rounded-md bg-[rgba(14,165,233,0.15)] text-[#0EA5E9]">
                        {categoryLabels[cat] || cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={onClearJobFilter}
                className="flex items-center gap-1 text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors px-3 py-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.05)]"
              >
                <X size={14} />
                清除筛选
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {!mockActive ? (
          <>
            {/* Search + Stats */}
            <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="text"
                  placeholder="搜索面试题关键词..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 bg-[#111827] border border-[#1E293B] rounded-xl text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[rgba(14,165,233,0.15)] transition-all"
                />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#94A3B8]">已掌握</span>
                <span className="font-mono font-bold text-[#10B981]">{answeredCount}</span>
                <span className="text-[#64748B]">/ {totalQuestions}</span>
                <div className="w-24 h-2 bg-[#1E293B] rounded-full ml-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#10B981] to-[#0EA5E9] rounded-full transition-all duration-500"
                    style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === 'all'
                    ? 'bg-[rgba(14,165,233,0.15)] text-[#0EA5E9] border-b-2 border-[#0EA5E9]'
                    : 'text-[#64748B] hover:text-[#94A3B8]'
                }`}
              >
                全部 ({categoryCounts.all || 0})
              </button>
              {interviewModes.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setActiveCategory(mode.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeCategory === mode.id
                      ? 'bg-[rgba(14,165,233,0.15)] text-[#0EA5E9] border-b-2 border-[#0EA5E9]'
                      : 'text-[#64748B] hover:text-[#94A3B8]'
                  }`}
                >
                  {iconMap[mode.icon]}
                  {mode.name} ({categoryCounts[mode.id] || 0})
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 mb-6">
              {[
                { key: 'qa' as ViewMode, label: '问答题模式' },
                { key: 'choice' as ViewMode, label: '选择题模式' },
                { key: 'mock' as ViewMode, label: '模拟面试' },
              ].map(mode => (
                <button
                  key={mode.key}
                  onClick={() => {
                    setViewMode(mode.key);
                    if (mode.key === 'mock') startMock();
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === mode.key
                      ? mode.key === 'mock'
                        ? 'bg-[rgba(139,92,246,0.2)] text-[#8B5CF6] border border-[#8B5CF6]/30'
                        : 'bg-[rgba(14,165,233,0.15)] text-[#0EA5E9]'
                      : 'bg-[#151D2B] text-[#94A3B8] border border-[#1E293B] hover:border-[rgba(14,165,233,0.3)]'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Q&A Mode */}
            {viewMode === 'qa' && (
              <div className="space-y-4">
                {paginatedQuestions.map((q, i) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.5) }}
                    className="bg-[#151D2B] border border-[#1E293B] rounded-2xl p-5 transition-all duration-300 hover:border-[rgba(14,165,233,0.2)]"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {answeredIds.has(q.id) && (
                        <CheckCircle2 size={16} className="text-[#10B981] mt-1 shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[rgba(14,165,233,0.1)] text-[#0EA5E9] font-medium">
                            {q.category}
                          </span>
                          <span className="text-[10px] text-[#64748B]">#{q.number}</span>
                        </div>
                        <h3 className="font-heading font-semibold text-sm md:text-base text-[#F8FAFC] leading-snug">
                          <MarkdownRenderer content={q.title} />
                        </h3>
                      </div>
                    </div>

                    <div className="text-[#94A3B8] text-sm leading-relaxed mb-4 pl-0 md:pl-7">
                      <MarkdownRenderer content={q.question} />
                    </div>

                    <button
                      onClick={() => toggleAnswer(q.id)}
                      className="flex items-center gap-1.5 text-sm text-[#0EA5E9] hover:text-[#06B6D4] transition-colors mb-3"
                    >
                      {expandedAnswers.has(q.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {expandedAnswers.has(q.id) ? '收起答案' : '查看答案'}
                    </button>

                    <AnimatePresence>
                      {expandedAnswers.has(q.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-[#111827] rounded-xl p-5 mb-3">
                            <h4 className="text-xs font-medium text-[#10B981] mb-3">参考答案</h4>
                            <div className="text-[#94A3B8] text-sm leading-loose">
                              <MarkdownRenderer content={q.answer} />
                            </div>
                          </div>

                          {q.followUp && (
                            <div className="mt-3">
                              <button
                                onClick={() => {
                                  setExpandedFollowUps(prev => {
                                    const next = new Set(prev);
                                    if (next.has(q.id)) next.delete(q.id); else next.add(q.id);
                                    return next;
                                  });
                                }}
                                className="flex items-center gap-1.5 text-sm text-[#F59E0B] hover:text-[#F59E0B]/80 transition-colors mb-2"
                              >
                                {expandedFollowUps.has(q.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                追问
                              </button>
                              <AnimatePresence>
                                {expandedFollowUps.has(q.id) && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.15)] rounded-xl p-5">
                                      <div className="text-[#94A3B8] text-sm leading-loose">
                                        <MarkdownRenderer content={q.followUp} />
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}

                {filteredQuestions.length > 20 && (
                  <div className="text-center text-sm text-[#64748B] pt-4">
                    还有 {filteredQuestions.length - 20} 道题，请使用搜索或分类筛选查看更多
                  </div>
                )}

                {filteredQuestions.length === 0 && (
                  <div className="text-center text-[#64748B] py-12">
                    未找到匹配的面试题
                  </div>
                )}

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => setDisplayCount(prev => prev + 30)}
                      className="px-6 py-2.5 rounded-xl bg-[#151D2B] border border-[#1E293B] text-[#94A3B8] text-sm hover:border-[rgba(14,165,233,0.4)] hover:text-[#0EA5E9] transition-all flex items-center gap-2"
                    >
                      加载更多 ({filteredQuestions.length - displayCount} 道剩余)
                      <ChevronDown size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Choice Mode */}
            {viewMode === 'choice' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm">
                    <span className="text-[#94A3B8]">得分: </span>
                    <span className="font-mono font-bold text-[#10B981]">{choiceScore}</span>
                    <span className="text-[#64748B]"> / {choiceQuestions.length}</span>
                  </div>
                  <button
                    onClick={() => { setChoiceAnswers({}); setChoiceScore(0); }}
                    className="flex items-center gap-1 text-xs text-[#64748B] hover:text-[#0EA5E9] transition-colors"
                  >
                    <RotateCcw size={12} />
                    重置
                  </button>
                </div>

                <div className="space-y-6">
                  {choiceQuestions.map((q, i) => {
                    const answer = choiceAnswers[q.id];
                    return (
                      <motion.div
                        key={q.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-[#151D2B] border border-[#1E293B] rounded-2xl p-5"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[rgba(139,92,246,0.1)] text-[#8B5CF6] font-medium">
                            选择题
                          </span>
                          <span className="text-[10px] text-[#64748B]">#{i + 1}</span>
                        </div>
                        <p className="text-[#F8FAFC] text-sm font-medium mb-4">{q.question}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {q.options.map((opt, j) => {
                            const letter = ['A', 'B', 'C', 'D'][j];
                            let status = 'default';
                            if (answer) {
                              if (j === q.correctOption) status = 'correct';
                              else if (j === answer.selected && !answer.correct) status = 'wrong';
                              else status = 'dimmed';
                            }

                            return (
                              <button
                                key={j}
                                onClick={() => handleChoiceSelect(q.id, j, q.correctOption)}
                                disabled={!!answer}
                                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                                  status === 'default'
                                    ? 'border-[#1E293B] bg-[#111827] hover:border-[rgba(14,165,233,0.3)]'
                                    : status === 'correct'
                                    ? 'border-[#10B981] bg-[rgba(16,185,129,0.1)]'
                                    : status === 'wrong'
                                    ? 'border-[#EF4444] bg-[rgba(239,68,68,0.1)]'
                                    : 'border-[#1E293B] bg-[#111827] opacity-50'
                                }`}
                              >
                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                  status === 'default'
                                    ? 'bg-[#1E293B] text-[#94A3B8]'
                                    : status === 'correct'
                                    ? 'bg-[#10B981] text-white'
                                    : status === 'wrong'
                                    ? 'bg-[#EF4444] text-white'
                                    : 'bg-[#1E293B] text-[#64748B]'
                                }`}>
                                  {status === 'correct' ? <CheckCircle2 size={14} /> : status === 'wrong' ? <XCircle size={14} /> : letter}
                                </span>
                                <span className={`text-sm ${
                                  status === 'dimmed' ? 'text-[#64748B]' : 'text-[#F8FAFC]'
                                }`}>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        <AnimatePresence>
                          {answer && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 bg-[#111827] rounded-xl p-4">
                                <h4 className="text-xs font-medium text-[#0EA5E9] mb-1">解析</h4>
                                <p className="text-[#94A3B8] text-sm"><MarkdownRenderer content={q.answer} /></p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {viewMode === 'mock' && (
              <div className="text-center py-12">
                <p className="text-[#94A3B8] mb-4">点击上方「模拟面试」按钮开始模拟面试</p>
                <button
                  onClick={startMock}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#0EA5E9] text-white font-medium text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  开始模拟面试
                </button>
              </div>
            )}
          </>
        ) : (
          /* Mock Interview Overlay */
          <div className="bg-[rgba(139,92,246,0.03)] border border-[rgba(139,92,246,0.15)] rounded-3xl p-6 md:p-10">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#8B5CF6] font-medium">
                  第 {mockIndex + 1} / {mockQuestions.length} 题
                </span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-[#94A3B8]">
                    <Clock size={14} />
                    {formatTime(mockTimer)}
                  </div>
                  <button
                    onClick={exitMock}
                    className="text-xs text-[#64748B] hover:text-[#EF4444] transition-colors"
                  >
                    退出
                  </button>
                </div>
              </div>
              <div className="w-full h-2 bg-[#1E293B] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#0EA5E9] rounded-full transition-all duration-300"
                  style={{ width: `${((mockIndex + 1) / mockQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <span className="text-[10px] px-2 py-0.5 rounded bg-[rgba(139,92,246,0.1)] text-[#8B5CF6] font-medium mb-3 inline-block">
                {mockQuestions[mockIndex]?.category}
              </span>
              <h3 className="font-heading font-semibold text-lg md:text-xl text-[#F8FAFC] mb-4">
                {mockQuestions[mockIndex]?.title}
              </h3>
              <p className="text-[#94A3B8] text-sm md:text-base leading-relaxed">
                {mockQuestions[mockIndex]?.question}
              </p>
            </div>

            {/* Answer */}
            <AnimatePresence>
              {mockRevealed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="bg-[#151D2B] rounded-2xl p-6 border border-[#1E293B]">
                    <h4 className="text-xs font-medium text-[#10B981] mb-3">参考答案</h4>
                    <div className="text-[#94A3B8] text-sm leading-loose">
                      <MarkdownRenderer content={mockQuestions[mockIndex]?.answer || ''} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex gap-3">
              {!mockRevealed ? (
                <button
                  onClick={() => {
                    setMockRevealed(true);
                    if (mockQuestions[mockIndex]) {
                      setMockAnsweredIds(prev => new Set([...prev, mockQuestions[mockIndex].id]));
                      setAnsweredIds(prev => new Set([...prev, mockQuestions[mockIndex].id]));
                    }
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#0EA5E9] text-white font-medium text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  显示答案
                </button>
              ) : (
                <button
                  onClick={nextMockQuestion}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#0EA5E9] text-white font-medium text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {mockIndex < mockQuestions.length - 1 ? '下一题' : '完成'}
                  <ArrowRight size={14} />
                </button>
              )}
            </div>

            {/* Summary */}
            {mockIndex === mockQuestions.length - 1 && mockRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] rounded-xl"
              >
                <p className="text-sm text-[#10B981]">
                  模拟面试完成！本次共完成 {mockQuestions.length} 题，已掌握 {mockAnsweredIds.size} 道新题目。
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
