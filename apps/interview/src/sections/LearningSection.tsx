import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen, Clock, FileText } from 'lucide-react';
import type { LearningPath } from '@/types';

interface Props {
  learningPaths: LearningPath[];
}

export default function LearningSection({ learningPaths }: Props) {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  const toggleStep = (key: string) => {
    setExpandedSteps(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section id="learning" className="py-16 md:py-24 bg-[#0B0F1A]">
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display font-semibold text-[28px] md:text-[40px] text-[#F8FAFC] mb-2">
            Agent 学习路径
          </h2>
          <p className="text-[#94A3B8] text-sm md:text-base">
            从入门到精通的系统学习路线图
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {learningPaths.map((path, pathIndex) => (
            <motion.div
              key={pathIndex}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: pathIndex * 0.15 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <BookOpen size={18} className="text-[#0EA5E9]" />
                <h3 className="font-heading font-semibold text-lg text-[#F8FAFC]">
                  {path.title}
                </h3>
              </div>

              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-[#0EA5E9] to-[#06B6D4] rounded-full" />

                <div className="space-y-4">
                  {path.steps.map((step, stepIndex) => {
                    const key = `${pathIndex}-${stepIndex}`;
                    const isExpanded = expandedSteps[key];

                    return (
                      <motion.div
                        key={stepIndex}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: stepIndex * 0.08 }}
                        className="relative pl-8"
                      >
                        {/* Timeline dot */}
                        <div
                          className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                            isExpanded
                              ? 'bg-[#0EA5E9] border-[#0EA5E9] shadow-[0_0_12px_rgba(14,165,233,0.6)]'
                              : 'bg-[#0B0F1A] border-[#0EA5E9]'
                          }`}
                        />

                        <div
                          className="bg-[#151D2B] border border-[#1E293B] rounded-xl p-4 cursor-pointer transition-all duration-300 hover:border-[rgba(14,165,233,0.3)]"
                          onClick={() => toggleStep(key)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-sm text-[#F8FAFC] mb-0.5">
                                {step.name}
                              </h4>
                              <div className="flex items-center gap-1 text-[#64748B] text-xs">
                                <Clock size={10} />
                                {step.duration}
                              </div>
                            </div>
                            <ChevronDown
                              size={14}
                              className={`text-[#64748B] transition-transform duration-300 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                                className="overflow-hidden"
                              >
                                <div className="mt-3 pt-3 border-t border-[#1E293B]">
                                  <h5 className="text-[11px] font-medium text-[#94A3B8] mb-2 flex items-center gap-1">
                                    <FileText size={10} />
                                    学习资源
                                  </h5>
                                  <ul className="space-y-1.5">
                                    {step.resources.map((resource, ri) => (
                                      <li
                                        key={ri}
                                        className="text-xs text-[#94A3B8] flex items-start gap-1.5"
                                      >
                                        <span className="text-[#0EA5E9] mt-0.5">•</span>
                                        {resource}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
