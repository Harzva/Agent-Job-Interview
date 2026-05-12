import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, GraduationCap, Cpu, Globe } from 'lucide-react';

const routeData = [
  {
    icon: <GraduationCap size={18} />,
    title: '在校生',
    subtitle: '全栈工程师',
    color: '#0EA5E9',
    gradient: 'from-[#0EA5E9] to-[#06B6D4]',
    weeks: [
      { label: 'Week 1-2', desc: 'Python基础 + LLM入门', status: 'done' },
      { label: 'Week 3-4', desc: 'Prompt工程 + LangChain', status: 'done' },
      { label: 'Week 5-6', desc: 'MCP协议 + 工具调用', status: 'done' },
      { label: 'Week 7-8', desc: 'Agent架构 + 记忆系统', status: 'doing' },
      { label: 'Week 9-10', desc: 'Multi-Agent + 部署', status: 'todo' },
      { label: 'Week 11-12', desc: '项目实战 + 面试冲刺', status: 'todo' },
    ],
  },
  {
    icon: <Cpu size={18} />,
    title: '算法工程师',
    subtitle: 'Agent算法研究员',
    color: '#10B981',
    gradient: 'from-[#10B981] to-[#059669]',
    weeks: [
      { label: 'Week 1-2', desc: 'Agent综述 + RL基础', status: 'done' },
      { label: 'Week 3-4', desc: 'MCP深入 + Function Call', status: 'done' },
      { label: 'Week 5-6', desc: 'Planning + ReAct', status: 'doing' },
      { label: 'Week 7-8', desc: 'Multi-Agent协作', status: 'todo' },
      { label: 'Week 9-10', desc: 'RLHF + 模型训练', status: 'todo' },
      { label: 'Week 11-12', desc: '论文复现 + 面试', status: 'todo' },
    ],
  },
  {
    icon: <Globe size={18} />,
    title: '全栈工程师',
    subtitle: 'Agent系统工程师',
    color: '#8B5CF6',
    gradient: 'from-[#8B5CF6] to-[#7C3AED]',
    weeks: [
      { label: 'Week 1-2', desc: 'LLM API + 工程基础', status: 'done' },
      { label: 'Week 3-4', desc: 'MCP SDK + Tool集成', status: 'done' },
      { label: 'Week 5-6', desc: 'Agent框架 + 记忆系统', status: 'done' },
      { label: 'Week 7-8', desc: 'Multi-Agent系统', status: 'doing' },
      { label: 'Week 9-10', desc: '性能优化 + 部署', status: 'todo' },
      { label: 'Week 11-12', desc: '生产实战 + 面试', status: 'todo' },
    ],
  },
];

export default function PlanSection() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  return (
    <section id="plan" className="py-16 md:py-24 bg-[#111827]">
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display font-semibold text-[28px] md:text-[40px] text-[#F8FAFC] mb-2">
            12 周冲刺计划
          </h2>
          <p className="text-[#94A3B8] text-sm md:text-base">
            针对不同背景的定制化学习路线
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {routeData.map((route, i) => {
            const isExpanded = expandedCard === i;
            const completedWeeks = route.weeks.filter(w => w.status === 'done').length;
            const progress = (completedWeeks / route.weeks.length) * 100;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="bg-[#151D2B] border rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{ borderColor: route.color + '40' }}
              >
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ color: route.color }}>{route.icon}</span>
                    <h3 className="font-heading font-semibold text-base text-[#F8FAFC]">
                      {route.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#64748B] mb-4">目标：{route.subtitle}</p>

                  {/* Main progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-[#94A3B8]">总进度</span>
                      <span className="font-mono text-xs font-bold" style={{ color: route.color }}>
                        {completedWeeks} / {route.weeks.length} 周
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#1E293B] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: i * 0.2 }}
                        className={`h-full bg-gradient-to-r ${route.gradient} rounded-full`}
                      />
                    </div>
                  </div>

                  {/* Weekly bars */}
                  <div
                    className="cursor-pointer"
                    onClick={() => setExpandedCard(isExpanded ? null : i)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#94A3B8]">每周进度</span>
                      <ChevronDown
                        size={14}
                        className={`text-[#64748B] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                    <div className="flex gap-1">
                      {route.weeks.map((week, j) => (
                        <div
                          key={j}
                          className="flex-1 h-1 rounded-full overflow-hidden bg-[#1E293B]"
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              week.status === 'done'
                                ? `bg-gradient-to-r ${route.gradient}`
                                : week.status === 'doing'
                                ? `bg-gradient-to-r ${route.gradient} animate-pulse`
                                : 'bg-transparent'
                            }`}
                            style={{ width: week.status === 'todo' ? '0%' : '100%' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Expanded week details */}
                <motion.div
                  initial={false}
                  animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-2">
                    {route.weeks.map((week, j) => (
                      <div
                        key={j}
                        className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#111827]"
                      >
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            week.status === 'done'
                              ? 'bg-[#10B981]'
                              : week.status === 'doing'
                              ? 'bg-[#0EA5E9] animate-pulse'
                              : 'bg-[#1E293B]'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] text-[#64748B] block">{week.label}</span>
                          <span className="text-xs text-[#94A3B8] truncate block">{week.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
