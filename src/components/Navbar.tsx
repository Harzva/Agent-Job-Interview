import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: '首页', href: '#hero' },
  { label: '岗位', href: '#positions' },
  { label: '能力模型', href: '#competency' },
  { label: '面试题', href: '#interview' },
  { label: 'GitHub', href: '#github' },
  { label: '学习路径', href: '#learning' },
  { label: '冲刺计划', href: '#plan' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 100);

      const sections = navLinks.map(l => l.href.slice(1));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
        scrolled ? 'bg-[rgba(11,15,26,0.95)] backdrop-blur-xl border-b border-[#1E293B]' : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[1280px] mx-auto h-full flex items-center justify-between px-6">
        <a href="#hero" onClick={() => handleClick('#hero')} className="font-display font-bold text-lg text-[#F8FAFC] tracking-tight">
          DeepSeek Agent
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={e => { e.preventDefault(); handleClick(link.href); }}
              className={`text-sm font-medium transition-colors duration-300 ${
                activeSection === link.href.slice(1)
                  ? 'text-[#0EA5E9]'
                  : 'text-[#94A3B8] hover:text-[#0EA5E9]'
              }`}
            >
              {link.label}
              {activeSection === link.href.slice(1) && (
                <motion.div layoutId="nav-underline" className="h-0.5 bg-[#0EA5E9] mt-0.5" />
              )}
            </a>
          ))}
        </div>

        <button
          className="md:hidden text-[#F8FAFC]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-16 left-0 right-0 bg-[rgba(11,15,26,0.98)] backdrop-blur-xl border-b border-[#1E293B]"
          >
            <div className="flex flex-col p-4 gap-2">
              {navLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={e => { e.preventDefault(); handleClick(link.href); }}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === link.href.slice(1)
                      ? 'text-[#0EA5E9] bg-[rgba(14,165,233,0.1)]'
                      : 'text-[#94A3B8] hover:text-[#0EA5E9] hover:bg-[rgba(14,165,233,0.05)]'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
