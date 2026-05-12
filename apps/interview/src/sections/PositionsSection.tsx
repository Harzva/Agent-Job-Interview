import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ChevronDown, Briefcase, BookOpen, Code2, ArrowRight, Layers } from 'lucide-react';
import type { Job } from '@/types';

interface Props {
  jobs: Job[];
  onNavigateToQuestions?: (categories: string[]) => void;
  onNavigateToProjects?: (projectNames: string[]) => void;
}

const categoryLabels: Record<string, string> = {
  algo_rl: '算法研究员',
  engineering: '全栈工程师',
  data_strategy: '数据策略',
  product: '产品经理',
  system: '系统设计',
  behavior: '行为面试',
};

export default function PositionsSection({ jobs, onNavigateToQuestions, onNavigateToProjects }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section id="positions" className="py-16 md:py-24 bg-[#0B0F1A]">
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display font-semibold text-[28px] md:text-[40px] text-[#F8FAFC] mb-2">
            8 大核心岗位
          </h2>
          <p className="text-[#94A3B8] text-sm md:text-base">
            DeepSeek Agent 方向热招岗位全景 — 点击卡片查看专属教学路径
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {jobs.map((job, i) => {
            const isExpanded = expandedId === job.id;
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative bg-[#151D2B] border border-[#1E293B] rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:border-[rgba(14,165,233,0.5)] hover:-translate-y-1 hover:shadow-glow-sm"
                onClick={() => setExpandedId(isExpanded ? null : job.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <Briefcase size={18} className="text-[#0EA5E9] mt-0.5" />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[rgba(245,158,11,0.1)] text-[#F59E0B] font-medium">
                      {job.difficulty}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[rgba(14,165,233,0.1)] text-[#0EA5E9] font-medium">
                      {job.level}
                    </span>
                  </div>
                </div>

                <h3 className="font-heading font-semibold text-base text-[#F8FAFC] mb-2 leading-snug">
                  {job.title}
                </h3>

                <div className="flex items-center gap-1 text-[#64748B] text-xs mb-3">
                  <MapPin size={12} />
                  {job.location}
                </div>

                <p className="text-[#94A3B8] text-xs leading-relaxed mb-4 line-clamp-2">
                  {job.summary}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {job.skills.slice(0, 3).map(skill => (
                    <span
                      key={skill}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[rgba(14,165,233,0.08)] text-[#06B6D4]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="pt-3 border-t border-[#1E293B] mt-3 space-y-4">
                    {/* 岗位要求 */}
                    <div>
                      <h4 className="text-xs font-medium text-[#F8FAFC] mb-2">岗位要求</h4>
                      <ul className="space-y-1.5 mb-3">
                        {job.requirements.slice(0, 4).map((req, j) => (
                          <li key={j} className="text-[11px] text-[#94A3B8] flex items-start gap-1.5">
                            <span className="text-[#0EA5E9] mt-0.5">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 加分项 */}
                    {job.bonuses.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-[#F59E0B] mb-2">加分项</h4>
                        <ul className="space-y-1">
                          {job.bonuses.slice(0, 3).map((bonus, j) => (
                            <li key={j} className="text-[11px] text-[#94A3B8] flex items-start gap-1.5">
                              <span className="text-[#F59E0B]">+</span>
                              {bonus}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 专属面试题入口 */}
                    <div
                      className="bg-[rgba(14,165,233,0.06)] border border-[rgba(14,165,233,0.15)] rounded-xl p-3 cursor-pointer hover:bg-[rgba(14,165,233,0.1)] transition-colors"
                      onClick={e => {
                        e.stopPropagation();
                        onNavigateToQuestions?.(job.relatedQuestionCategories);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BookOpen size={14} className="text-[#0EA5E9]" />
                          <span className="text-xs font-medium text-[#0EA5E9]">专属面试题</span>
                        </div>
                        <ArrowRight size={12} className="text-[#0EA5E9]" />
                      </div>
                      <div className="text-[10px] text-[#94A3B8] mb-1.5">
                        共 <span className="text-[#0EA5E9] font-bold">{job.relatedQuestionCount}</span> 道精选题目
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {job.relatedQuestionCategories.map(cat => (
                          <span key={cat} className="text-[9px] px-1.5 py-0.5 rounded bg-[#1E293B] text-[#64748B]">
                            {categoryLabels[cat] || cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 专属实战项目入口 */}
                    <div
                      className="bg-[rgba(16,185,129,0.06)] border border-[rgba(16,185,129,0.15)] rounded-xl p-3 cursor-pointer hover:bg-[rgba(16,185,129,0.1)] transition-colors"
                      onClick={e => {
                        e.stopPropagation();
                        onNavigateToProjects?.(job.relatedProjects);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Code2 size={14} className="text-[#10B981]" />
                          <span className="text-xs font-medium text-[#10B981]">专属实战项目</span>
                        </div>
                        <ArrowRight size={12} className="text-[#10B981]" />
                      </div>
                      <div className="text-[10px] text-[#94A3B8] mb-1.5">
                        共 <span className="text-[#10B981] font-bold">{job.relatedProjects.length}</span> 个核心仓库
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {job.relatedProjects.slice(0, 4).map(proj => (
                          <span key={proj} className="text-[9px] px-1.5 py-0.5 rounded bg-[#1E293B] text-[#64748B]">
                            {proj}
                          </span>
                        ))}
                        {job.relatedProjects.length > 4 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1E293B] text-[#64748B]">
                            +{job.relatedProjects.length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 推荐学习路径 */}
                    <div className="bg-[rgba(139,92,246,0.06)] border border-[rgba(139,92,246,0.15)] rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Layers size={14} className="text-[#8B5CF6]" />
                        <span className="text-xs font-medium text-[#8B5CF6]">推荐学习路径</span>
                      </div>
                      <p className="text-[10px] text-[#94A3B8]">{job.learningPath}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-2">
                  <ChevronDown
                    size={14}
                    className={`text-[#64748B] transition-transform duration-300 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
