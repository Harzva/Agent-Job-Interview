import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import ParticleCanvas from '@/components/ParticleCanvas';

const stats = [
  { value: '8', label: '个岗位' },
  { value: '500+', label: '道面试题' },
  { value: '13', label: '个GitHub项目' },
  { value: '12', label: '周冲刺计划' },
];

export default function HeroSection() {
  const [typedText, setTypedText] = useState('');
  const fullText = '基于 DeepSeek 2026.04.27 Agent 方向招聘信息深度解析';
  const indexRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        if (indexRef.current < fullText.length) {
          indexRef.current += 1;
          setTypedText(fullText.slice(0, indexRef.current));
        } else {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0B0F1A 0%, #0F172A 50%, #1A2332 100%)' }}
    >
      <ParticleCanvas />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-display font-bold text-[36px] md:text-[56px] lg:text-[72px] leading-[1.1] tracking-[-0.02em] text-[#F8FAFC] mb-4"
          style={{ textShadow: '0 0 40px rgba(14, 165, 233, 0.4), 0 0 80px rgba(14, 165, 233, 0.15)' }}
        >
          DeepSeek Agent
          <br />
          岗位分析报告
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-[#94A3B8] text-base md:text-lg font-body mb-3 h-6"
        >
          {typedText}
          <span className="animate-pulse">|</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-[#64748B] text-sm md:text-base max-w-[560px] mx-auto mb-8"
        >
          覆盖算法、工程、产品、系统全栈能力体系，500+道面试真题、13个实战项目、12周冲刺计划
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="flex flex-wrap justify-center gap-4 mb-10"
        >
          <a
            href="#interview"
            onClick={e => { e.preventDefault(); document.querySelector('#interview')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#06B6D4] text-white font-medium text-sm hover:scale-[1.02] hover:shadow-glow-sm active:scale-[0.98] transition-all duration-300"
          >
            开始刷题
          </a>
          <a
            href="#positions"
            onClick={e => { e.preventDefault(); document.querySelector('#positions')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="px-7 py-3 rounded-xl border border-[#0EA5E9] text-[#0EA5E9] font-medium text-sm hover:bg-[rgba(14,165,233,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            查看岗位
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 2.0 }}
          className="flex flex-wrap justify-center gap-6 md:gap-10 mb-12"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-mono text-2xl md:text-3xl font-bold text-[#0EA5E9]">{stat.value}</div>
              <div className="text-xs text-[#64748B] mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
      >
        <span className="text-[10px] text-[#64748B]">向下滚动探索</span>
        <ChevronDown size={16} className="text-[#64748B] animate-float" />
      </motion.div>
    </section>
  );
}
