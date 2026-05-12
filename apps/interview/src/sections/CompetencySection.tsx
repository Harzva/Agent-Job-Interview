import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import type { SkillModel } from '@/types';

interface Props {
  skillModel: SkillModel;
}

const bgGradientMap: Record<string, string> = {
  '#D4575A': 'bg-gradient-to-r from-[#D4575A] to-[#B84A4D]',
  '#4ECDC4': 'bg-gradient-to-r from-[#4ECDC4] to-[#3BA99A]',
  '#2B95B0': 'bg-gradient-to-r from-[#2B95B0] to-[#1E7A94]',
  '#5BA888': 'bg-gradient-to-r from-[#5BA888] to-[#4A9070]',
  '#FFEAA7': 'bg-gradient-to-r from-[#FFEAA7] to-[#E8C96A]',
};

export default function CompetencySection({ skillModel }: Props) {
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const layers = skillModel.layers;

  return (
    <section id="competency" className="py-16 md:py-24 bg-[#111827]">
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display font-semibold text-[28px] md:text-[40px] text-[#F8FAFC] mb-2">
            五层能力模型
          </h2>
          <p className="text-[#94A3B8] text-sm md:text-base">
            从工程化到研究全栈的 Agent 能力金字塔
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 flex flex-col items-center w-full">
            <div className="relative w-full max-w-[500px]">
              {layers.map((layer, i) => {
                const width = 100 - i * 12;
                const isSelected = selectedLayer === i;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    onClick={() => setSelectedLayer(isSelected ? null : i)}
                    className={`relative mx-auto mb-2 cursor-pointer transition-all duration-300 group ${
                      isSelected ? 'brightness-125 scale-[1.02]' : 'hover:brightness-110'
                    }`}
                    style={{ width: `${width}%` }}
                  >
                    <div
                      className={`min-h-[56px] md:min-h-[64px] rounded-lg ${bgGradientMap[layer.color] || 'bg-gradient-to-r from-[#0EA5E9] to-[#06B6D4]'} 
                        flex items-center justify-center px-3 md:px-4 shadow-lg transition-all duration-300
                        ${isSelected ? 'ring-2 ring-white/30' : ''}
                      `}
                    >
                      <div className="flex items-center gap-1.5 md:gap-2 py-2">
                        <span className="font-mono text-[10px] md:text-xs text-white/80 font-bold shrink-0">
                          {layer.name}
                        </span>
                        <span className="text-white font-medium text-xs md:text-sm leading-tight break-words text-center">
                          {layer.title}
                        </span>
                        <ChevronRight
                          size={14}
                          className={`text-white/70 shrink-0 transition-transform duration-300 ${
                            isSelected ? 'rotate-90' : 'group-hover:translate-x-0.5'
                          }`}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {selectedLayer !== null && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="w-full lg:w-[400px] bg-[#151D2B] border border-[#1E293B] rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${bgGradientMap[layers[selectedLayer].color]}`} />
                    <h3 className="font-heading font-semibold text-lg text-[#F8FAFC]">
                      {layers[selectedLayer].title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedLayer(null)}
                    className="w-8 h-8 rounded-lg bg-[#1E293B] hover:bg-[#2D3A4F] flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] transition-all"
                    aria-label="关闭"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="text-[#94A3B8] text-sm leading-relaxed mb-4">
                  {layers[selectedLayer].description}
                </p>

                <h4 className="text-xs font-medium text-[#F8FAFC] mb-2">核心技能</h4>
                <div className="flex flex-wrap gap-2">
                  {layers[selectedLayer].skills.map(skill => (
                    <span
                      key={skill}
                      className="text-xs px-3 py-1 rounded-lg bg-[rgba(14,165,233,0.1)] text-[#0EA5E9]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
