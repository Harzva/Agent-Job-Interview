import katex from 'katex';
import 'katex/dist/katex.min.css';

interface FormulaPlaceholder { id: string; html: string; }

const escapeHtml = (text: string): string => {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

const extractLatex = (text: string): { text: string; formulas: FormulaPlaceholder[] } => {
  const formulas: FormulaPlaceholder[] = [];
  let counter = 0;
  const addPlaceholder = (html: string): string => {
    const id = `__LATEX_FORMULA_${counter++}__`;
    formulas.push({ id, html });
    return id;
  };
  let result = text.replace(/\$\$([\s\S]+?)\$\$/g, (_m, formula) => {
    try { return addPlaceholder(katex.renderToString(formula.trim(), { throwOnError: false, displayMode: true })); }
    catch { return addPlaceholder(`<span style="color:#7DD3FC">$$${formula.trim()}$$</span>`); }
  });
  result = result.replace(/(?<!\$)\$([^$\n]+?)\$(?!\$)/g, (_m, formula) => {
    try { return addPlaceholder(katex.renderToString(formula.trim(), { throwOnError: false, displayMode: false })); }
    catch { return addPlaceholder(`<span style="color:#7DD3FC">$${formula.trim()}$</span>`); }
  });
  return { text: result, formulas };
};

const restoreLatex = (html: string, formulas: FormulaPlaceholder[]): string => {
  let result = html;
  for (const { id, html: h } of formulas) result = result.replace(id, h);
  return result;
};

export function renderMarkdownToHtml(text: string): string {
  if (!text) return '';
  const { text: textWL, formulas } = extractLatex(text);
  let html = escapeHtml(textWL);
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_m, lang, code) => `<pre class="markdown-code-block"${lang?` data-lang="${lang}"`:''}><code>${code.trim()}</code></pre>`);
  html = html.replace(/^#{3,6}\s+(.+)$/gm, '<h4 class="markdown-h4">$1</h4>');
  html = html.replace(/^#{1,2}\s+(.+)$/gm, '<h3 class="markdown-h3">$1</h3>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="markdown-bold">$1</strong>');
  const lines = html.split('\n');
  html = lines.map(line => line.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em class="markdown-italic">$1</em>')).join('\n');
  html = html.replace(/`([^`]+)`/g, '<code class="markdown-inline-code">$1</code>');
  html = html.replace(/^[-]\s+(.+)$/gm, '<li class="markdown-li">$1</li>');
  html = html.replace(/(<li class="markdown-li">.*?<\/li>\s*)+/g, (m) => '<ul class="markdown-ul">' + m + '</ul>');
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="markdown-oli">$1</li>');
  html = html.replace(/(<li class="markdown-oli">.*?<\/li>\s*)+/g, (m) => '<ol class="markdown-ol">' + m + '</ol>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="markdown-link">$1</a>');
  html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote class="markdown-blockquote">$1</blockquote>');
  html = html.replace(/^---+$/gm, '<hr class="markdown-hr" />');
  const blocks = html.split(/\n\s*\n/);
  const result = blocks.map(block => {
    const t = block.trim(); if (!t) return '';
    if (t.startsWith('<')) return t;
    return '<p class="markdown-p">' + t.replace(/\n/g, '<br/>') + '</p>';
  });
  html = result.filter(Boolean).join('\n\n').replace(/<p class="markdown-p"><\/p>/g, '');
  return restoreLatex(html, formulas);
}

interface Props { content: string; className?: string; }
export default function MarkdownRenderer({ content, className = '' }: Props) {
  const html = renderMarkdownToHtml(content);
  return <div className={`markdown-body ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
