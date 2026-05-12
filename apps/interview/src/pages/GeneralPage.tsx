import { useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import InterviewSection from '@/sections/InterviewSection';
import type { Question, ChoiceQuestion, InterviewMode } from '@/types';

interface Props {
  questions: Record<string, Question[]>;
  choiceQuestions: ChoiceQuestion[];
  interviewModes: InterviewMode[];
}

export default function GeneralPage({ questions, choiceQuestions, interviewModes }: Props) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#0B0F1A]">
      {/* Header */}
      <div className="pt-16 bg-[#0B0F1A]">
        <div className="max-w-[1280px] mx-auto px-6 pt-8 pb-4">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-[#94A3B8] hover:text-[#0EA5E9] transition-colors mb-4">
            <ArrowLeft size={14} />
            返回首页
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display font-bold text-[24px] md:text-[36px] text-[#F8FAFC] mb-2">
              通用题库
            </h1>
            <p className="text-[#94A3B8] text-sm">
              500+ 道通用面试真题 + 18 道选择题，覆盖 6 大类别
            </p>
          </motion.div>
        </div>
      </div>

      {/* Interview Section */}
      <InterviewSection
        questions={questions}
        choiceQuestions={choiceQuestions}
        interviewModes={interviewModes}
      />
    </div>
  );
}
