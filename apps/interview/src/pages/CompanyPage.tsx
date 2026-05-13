import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Link, useParams } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
  MapPin,
  Moon,
  MousePointerClick,
  Palette,
  SunMedium,
  X,
} from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import type { Company, CompanyJob, InterviewMode, Question } from '@/types';

type ThemeId = 'warm' | 'cool';

interface ThemeTokens {
  id: ThemeId;
  name: string;
  pageBg: string;
  panel: string;
  panelAlt: string;
  panelDeep: string;
  border: string;
  borderStrong: string;
  text: string;
  muted: string;
  dim: string;
  accent: string;
  accent2: string;
  accentSoft: string;
  success: string;
  warning: string;
  hero: string;
  heroVeil: string;
  shadow: string;
}

const themes: Record<ThemeId, ThemeTokens> = {
  warm: {
    id: 'warm',
    name: '暖色',
    pageBg: '#100907',
    panel: '#1B100B',
    panelAlt: '#24140C',
    panelDeep: '#130B08',
    border: 'rgba(251, 146, 60, 0.18)',
    borderStrong: 'rgba(249, 115, 22, 0.48)',
    text: '#FFF7ED',
    muted: '#FED7AA',
    dim: '#A4765E',
    accent: '#F97316',
    accent2: '#FBBF24',
    accentSoft: 'rgba(249, 115, 22, 0.14)',
    success: '#34D399',
    warning: '#FBBF24',
    hero:
      'radial-gradient(ellipse at 84% 26%, rgba(251, 191, 36, 0.36), transparent 31%), radial-gradient(ellipse at 76% 54%, rgba(249, 115, 22, 0.22), transparent 38%), linear-gradient(135deg, #100907 0%, #180B07 52%, #080605 100%)',
    heroVeil:
      'linear-gradient(100deg, transparent 0%, rgba(249, 115, 22, 0.10) 42%, rgba(251, 191, 36, 0.20) 72%, transparent 100%)',
    shadow: '0 20px 60px rgba(249, 115, 22, 0.12)',
  },
  cool: {
    id: 'cool',
    name: '冷色',
    pageBg: '#0B0F1A',
    panel: '#151D2B',
    panelAlt: '#111827',
    panelDeep: '#0B1220',
    border: '#1E293B',
    borderStrong: 'rgba(14, 165, 233, 0.48)',
    text: '#F8FAFC',
    muted: '#94A3B8',
    dim: '#64748B',
    accent: '#0EA5E9',
    accent2: '#06B6D4',
    accentSoft: 'rgba(14, 165, 233, 0.12)',
    success: '#10B981',
    warning: '#F59E0B',
    hero:
      'radial-gradient(ellipse at 82% 28%, rgba(14, 165, 233, 0.28), transparent 34%), linear-gradient(135deg, #0B0F1A 0%, #0F172A 52%, #07111E 100%)',
    heroVeil:
      'linear-gradient(100deg, transparent 0%, rgba(14, 165, 233, 0.08) 42%, rgba(6, 182, 212, 0.17) 72%, transparent 100%)',
    shadow: '0 20px 60px rgba(14, 165, 233, 0.10)',
  },
};

interface Props {
  companies: Company[];
  generalQuestions: Record<string, Question[]>;
  companyQuestions: Record<string, Question[]>;
  interviewModes: InterviewMode[];
}

function QuestionCard({
  q,
  index,
  categoryLabel,
  theme,
}: {
  q: Question;
  index: number;
  categoryLabel: string;
  theme: ThemeTokens;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.035, 0.36) }}
      className="rounded-lg border p-5 transition-all duration-300"
      style={{ backgroundColor: theme.panel, borderColor: theme.border }}
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: theme.accentSoft, color: theme.accent }}>
              {categoryLabel}
            </span>
            <span className="text-[10px]" style={{ color: theme.dim }}>
              #{q.number}
            </span>
          </div>
          <h3 className="font-heading text-sm font-semibold leading-snug md:text-base" style={{ color: theme.text }}>
            <MarkdownRenderer content={q.title} />
          </h3>
        </div>
      </div>

      <div className="mb-4 text-sm leading-relaxed" style={{ color: theme.muted }}>
        <MarkdownRenderer content={q.question} />
      </div>

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="mb-3 flex items-center gap-1.5 text-sm transition-colors"
        style={{ color: theme.accent }}
      >
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {expanded ? '收起答案' : '查看答案'}
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.28 }}
          className="overflow-hidden"
        >
          <div className="mb-3 rounded-lg p-5" style={{ backgroundColor: theme.panelDeep }}>
            <h4 className="mb-3 text-xs font-medium" style={{ color: theme.success }}>
              参考答案
            </h4>
            <div className="text-sm leading-loose" style={{ color: theme.muted }}>
              <MarkdownRenderer content={q.answer} />
            </div>
          </div>

          {q.followUp && (
            <div className="rounded-lg border p-5" style={{ backgroundColor: theme.accentSoft, borderColor: theme.border }}>
              <h4 className="mb-2 text-xs font-medium" style={{ color: theme.warning }}>
                追问
              </h4>
              <div className="text-sm leading-loose" style={{ color: theme.muted }}>
                <MarkdownRenderer content={q.followUp} />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function CompanyPage({ companies, generalQuestions, companyQuestions, interviewModes }: Props) {
  const { companyId } = useParams<{ companyId: string }>();
  const [activeCategory, setActiveCategory] = useState('all');
  const [displayCount, setDisplayCount] = useState(30);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [themeId, setThemeId] = useState<ThemeId>('warm');
  const questionsRef = useRef<HTMLDivElement>(null);

  const company = companies.find(c => c.id === companyId);
  const canSwitchTheme = company?.id === 'deepseek';
  const theme = themes[canSwitchTheme ? themeId : 'cool'];

  const modeNameById = useMemo(
    () => Object.fromEntries(interviewModes.map(mode => [mode.id, mode.name])) as Record<string, string>,
    [interviewModes],
  );

  useEffect(() => {
    setActiveCategory('all');
    setDisplayCount(30);
    setSelectedJobId(null);
    setThemeId(companyId === 'deepseek' ? 'warm' : 'cool');
    window.scrollTo(0, 0);
  }, [companyId]);

  const allQuestions = useMemo(() => {
    if (!company) return [];
    const qs: Question[] = [];

    if (company.id === 'deepseek') {
      Object.values(generalQuestions).forEach(arr => qs.push(...arr));
    } else {
      qs.push(...(companyQuestions[company.id] || []));
    }

    return qs;
  }, [company, generalQuestions, companyQuestions]);

  const selectedJob = useMemo(() => {
    if (!company || !selectedJobId) return null;
    return company.jobs.find(job => job.id === selectedJobId) || null;
  }, [company, selectedJobId]);

  const jobScopedQuestions = useMemo(() => {
    const relatedCategories = selectedJob?.questionCategories || [];
    if (!relatedCategories.length) return allQuestions;
    return allQuestions.filter(q => relatedCategories.includes(q.category));
  }, [allQuestions, selectedJob]);

  const filteredQuestions = useMemo(() => {
    if (activeCategory === 'all') return jobScopedQuestions;
    return jobScopedQuestions.filter(q => q.category === activeCategory);
  }, [activeCategory, jobScopedQuestions]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: jobScopedQuestions.length };
    interviewModes.forEach(mode => {
      counts[mode.id] = jobScopedQuestions.filter(q => q.category === mode.id).length;
    });
    return counts;
  }, [jobScopedQuestions, interviewModes]);

  const visibleModes = useMemo(() => {
    if (!selectedJob) return interviewModes;
    return interviewModes.filter(mode => (categoryCounts[mode.id] || 0) > 0);
  }, [categoryCounts, interviewModes, selectedJob]);

  const paginatedQuestions = filteredQuestions.slice(0, displayCount);
  const hasMore = displayCount < filteredQuestions.length;

  const selectJob = (job: CompanyJob) => {
    const nextJobId = selectedJobId === job.id ? null : job.id;
    setSelectedJobId(nextJobId);
    setActiveCategory('all');
    setDisplayCount(30);

    if (nextJobId) {
      window.requestAnimationFrame(() => {
        questionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };

  const clearJobFilter = () => {
    setSelectedJobId(null);
    setActiveCategory('all');
    setDisplayCount(30);
  };

  const onJobKeyDown = (event: KeyboardEvent<HTMLElement>, job: CompanyJob) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectJob(job);
    }
  };

  if (!company) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#0B0F1A]">
        <div className="text-center">
          <p className="mb-4 text-[#94A3B8]">公司未找到</p>
          <Link to="/" className="text-sm text-[#0EA5E9] hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh]" style={{ backgroundColor: theme.pageBg }}>
      <section className="relative overflow-hidden pb-12 pt-16" style={{ background: theme.hero }}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-[-12%] hidden w-[58%] md:block" style={{ background: theme.heroVeil, filter: 'blur(18px)' }} />

        <div className="relative mx-auto max-w-[1280px] px-6 pt-12">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-sm transition-colors"
              style={{ color: theme.muted }}
            >
              <ArrowLeft size={14} />
              返回首页
            </Link>

            {canSwitchTheme && (
              <div className="inline-flex w-fit items-center gap-1 rounded-lg border p-1" style={{ backgroundColor: theme.panelDeep, borderColor: theme.border }}>
                <span className="inline-flex items-center gap-1 px-2 text-xs" style={{ color: theme.dim }}>
                  <Palette size={13} />
                  主题
                </span>
                {(['warm', 'cool'] as ThemeId[]).map(option => {
                  const Icon = option === 'warm' ? SunMedium : Moon;
                  const active = themeId === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setThemeId(option)}
                      className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: active ? theme.accentSoft : 'transparent',
                        color: active ? theme.accent : theme.muted,
                      }}
                    >
                      <Icon size={13} />
                      {themes[option].name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-4 flex items-center gap-4">
              <span className="text-5xl">{company.logo}</span>
              <div>
                <h1 className="font-display text-[28px] font-bold md:text-[44px]" style={{ color: theme.text }}>
                  {company.name}
                </h1>
                <p className="text-sm" style={{ color: theme.muted }}>
                  {company.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5" style={{ color: theme.muted }}>
                <Briefcase size={14} style={{ color: theme.accent }} />
                <span>{company.jobs.length} 个岗位</span>
              </div>
              <div className="flex items-center gap-1.5" style={{ color: theme.muted }}>
                <BookOpen size={14} style={{ color: theme.accent }} />
                <span>{company.questionCount} 道面试题</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8" style={{ backgroundColor: theme.pageBg }}>
        <div className="mx-auto max-w-[1280px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <h2 className="font-display text-xl font-semibold md:text-2xl" style={{ color: theme.text }}>
                招聘岗位
              </h2>
              <p className="mt-2 text-sm" style={{ color: theme.muted }}>
                点击岗位卡片，题库会自动切到对应面试维度。
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs" style={{ color: theme.muted, borderColor: theme.border }}>
              <MousePointerClick size={13} style={{ color: theme.accent }} />
              岗位绑定题库
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {company.jobs.map((job, i) => {
              const isSelected = selectedJobId === job.id;
              const sourceUrl = job.source?.sourceUrl || job.source?.evidenceUrl;
              const relatedLabels = (job.questionCategories || []).map(id => modeNameById[id] || id);

              return (
                <motion.article
                  key={job.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => selectJob(job)}
                  onKeyDown={event => onJobKeyDown(event, job)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.035 }}
                  className="cursor-pointer rounded-lg border p-5 text-left transition-all"
                  style={{
                    backgroundColor: isSelected ? theme.panelAlt : theme.panel,
                    borderColor: isSelected ? theme.borderStrong : theme.border,
                    boxShadow: isSelected ? theme.shadow : 'none',
                  }}
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-heading text-base font-semibold" style={{ color: theme.text }}>
                        {job.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: theme.dim }}>
                        <MapPin size={12} />
                        {job.location}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: theme.accentSoft, color: theme.accent }}>
                      {job.level}
                    </span>
                  </div>

                  <p className="mb-3 text-xs leading-relaxed" style={{ color: theme.muted }}>
                    {job.description}
                  </p>

                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {job.tags.map(tag => (
                      <span key={tag} className="rounded-md px-2 py-0.5 text-[10px]" style={{ backgroundColor: theme.accentSoft, color: theme.accent2 }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {job.source && (
                    <div className="mb-3 grid gap-2 border-t pt-3 text-[11px] sm:grid-cols-3" style={{ borderColor: theme.border, color: theme.muted }}>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={12} style={{ color: theme.accent }} />
                        {job.source.firstSeenAt ? `起始 ${job.source.firstSeenAt}` : '起始待核验'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Building2 size={12} style={{ color: theme.accent }} />
                        {job.source.company}
                      </span>
                      {sourceUrl ? (
                        <a
                          href={sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={event => event.stopPropagation()}
                          className="inline-flex items-center gap-1"
                          style={{ color: theme.accent }}
                        >
                          {job.source.sourceName}
                          <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span>{job.source.sourceName}</span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs font-medium" style={{ color: theme.warning }}>
                      {job.salary}
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px]" style={{ backgroundColor: theme.panelDeep, color: theme.muted }}>
                      <Filter size={12} style={{ color: isSelected ? theme.accent : theme.dim }} />
                      {relatedLabels.length ? `${relatedLabels.length} 个题库维度` : '查看岗位题目'}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section ref={questionsRef} className="py-8" style={{ backgroundColor: theme.pageBg }}>
        <div className="mx-auto max-w-[1280px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-2 font-display text-xl font-semibold md:text-2xl" style={{ color: theme.text }}>
              面试真题
            </h2>
            <p className="mb-6 text-sm" style={{ color: theme.muted }}>
              共 {jobScopedQuestions.length} 道{company.id !== 'deepseek' ? '公司专项' : ''}面试题
            </p>
          </motion.div>

          {selectedJob && (
            <div className="mb-5 rounded-lg border p-4" style={{ backgroundColor: theme.accentSoft, borderColor: theme.borderStrong }}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 text-sm font-medium" style={{ color: theme.accent2 }}>
                    <Filter size={15} />
                    已按岗位筛选：{selectedJob.title}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedJob.questionFocus || []).map(item => (
                      <span key={item} className="rounded-md px-2 py-1 text-[11px]" style={{ backgroundColor: theme.panelDeep, color: theme.muted }}>
                        {item}
                      </span>
                    ))}
                    {(selectedJob.questionCategories || []).map(id => (
                      <span key={id} className="rounded-md px-2 py-1 text-[11px]" style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: theme.success }}>
                        {modeNameById[id] || id}
                      </span>
                    ))}
                  </div>
                  {selectedJob.source?.note && (
                    <p className="mt-3 text-xs" style={{ color: theme.muted }}>
                      {selectedJob.source.note}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={clearJobFilter}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors"
                  style={{ borderColor: theme.border, color: theme.muted }}
                >
                  <X size={14} />
                  清除筛选
                </button>
              </div>
            </div>
          )}

          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setDisplayCount(30);
              }}
              className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all"
              style={{
                backgroundColor: activeCategory === 'all' ? theme.accentSoft : 'transparent',
                color: activeCategory === 'all' ? theme.accent : theme.dim,
                borderBottom: activeCategory === 'all' ? `2px solid ${theme.accent}` : '2px solid transparent',
              }}
            >
              全部 ({categoryCounts.all || 0})
            </button>
            {visibleModes.map(mode => (
              <button
                type="button"
                key={mode.id}
                onClick={() => {
                  setActiveCategory(mode.id);
                  setDisplayCount(30);
                }}
                className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeCategory === mode.id ? theme.accentSoft : 'transparent',
                  color: activeCategory === mode.id ? theme.accent : theme.dim,
                  borderBottom: activeCategory === mode.id ? `2px solid ${theme.accent}` : '2px solid transparent',
                }}
              >
                {mode.name} ({categoryCounts[mode.id] || 0})
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {paginatedQuestions.map((q, i) => (
              <QuestionCard key={q.id} q={q} index={i} categoryLabel={modeNameById[q.category] || q.category} theme={theme} />
            ))}

            {filteredQuestions.length === 0 && (
              <div className="py-12 text-center" style={{ color: theme.dim }}>
                未找到匹配的面试题
              </div>
            )}

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setDisplayCount(prev => prev + 30)}
                  className="flex items-center gap-2 rounded-lg border px-6 py-2.5 text-sm transition-all"
                  style={{ backgroundColor: theme.panel, borderColor: theme.border, color: theme.muted }}
                >
                  加载更多 ({filteredQuestions.length - displayCount} 道剩余)
                  <ChevronDown size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
