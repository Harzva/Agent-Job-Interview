import { useRef, useEffect, useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, GitFork, ExternalLink, Filter, X } from 'lucide-react';
import type { GitHubProject } from '@/types';

interface Props {
  projects: GitHubProject[];
  jobFilter?: string[] | null;
  onClearJobFilter?: () => void;
}

const CountUp = memo(function CountUp({ target, inView }: { target: number; inView: boolean }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(target * eased);
      setValue(start);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, inView]);

  return <>{value.toLocaleString()}</>;
});

export default function GitHubSection({ projects, jobFilter, onClearJobFilter }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const parseStars = (stars: string) => {
    const clean = stars.replace(/,/g, '');
    if (clean.includes('K')) return Math.round(parseFloat(clean) * 1000);
    return parseInt(clean) || 0;
  };

  const filteredProjects = useMemo(() => {
    if (!jobFilter || jobFilter.length === 0) return projects;
    return projects.filter(p => jobFilter.includes(p.name));
  }, [projects, jobFilter]);

  return (
    <section id="github" ref={sectionRef} className="py-16 md:py-24 bg-[#111827]">
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display font-semibold text-[28px] md:text-[40px] text-[#F8FAFC] mb-2">
            13 个 GitHub 实战项目
          </h2>
          <p className="text-[#94A3B8] text-sm md:text-base">
            从 Star 数排序，覆盖 Agent 全栈技术生态
          </p>
        </motion.div>

        {/* Job Filter Banner */}
        <AnimatePresence>
          {jobFilter && jobFilter.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)] rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Filter size={16} className="text-[#10B981]" />
                <div>
                  <span className="text-sm text-[#F8FAFC]">
                    当前显示岗位专属实战项目
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {jobFilter.map(name => (
                      <span key={name} className="text-[10px] px-2 py-0.5 rounded-md bg-[rgba(16,185,129,0.15)] text-[#10B981]">
                        {name}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProjects.map((project, i) => {
            const starCount = parseStars(project.stars);
            const [owner, name] = [project.owner, project.name];
            return (
              <motion.a
                key={project.name}
                href={`https://github.com/${owner}/${name}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group block bg-[#151D2B] border border-[#1E293B] rounded-2xl p-5 transition-all duration-300 hover:border-[rgba(14,165,233,0.5)] hover:-translate-y-1 hover:shadow-glow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GithubIcon className="w-4 h-4 text-[#64748B]" />
                    <span className="text-xs text-[#64748B] truncate">{owner}</span>
                  </div>
                  <ExternalLink size={14} className="text-[#64748B] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <h3 className="font-heading font-semibold text-sm text-[#F8FAFC] mb-2 truncate group-hover:text-[#0EA5E9] transition-colors">
                  {name}
                </h3>

                <p className="text-[#94A3B8] text-xs leading-relaxed mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <Star size={13} className="text-[#F59E0B]" />
                    <span className="font-mono text-sm text-[#06B6D4] font-bold">
                      {inView ? <CountUp target={starCount} inView={inView} /> : '0'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork size={13} className="text-[#64748B]" />
                    <span className="font-mono text-xs text-[#94A3B8]">{project.forks}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {project.tasks.slice(0, 3).map(task => (
                    <span
                      key={task}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[rgba(14,165,233,0.08)] text-[#06B6D4]"
                    >
                      {task}
                    </span>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-[#1E293B]">
                  <span className="text-[10px] text-[#8B5CF6] bg-[rgba(139,92,246,0.08)] px-2 py-0.5 rounded">
                    {project.category}
                  </span>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
