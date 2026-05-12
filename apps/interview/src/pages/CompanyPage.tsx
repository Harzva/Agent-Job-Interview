import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Briefcase, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import type { Question, InterviewMode } from '@/types';

interface CompanyJob {
  id: string;
  title: string;
  salary: string;
  location: string;
  level: string;
  tags: string[];
  description: string;
}

interface Company {
  id: string;
  name: string;
  logo: string;
  description: string;
  color: string;
  gradient: string;
  jobs: CompanyJob[];
  questionCount: number;
}

interface Props {
  companies: Company[];
  generalQuestions: Record<string, Question[]>;
  companyQuestions: Record<string, Question[]>;
  interviewModes: InterviewMode[];
}

function QuestionCard({ q, index }: { q: Question; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
      className="bg-[#151D2B] border border-[#1E293B] rounded-2xl p-5 transition-all duration-300 hover:border-[rgba(14,165,233,0.2)]"
    >
      <div className="flex items-start gap-3 mb-3">
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
      <div className="text-[#94A3B8] text-sm leading-relaxed mb-4">
        <MarkdownRenderer content={q.question} />
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-sm text-[#0EA5E9] hover:text-[#06B6D4] transition-colors mb-3"
      >
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {expanded ? '收起答案' : '查看答案'}
      </button>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
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
            <div className="bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.15)] rounded-xl p-5">
              <h4 className="text-xs font-medium text-[#F59E0B] mb-2">追问</h4>
              <div className="text-[#94A3B8] text-sm leading-loose">
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

  const company = companies.find(c => c.id === companyId);

  useEffect(() => {
    setActiveCategory('all');
    setDisplayCount(30);
    window.scrollTo(0, 0);
  }, [companyId]);

  const allQuestions = useMemo(() => {
    if (!company) return [];
    const qs: Question[] = [];

    if (company.id === 'deepseek') {
      // DeepSeek uses general questions
      Object.values(generalQuestions).forEach(arr => qs.push(...arr));
    } else {
      // Other companies: company-specific questions + relevant general questions
      const companySpecific = companyQuestions[company.id] || [];
      qs.push(...companySpecific);
    }

    return qs;
  }, [company, generalQuestions, companyQuestions]);

  const filteredQuestions = useMemo(() => {
    let qs = activeCategory === 'all' ? allQuestions : allQuestions.filter(q => q.category === activeCategory);
    return qs;
  }, [activeCategory, allQuestions]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allQuestions.length };
    interviewModes.forEach(m => {
      counts[m.id] = allQuestions.filter(q => q.category === m.id).length;
    });
    return counts;
  }, [allQuestions, interviewModes]);

  const paginatedQuestions = filteredQuestions.slice(0, displayCount);
  const hasMore = displayCount < filteredQuestions.length;

  if (!company) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#0B0F1A]">
        <div className="text-center">
          <p className="text-[#94A3B8] mb-4">公司未找到</p>
          <Link to="/" className="text-[#0EA5E9] text-sm hover:underline">返回首页</Link>
        </div>
      </div>
    );
  }

  const companyColor = company.color;

  return (
    <div className="min-h-[100dvh] bg-[#0B0F1A]">
      {/* Company Banner */}
      <section className="relative pt-16 pb-12 overflow-hidden"
        style={{ background: `linear-gradient(135deg, #0B0F1A 0%, ${companyColor}15 50%, #0B0F1A 100%)` }}
      >
        <div className="max-w-[1280px] mx-auto px-6 pt-12">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-[#94A3B8] hover:text-[#0EA5E9] transition-colors mb-6">
            <ArrowLeft size={14} />
            返回首页
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{company.logo}</span>
              <div>
                <h1 className="font-display font-bold text-[28px] md:text-[40px] text-[#F8FAFC]">
                  {company.name}
                </h1>
                <p className="text-[#94A3B8] text-sm">{company.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-[#94A3B8]">
                <Briefcase size={14} className="text-[#0EA5E9]" />
                <span>{company.jobs.length} 个岗位</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#94A3B8]">
                <BookOpen size={14} className="text-[#0EA5E9]" />
                <span>{company.questionCount} 道面试题</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Jobs Section */}
      <section className="py-8 bg-[#0B0F1A]">
        <div className="max-w-[1280px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display font-semibold text-xl md:text-2xl text-[#F8FAFC] mb-6">
              招聘岗位
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {company.jobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-[#151D2B] border border-[#1E293B] rounded-2xl p-5 hover:border-[rgba(14,165,233,0.3)] transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-heading font-semibold text-base text-[#F8FAFC]">{job.title}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[rgba(14,165,233,0.1)] text-[#0EA5E9] font-medium shrink-0">
                    {job.level}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[#64748B] text-xs mb-2">
                  <MapPin size={12} />
                  {job.location}
                </div>
                <p className="text-[#94A3B8] text-xs leading-relaxed mb-3">{job.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-[rgba(14,165,233,0.08)] text-[#06B6D4]">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3 text-xs text-[#F59E0B] font-medium">{job.salary}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Questions Section */}
      <section className="py-8 bg-[#0B0F1A]">
        <div className="max-w-[1280px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display font-semibold text-xl md:text-2xl text-[#F8FAFC] mb-2">
              面试真题
            </h2>
            <p className="text-[#94A3B8] text-sm mb-6">
              共 {allQuestions.length} 道{company.id !== 'deepseek' ? '公司专项' : ''}面试题
            </p>
          </motion.div>

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
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === mode.id
                    ? 'bg-[rgba(14,165,233,0.15)] text-[#0EA5E9] border-b-2 border-[#0EA5E9]'
                    : 'text-[#64748B] hover:text-[#94A3B8]'
                }`}
              >
                {mode.name} ({categoryCounts[mode.id] || 0})
              </button>
            ))}
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {paginatedQuestions.map((q, i) => (
              <QuestionCard key={q.id} q={q} index={i} />
            ))}

            {filteredQuestions.length === 0 && (
              <div className="text-center text-[#64748B] py-12">
                未找到匹配的面试题
              </div>
            )}

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
        </div>
      </section>
    </div>
  );
}
