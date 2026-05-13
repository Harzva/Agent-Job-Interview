import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const sectionLinks = [
  { label: '首页', id: 'hero' },
  { label: '主题预览', id: 'theme-lab' },
  { label: '岗位流动', id: 'company-flow' },
  { label: '公司', id: 'companies' },
];

const routeLinks = [
  { label: '通用题库', to: '/general' },
  { label: 'DeepSeek', to: '/deepseek' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 100);

      if (location.pathname !== '/') return;
      for (let i = sectionLinks.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionLinks[i].id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(sectionLinks[i].id);
          break;
        }
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  const scrollToSection = (id: string) => {
    setMobileOpen(false);

    const scroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveSection(id);
      }
    };

    if (location.pathname !== '/') {
      navigate('/');
      window.setTimeout(scroll, 80);
      return;
    }

    scroll();
  };

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 h-16 transition-all duration-300 ${
        scrolled
          ? 'border-b border-[#1E293B] bg-[rgba(11,15,26,0.95)] backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-6">
        <button
          type="button"
          onClick={() => scrollToSection('hero')}
          className="font-display text-lg font-bold tracking-tight text-[#F8FAFC]"
        >
          Agent Interview
        </button>

        <div className="hidden items-center gap-7 md:flex">
          {sectionLinks.map(link => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollToSection(link.id)}
              className={`text-sm font-medium transition-colors duration-300 ${
                location.pathname === '/' && activeSection === link.id
                  ? 'text-[#0EA5E9]'
                  : 'text-[#94A3B8] hover:text-[#0EA5E9]'
              }`}
            >
              {link.label}
              {location.pathname === '/' && activeSection === link.id && (
                <motion.div layoutId="nav-underline" className="mt-0.5 h-0.5 bg-[#0EA5E9]" />
              )}
            </button>
          ))}

          {routeLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors duration-300 ${
                location.pathname === link.to ? 'text-[#0EA5E9]' : 'text-[#94A3B8] hover:text-[#0EA5E9]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          className="text-[#F8FAFC] md:hidden"
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
            className="absolute left-0 right-0 top-16 border-b border-[#1E293B] bg-[rgba(11,15,26,0.98)] backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-2 p-4">
              {sectionLinks.map(link => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    location.pathname === '/' && activeSection === link.id
                      ? 'bg-[rgba(14,165,233,0.1)] text-[#0EA5E9]'
                      : 'text-[#94A3B8] hover:bg-[rgba(14,165,233,0.05)] hover:text-[#0EA5E9]'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              {routeLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'bg-[rgba(14,165,233,0.1)] text-[#0EA5E9]'
                      : 'text-[#94A3B8] hover:bg-[rgba(14,165,233,0.05)] hover:text-[#0EA5E9]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
