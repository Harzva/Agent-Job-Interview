import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/sections/HeroSection';
import PositionsSection from '@/sections/PositionsSection';
import CompetencySection from '@/sections/CompetencySection';
import InterviewSection from '@/sections/InterviewSection';
import GitHubSection from '@/sections/GitHubSection';
import LearningSection from '@/sections/LearningSection';
import PlanSection from '@/sections/PlanSection';
import type { AppData } from '@/types';

const HomePage = lazy(() => import('@/pages/HomePage'));
const CompanyPage = lazy(() => import('@/pages/CompanyPage'));
const GeneralPage = lazy(() => import('@/pages/GeneralPage'));

function LoadingScreen() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#0B0F1A]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#0EA5E9] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#94A3B8] text-sm">加载中...</p>
      </div>
    </div>
  );
}

function ErrorScreen() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#0B0F1A]">
      <p className="text-[#94A3B8]">数据加载失败</p>
    </div>
  );
}

/** Original DeepSeek single-page layout */
function DeepSeekPage({ data }: { data: AppData }) {
  const [jobQuestionFilter, setJobQuestionFilter] = useState<string[] | null>(null);
  const [jobProjectFilter, setJobProjectFilter] = useState<string[] | null>(null);

  const interviewRef = useRef<HTMLDivElement>(null);
  const githubRef = useRef<HTMLDivElement>(null);

  const handleNavigateToQuestions = (categories: string[]) => {
    setJobQuestionFilter(categories);
    setJobProjectFilter(null);
    setTimeout(() => {
      interviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleNavigateToProjects = (projectNames: string[]) => {
    setJobProjectFilter(projectNames);
    setJobQuestionFilter(null);
    setTimeout(() => {
      githubRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <>
      <main>
        <HeroSection />
        <PositionsSection
          jobs={data.jobs}
          onNavigateToQuestions={handleNavigateToQuestions}
          onNavigateToProjects={handleNavigateToProjects}
        />
        <CompetencySection skillModel={data.skillModel} />
        <div ref={interviewRef}>
          <InterviewSection
            questions={data.questions}
            choiceQuestions={data.choiceQuestions}
            interviewModes={data.interviewModes}
            jobFilter={jobQuestionFilter}
            onClearJobFilter={() => setJobQuestionFilter(null)}
          />
        </div>
        <div ref={githubRef}>
          <GitHubSection
            projects={data.githubProjects}
            jobFilter={jobProjectFilter}
            onClearJobFilter={() => setJobProjectFilter(null)}
          />
        </div>
        <LearningSection learningPaths={data.learningPaths} />
        <PlanSection />
      </main>
      <Footer />
    </>
  );
}

function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('./data.json')
      .then(res => res.json())
      .then((d: AppData) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingScreen />;
  if (!data) return <ErrorScreen />;

  // Build company list from data.companies
  const companies = (data as any).companies || [];
  const companyQuestions = (data as any).companyQuestions || {};

  return (
    <div className="min-h-[100dvh] bg-[#0B0F1A]">
      <Navbar />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<HomePage companies={companies} />} />
          <Route
            path="/deepseek"
            element={<DeepSeekPage data={data} />}
          />
          <Route
            path="/huawei"
            element={
              <CompanyPage
                companies={companies}
                generalQuestions={data.questions}
                companyQuestions={companyQuestions}
                interviewModes={data.interviewModes}
              />
            }
          />
          <Route
            path="/bytedance"
            element={
              <CompanyPage
                companies={companies}
                generalQuestions={data.questions}
                companyQuestions={companyQuestions}
                interviewModes={data.interviewModes}
              />
            }
          />
          <Route
            path="/samsung"
            element={
              <CompanyPage
                companies={companies}
                generalQuestions={data.questions}
                companyQuestions={companyQuestions}
                interviewModes={data.interviewModes}
              />
            }
          />
          <Route
            path="/general"
            element={
              <GeneralPage
                questions={data.questions}
                choiceQuestions={data.choiceQuestions}
                interviewModes={data.interviewModes}
              />
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
