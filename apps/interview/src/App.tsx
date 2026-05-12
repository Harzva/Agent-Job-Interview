import { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router';
import Navbar from '@/components/Navbar';
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
            path="/general"
            element={
              <GeneralPage
                questions={data.questions}
                choiceQuestions={data.choiceQuestions}
                interviewModes={data.interviewModes}
              />
            }
          />
          <Route
            path="/:companyId"
            element={
              <CompanyPage
                companies={companies}
                generalQuestions={data.questions}
                companyQuestions={companyQuestions}
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
