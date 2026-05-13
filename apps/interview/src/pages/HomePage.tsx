import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Palette,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router';
import ParticleCanvas from '@/components/ParticleCanvas';

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
}

const themeSlides = [
  {
    id: 'warm',
    label: '暖色岗位页',
    eyebrow: 'WARM JOB INTELLIGENCE',
    title: '把真实岗位变成面试路线',
    subtitle: '黑底、铜橙、琥珀光带，适合 DeepSeek 这类研究密度高的岗位页。',
    primary: '#F97316',
    secondary: '#FBBF24',
    background:
      'radial-gradient(ellipse at 86% 36%, rgba(251, 191, 36, 0.36), transparent 33%), radial-gradient(ellipse at 74% 50%, rgba(249, 115, 22, 0.23), transparent 38%), linear-gradient(120deg, #0F0906 0%, #170B07 48%, #080605 100%)',
    stats: [
      ['12', '岗位快照'],
      ['518', '面试题'],
      ['2026', '来源日期'],
    ],
  },
  {
    id: 'neon',
    label: '冷色题库页',
    eyebrow: 'NEON QUESTION BANK',
    title: '按公司、岗位、题型快速定位',
    subtitle: '青蓝霓虹与低亮界面，适合长时间刷题和搜索导航。',
    primary: '#0EA5E9',
    secondary: '#06B6D4',
    background:
      'radial-gradient(ellipse at 78% 24%, rgba(14, 165, 233, 0.32), transparent 34%), radial-gradient(ellipse at 56% 86%, rgba(6, 182, 212, 0.18), transparent 40%), linear-gradient(135deg, #0B0F1A 0%, #0F172A 58%, #07111E 100%)',
    stats: [
      ['6', '题型维度'],
      ['30', '批量加载'],
      ['AI', '岗位映射'],
    ],
  },
  {
    id: 'clean',
    label: '白底厂商墙',
    eyebrow: 'PROVIDER MARQUEE',
    title: '公司岗位像 Provider 一样流动展示',
    subtitle: '借鉴模型厂商滑动墙，把 DeepSeek、华为、字节、三星的岗位放进动态信息带。',
    primary: '#2563EB',
    secondary: '#111827',
    background:
      'radial-gradient(ellipse at 18% 18%, rgba(37, 99, 235, 0.12), transparent 30%), radial-gradient(ellipse at 84% 52%, rgba(20, 184, 166, 0.10), transparent 36%), linear-gradient(180deg, #FFFFFF 0%, #F7FAFC 100%)',
    stats: [
      ['4', '公司'],
      ['20+', '岗位'],
      ['∞', '横向浏览'],
    ],
  },
];

export default function HomePage({ companies }: Props) {
  const totalProjects = 13;
  const [activeTheme, setActiveTheme] = useState(0);

  const totalQuestions = companies.reduce((sum, company) => sum + company.questionCount, 0);
  const totalJobs = companies.reduce((sum, company) => sum + company.jobs.length, 0);

  const stats = [
    { value: String(companies.length), label: '家公司', icon: Building2 },
    { value: String(totalQuestions), label: '道面试题', icon: BookOpen },
    { value: String(totalProjects), label: '个实战项目', icon: GitBranch },
  ];

  const marqueeJobs = useMemo(
    () =>
      companies.flatMap(company =>
        company.jobs.slice(0, Math.max(1, Math.min(company.jobs.length, 5))).map(job => ({
          companyId: company.id,
          companyName: company.name,
          companyLogo: company.logo,
          companyColor: company.color,
          jobId: job.id,
          title: job.title,
          level: job.level,
          count: company.jobs.length,
        })),
      ),
    [companies],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveTheme(current => (current + 1) % themeSlides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  const slide = themeSlides[activeTheme];

  return (
    <div className="min-h-[100dvh] bg-[#0B0F1A]">
      <section
        id="hero"
        className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0B0F1A 0%, #0F172A 50%, #1A2332 100%)' }}
      >
        <ParticleCanvas />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-4"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(14,165,233,0.2)] bg-[rgba(14,165,233,0.1)] px-4 py-1.5 text-sm text-[#0EA5E9]">
              <Sparkles size={14} />
              多公司 Agent 岗位专项题库
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-4 font-display text-[36px] font-bold leading-[1.1] tracking-[-0.02em] text-[#F8FAFC] md:text-[56px] lg:text-[72px]"
            style={{ textShadow: '0 0 40px rgba(14, 165, 233, 0.4), 0 0 80px rgba(14, 165, 233, 0.15)' }}
          >
            Agent 岗位
            <br />
            专项题库
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mb-8 text-base text-[#94A3B8] md:text-lg"
          >
            覆盖 DeepSeek、华为、字节跳动、三星电子 Agent 方向岗位与面试真题
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="mb-12 flex flex-wrap justify-center gap-6 md:gap-10"
          >
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="font-mono text-2xl font-bold text-[#0EA5E9] md:text-3xl">{stat.value}</div>
                <div className="mt-1 text-xs text-[#64748B]">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link
              to="/general"
              className="rounded-lg bg-gradient-to-r from-[#0EA5E9] to-[#06B6D4] px-7 py-3 text-sm font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-glow-sm active:scale-[0.98]"
            >
              通用题库
            </Link>
            <Link
              to="/deepseek"
              className="rounded-lg border border-[#0EA5E9] px-7 py-3 text-sm font-medium text-[#0EA5E9] transition-all duration-300 hover:scale-[1.02] hover:bg-[rgba(14,165,233,0.1)] active:scale-[0.98]"
            >
              DeepSeek 专项
            </Link>
          </motion.div>
        </div>
      </section>

      <section id="theme-lab" className="bg-[#0B0F1A] py-16 md:py-24">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#38BDF8]">
                <Palette size={15} />
                Theme Lab
              </div>
              <h2 className="font-display text-[28px] font-semibold text-[#F8FAFC] md:text-[40px]">
                主题预览窗口
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTheme(current => (current - 1 + themeSlides.length) % themeSlides.length)}
                className="grid h-10 w-10 place-items-center rounded-lg border border-[#1E293B] text-[#CBD5E1] transition-colors hover:border-[#38BDF8] hover:text-[#7DD3FC]"
                aria-label="上一个主题"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => setActiveTheme(current => (current + 1) % themeSlides.length)}
                className="grid h-10 w-10 place-items-center rounded-lg border border-[#1E293B] text-[#CBD5E1] transition-colors hover:border-[#38BDF8] hover:text-[#7DD3FC]"
                aria-label="下一个主题"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#1E293B] bg-[#111827]">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, x: 36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -36 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="relative min-h-[460px] overflow-hidden p-6 md:p-10"
                style={{ background: slide.background, color: slide.id === 'clean' ? '#111827' : '#F8FAFC' }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-[-8%] hidden w-[58%] md:block"
                  style={{
                    background:
                      slide.id === 'clean'
                        ? 'linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.10), rgba(255, 255, 255, 0.66))'
                        : `linear-gradient(100deg, transparent 0%, ${slide.primary}26 42%, ${slide.secondary}42 74%, transparent 100%)`,
                    filter: 'blur(18px)',
                  }}
                />

                <div className="relative z-10 max-w-[720px]">
                  <div className="mb-5 inline-flex rounded-full border border-current/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">
                    {slide.eyebrow}
                  </div>
                  <h3 className="max-w-[760px] text-[40px] font-black leading-[1.05] md:text-[64px]">
                    {slide.title}
                  </h3>
                  <p className="mt-5 max-w-[620px] text-base font-medium opacity-70 md:text-xl">{slide.subtitle}</p>

                  <div className="mt-10 grid max-w-[650px] grid-cols-3 gap-4">
                    {slide.stats.map(([value, label]) => (
                      <div key={label} className="border-l border-current/18 pl-4">
                        <div className="text-3xl font-black md:text-4xl">{value}</div>
                        <div className="mt-2 text-xs opacity-62">{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 flex flex-wrap gap-3">
                    <Link
                      to={slide.id === 'warm' ? '/deepseek' : slide.id === 'neon' ? '/general' : '#companies'}
                      className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white"
                      style={{ background: slide.id === 'clean' ? '#2563EB' : slide.primary }}
                    >
                      查看样式
                      <ArrowRight size={15} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setActiveTheme(current => (current + 1) % themeSlides.length)}
                      className="rounded-lg border border-current/20 px-5 py-3 text-sm font-semibold backdrop-blur"
                    >
                      切换主题
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-5 flex justify-center gap-2">
            {themeSlides.map((theme, index) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => setActiveTheme(index)}
                className={`h-1.5 rounded-full transition-all ${index === activeTheme ? 'w-10 bg-[#F8FAFC]' : 'w-7 bg-[#334155]'}`}
                aria-label={`切换到${theme.label}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="company-flow" className="overflow-hidden border-y border-[#1E293B] bg-[#F8FAFC] py-9 text-[#111827]">
        <div className="mb-6 text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">Company Job Flow</div>
          <h2 className="mt-2 text-2xl font-bold md:text-4xl">接入公司的岗位正在流动展示</h2>
        </div>

        <div className="company-marquee-track">
          <div className="company-marquee-row">
            {[...marqueeJobs, ...marqueeJobs].map((item, index) => (
              <Link
                key={`${item.companyId}-${item.jobId}-${index}`}
                to={`/${item.companyId}`}
                className="company-marquee-item"
                style={{ '--company-color': item.companyColor } as CSSProperties}
              >
                <span className="text-3xl">{item.companyLogo}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold">{item.companyName}</span>
                  <span className="block max-w-[210px] truncate text-xs text-[#64748B]">{item.title}</span>
                </span>
                <span className="rounded bg-[#F1F5F9] px-2 py-1 text-[11px] text-[#475569]">{item.level}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="companies" className="bg-[#0B0F1A] py-16 md:py-24">
        <div className="mx-auto max-w-[1280px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="font-display text-[28px] font-semibold text-[#F8FAFC] md:text-[40px]">选择目标公司</h2>
            <p className="mt-2 text-sm text-[#94A3B8] md:text-base">进入公司页查看岗位、来源和匹配题库</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {companies.map((company, i) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  to={`/${company.id}`}
                  className="group block rounded-lg border border-[#1E293B] bg-[#151D2B] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(14,165,233,0.5)] hover:shadow-glow-sm"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-3xl">{company.logo}</span>
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-[#F8FAFC]">{company.name}</h3>
                      <span className="text-xs text-[#64748B]">{company.jobs.length} 个岗位</span>
                    </div>
                  </div>

                  <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-[#94A3B8]">{company.description}</p>

                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {company.jobs.slice(0, 3).map(job => (
                      <span key={job.id} className="rounded-md bg-[rgba(14,165,233,0.08)] px-2 py-0.5 text-[10px] text-[#06B6D4]">
                        {job.title.slice(0, 12)}
                        {job.title.length > 12 ? '...' : ''}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-[#1E293B] pt-3">
                    <div className="text-xs text-[#64748B]">
                      <span className="font-bold text-[#0EA5E9]">{company.questionCount}</span> 道面试题
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#0EA5E9] transition-transform group-hover:translate-x-1">
                      进入 <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#111827] py-16 md:py-24">
        <div className="mx-auto max-w-[1280px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="rounded-lg border border-[#1E293B] bg-[#151D2B] p-8 text-center md:p-12"
          >
            <BookOpen size={40} className="mx-auto mb-4 text-[#0EA5E9]" />
            <h2 className="font-display text-[24px] font-semibold text-[#F8FAFC] md:text-[32px]">通用题库</h2>
            <p className="mx-auto mb-6 mt-3 max-w-[560px] text-sm text-[#94A3B8] md:text-base">
              500+ 道通用面试真题与选择题，覆盖算法、工程、产品、系统、数据策略和行为面试。
            </p>
            <div className="mb-6 flex flex-wrap justify-center gap-3 text-xs text-[#64748B]">
              <span className="inline-flex items-center gap-1">
                <Briefcase size={13} /> {totalJobs} 个岗位
              </span>
              <span className="inline-flex items-center gap-1">
                <Building2 size={13} /> {companies.length} 家公司
              </span>
            </div>
            <Link
              to="/general"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0EA5E9] to-[#06B6D4] px-7 py-3 text-sm font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-glow-sm active:scale-[0.98]"
            >
              进入通用题库
              <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
