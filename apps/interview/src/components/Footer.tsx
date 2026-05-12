import { Github, Twitter, BookOpen } from 'lucide-react';

const footerLinks = [
  { label: '首页', href: '#hero' },
  { label: '招聘岗位', href: '#positions' },
  { label: '能力模型', href: '#competency' },
  { label: '面试题库', href: '#interview' },
  { label: 'GitHub项目', href: '#github' },
  { label: '学习路径', href: '#learning' },
];

export default function Footer() {
  const handleClick = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0B0F1A] border-t border-[#1E293B]">
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-display font-bold text-lg text-[#F8FAFC] mb-2">
              DeepSeek Agent 岗位分析
            </h3>
            <p className="text-sm text-[#64748B] leading-relaxed">
              基于 DeepSeek 2026.04.27 Agent 方向招聘信息深度解析，覆盖算法、工程、产品、系统全栈能力体系
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-[#64748B] hover:text-[#0EA5E9] transition-colors">
                <Github size={18} />
              </a>
              <a href="#" className="text-[#64748B] hover:text-[#0EA5E9] transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-[#64748B] hover:text-[#0EA5E9] transition-colors">
                <BookOpen size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm text-[#F8FAFC] mb-3">快速导航</h4>
            <div className="flex flex-col gap-2">
              {footerLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={e => { e.preventDefault(); handleClick(link.href); }}
                  className="text-sm text-[#64748B] hover:text-[#0EA5E9] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm text-[#F8FAFC] mb-3">相关资源</h4>
            <div className="flex flex-col gap-2">
              <a href="https://github.com/deepseek-ai" target="_blank" rel="noopener noreferrer" className="text-sm text-[#64748B] hover:text-[#0EA5E9] transition-colors">
                DeepSeek GitHub
              </a>
              <a href="https://www.deepseek.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[#64748B] hover:text-[#0EA5E9] transition-colors">
                DeepSeek 官网
              </a>
              <a href="https://github.com/modelcontextprotocol" target="_blank" rel="noopener noreferrer" className="text-sm text-[#64748B] hover:text-[#0EA5E9] transition-colors">
                MCP Protocol
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#1E293B] pt-6 text-center">
          <p className="text-xs text-[#64748B]">
            &copy; 2026 DeepSeek Agent 岗位分析 | 数据来源：DeepSeek 2026.04.27 招聘信息
          </p>
        </div>
      </div>
    </footer>
  );
}
