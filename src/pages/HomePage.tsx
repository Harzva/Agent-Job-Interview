import { motion } from 'framer-motion';
import { Building2, BookOpen, GitBranch, ArrowRight, Sparkles } from 'lucide-react';
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

export default function HomePage({ companies }: Props) {
  const totalProjects = 13;

  const stats = [
    { value: String(companies.length), label: '家公司', icon: Building2 },
    { value: '758', label: '道面试题', icon: BookOpen },
    { value: String(totalProjects), label: '个实战项目', icon: GitBranch },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#0B0F1A]">
      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0B0F1A 0%, #0F172A 50%, #1A2332 100%)' }}
      >
        <ParticleCanvas />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-4"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(14,165,233,0.1)] border border-[rgba(14,165,233,0.2)] text-[#0EA5E9] text-sm">
              <Sparkles size={14} />
              多公司Agent岗位专项题库
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="font-display font-bold text-[36px] md:text-[56px] lg:text-[72px] leading-[1.1] tracking-[-0.02em] text-[#F8FAFC] mb-4"
            style={{ textShadow: '0 0 40px rgba(14, 165, 233, 0.4), 0 0 80px rgba(14, 165, 233, 0.15)' }}
          >
            Agent岗位
            <br />
            专项题库
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="text-[#94A3B8] text-base md:text-lg font-body mb-8"
          >
            覆盖 DeepSeek、华为、字节跳动、三星电子 Agent方向面试真题
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="flex flex-wrap justify-center gap-6 md:gap-10 mb-12"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-mono text-2xl md:text-3xl font-bold text-[#0EA5E9]">{stat.value}</div>
                <div className="text-xs text-[#64748B] mt-1">{stat.label}</div>
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
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#06B6D4] text-white font-medium text-sm hover:scale-[1.02] hover:shadow-glow-sm active:scale-[0.98] transition-all duration-300"
            >
              通用题库
            </Link>
            <Link
              to="/deepseek"
              className="px-7 py-3 rounded-xl border border-[#0EA5E9] text-[#0EA5E9] font-medium text-sm hover:bg-[rgba(14,165,233,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              DeepSeek 专项
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Company Cards Section */}
      <section className="py-16 md:py-24 bg-[#0B0F1A]">
        <div className="max-w-[1280px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display font-semibold text-[28px] md:text-[40px] text-[#F8FAFC] mb-2">
              选择目标公司
            </h2>
            <p className="text-[#94A3B8] text-sm md:text-base">
              点击进入各公司专项题库，查看岗位与面试真题
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  className="group block bg-[#151D2B] border border-[#1E293B] rounded-2xl p-6 transition-all duration-300 hover:border-[rgba(14,165,233,0.5)] hover:-translate-y-1 hover:shadow-glow-sm"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{company.logo}</span>
                    <div>
                      <h3 className="font-heading font-semibold text-lg text-[#F8FAFC]">{company.name}</h3>
                      <span className="text-xs text-[#64748B]">{company.jobs.length} 个岗位</span>
                    </div>
                  </div>

                  <p className="text-[#94A3B8] text-xs leading-relaxed mb-4 line-clamp-2">
                    {company.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {company.jobs.slice(0, 3).map(job => (
                      <span
                        key={job.id}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[rgba(14,165,233,0.08)] text-[#06B6D4]"
                      >
                        {job.title.slice(0, 12)}{job.title.length > 12 ? '...' : ''}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#1E293B]">
                    <div className="text-xs text-[#64748B]">
                      <span className="text-[#0EA5E9] font-bold">{company.questionCount}</span> 道面试题
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#0EA5E9] group-hover:translate-x-1 transition-transform">
                      进入 <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* General Question Bank Entry */}
      <section className="py-16 md:py-24 bg-[#111827]">
        <div className="max-w-[1280px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="bg-[#151D2B] border border-[#1E293B] rounded-3xl p-8 md:p-12 text-center"
          >
            <BookOpen size={40} className="text-[#0EA5E9] mx-auto mb-4" />
            <h2 className="font-display font-semibold text-[24px] md:text-[32px] text-[#F8FAFC] mb-3">
              通用题库
            </h2>
            <p className="text-[#94A3B8] text-sm md:text-base max-w-[560px] mx-auto mb-6">
              500+ 道通用面试真题 + 18 道选择题，覆盖算法、工程、产品、系统、行为面试 6 大类别
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/general"
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#06B6D4] text-white font-medium text-sm hover:scale-[1.02] hover:shadow-glow-sm active:scale-[0.98] transition-all duration-300"
              >
                进入通用题库
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
