#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const APP_DATA = path.join(ROOT, 'apps', 'interview', 'public', 'data.json');
const DOCS_DATA = path.join(ROOT, 'docs', 'interview', 'data.json');

const DEEPSEEK_URL = 'https://app.mokahr.com/social-recruitment/high-flyer/140576#/jobs';
const DEEPSEEK_HTML_URL = 'https://app.mokahr.com/social-recruitment/high-flyer/140576/';
const DEEPSEEK_JOBS_API = 'https://app.mokahr.com/api/outer/ats-apply/website/jobs/module';
const XIAOMI_CAMPUS_URL = 'https://hr.xiaomi.com/campus';
const XIAOMI_TOP_TALENT_URL = 'https://xiaomi.jobs.f.mioffice.cn/toptalent/';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

const dryRun = process.argv.includes('--dry-run');

const LLM_AGENT_RELEVANCE_PATTERN =
  /agent|智能体|大模型|llm|基座模型|多模态|生成式|vla|深度学习|强化学习|rlhf|ppo|dpo|grpo|ai\s*infra|AI超算|超算集群|模型训练|模型推理|推理框架|推理加速|AI编译器/i;
const XIAOMI_BIG_MODEL_CONTEXT_PATTERN =
  /认知|记忆|问答|对话|训练|推理|对齐|评估|语音|视觉|影像|端侧|垂域|开源|成本|编译器|infra|芯片协同|生成与理解/i;

function isAgentOrLlmJob(title, groupName = '') {
  const normalizedTitle = String(title || '');
  const normalizedGroup = String(groupName || '');

  if (LLM_AGENT_RELEVANCE_PATTERN.test(normalizedTitle)) return true;
  return normalizedGroup === '大模型' && XIAOMI_BIG_MODEL_CONTEXT_PATTERN.test(normalizedTitle);
}

function todayInChina() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function dateOnly(value) {
  if (!value || typeof value !== 'string') return '';
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.valueOf())) {
    return parsed.toISOString().slice(0, 10);
  }
  const match = value.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : '';
}

function hashText(value) {
  return crypto.createHash('sha1').update(value).digest('hex').slice(0, 10);
}

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, '').toLowerCase();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function splitSetCookie(header) {
  if (!header) return [];
  return header.split(/,(?=\s*[^;,=\s]+=[^;,]+)/g).map(item => item.trim()).filter(Boolean);
}

function getSetCookies(headers) {
  if (typeof headers.getSetCookie === 'function') return headers.getSetCookie();
  return splitSetCookie(headers.get('set-cookie'));
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout ?? 30000);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'user-agent': USER_AGENT,
        accept: options.accept || '*/*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.7',
        ...(options.headers || {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchText(url, options = {}) {
  const response = await fetchWithTimeout(url, options);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
}

async function fetchHtmlWithCookies(url) {
  let current = url;
  let cookie = '';

  for (let i = 0; i < 8; i += 1) {
    const response = await fetchWithTimeout(current, {
      redirect: 'manual',
      accept: 'text/html,application/xhtml+xml',
      headers: cookie ? { cookie } : {},
    });

    const cookieParts = getSetCookies(response.headers)
      .map(item => item.split(';')[0])
      .filter(Boolean);
    cookie = unique([...(cookie ? cookie.split('; ') : []), ...cookieParts]).join('; ');

    if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
      current = new URL(response.headers.get('location'), current).toString();
      continue;
    }

    if (!response.ok) throw new Error(`${current} returned ${response.status}`);
    return { html: await response.text(), cookie };
  }

  throw new Error(`Too many redirects while fetching ${url}`);
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function getAttribute(tag, name) {
  const pattern = new RegExp(`${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i');
  const match = tag.match(pattern);
  return match ? match[2] : '';
}

function extractInitData(html) {
  const input = html.match(/<input\b(?=[^>]*\bid=["']init-data["'])[^>]*>/i);
  if (!input) throw new Error('Moka init-data input not found');
  const value = getAttribute(input[0], 'value');
  if (!value) throw new Error('Moka init-data value not found');
  return JSON.parse(decodeHtml(value));
}

function decryptMokaPayload(payload, aesIv) {
  if (!payload?.necromancer || !payload?.data || !aesIv) return payload;
  const key = Buffer.from(payload.necromancer, 'utf8');
  const iv = Buffer.from(aesIv, 'utf8');
  const decipher = crypto.createDecipheriv(`aes-${key.length * 8}-cbc`, key, iv);
  const decrypted = Buffer.concat([decipher.update(payload.data, 'base64'), decipher.final()]).toString('utf8');
  return JSON.parse(decrypted);
}

function cityNameFromMokaLocation(location) {
  const text = `${location?.country || ''}${location?.address || ''}`;
  if (text.includes('北京')) return '北京';
  if (text.includes('杭州')) return '杭州';
  if (text.includes('上海')) return '上海';
  if (text.includes('深圳')) return '深圳';
  if (text.includes('广州')) return '广州';

  const cityId = String(location?.cityId || '');
  if (cityId.startsWith('11')) return '北京';
  if (cityId.startsWith('31')) return '上海';
  if (cityId.startsWith('3301')) return '杭州';
  if (cityId.startsWith('4403')) return '深圳';
  if (cityId.startsWith('4401')) return '广州';
  return location?.country || '官方未标注';
}

function formatMokaLocations(job) {
  const locations = Array.isArray(job.locations) && job.locations.length ? job.locations : [job.location];
  return unique(locations.map(cityNameFromMokaLocation)).join('/') || '官方未标注';
}

function categoriesForTitle(title) {
  const categories = [];
  if (/数据|策略|评测|标注|语料/.test(title)) categories.push('data_strategy');
  if (/产品|商业|运营/.test(title)) categories.push('product');
  if (/全栈|工程|研发|前端|客户端|测试|运维|系统|架构|平台|集群|infra/i.test(title)) {
    categories.push('engineering');
  }
  if (/算法|模型|深度学习|强化学习|推理|视觉|语音|多模态|Agent|智能体|研究/.test(title)) {
    categories.push('algo_rl');
  }
  if (/系统|架构|推理|集群|芯片|端侧|分布式|OS|infra/i.test(title)) categories.push('system');
  if (!categories.length) categories.push('engineering', 'behavior');
  if (!categories.includes('behavior')) categories.push('behavior');
  return unique(categories).slice(0, 4);
}

function tagsForTitle(title, fallback = []) {
  const candidates = [];
  const rules = [
    [/Agent|智能体/i, 'Agent'],
    [/大模型|模型|LLM/i, '大模型'],
    [/深度学习|强化学习|算法|PPO|DPO|RLHF/i, '算法研究'],
    [/数据|策略|评测|标注|语料/i, '数据策略'],
    [/全栈/i, '全栈'],
    [/前端/i, '前端'],
    [/客户端/i, '客户端'],
    [/测试/i, '测试开发'],
    [/运维|集群|超算/i, '基础设施'],
    [/产品/i, '产品策略'],
    [/芯片/i, '芯片'],
    [/自动驾驶|座舱/i, '智能汽车'],
    [/机器人|具身/i, '具身智能'],
    [/视觉|影像|视频|3D/i, '视觉多模态'],
    [/语音/i, '语音'],
    [/端侧|IoT|可穿戴/i, '端侧智能'],
  ];

  for (const [pattern, label] of rules) {
    if (pattern.test(title)) candidates.push(label);
  }

  return unique([...fallback, ...candidates]).slice(0, 5);
}

function levelForTitle(title, sourceUrl = '') {
  if (/topintern/.test(sourceUrl)) return '顶尖实习';
  if (/toptalent/.test(sourceUrl)) return '顶尖校招';
  if (/研究员|负责人|专家|资深|架构/.test(title)) return '高级';
  if (/工程师|产品经理|研发/.test(title)) return '中高级';
  return '开放岗位';
}

function focusForTitle(title, tags, categories) {
  const focus = [...tags];
  const byCategory = {
    algo_rl: ['模型训练', '算法推理'],
    engineering: ['工程实现', '系统落地'],
    data_strategy: ['数据闭环', '评测体系'],
    product: ['产品策略', '需求拆解'],
    system: ['系统设计', '稳定性'],
    behavior: ['项目复盘'],
  };

  for (const category of categories) {
    focus.push(...(byCategory[category] || []));
  }

  return unique(focus).slice(0, 6);
}

function existingJobMaps(company) {
  const byId = new Map();
  const byTitle = new Map();
  for (const job of company?.jobs || []) {
    byId.set(job.id, job);
    byTitle.set(normalizeText(job.title), job);
  }
  return { byId, byTitle };
}

function normalizeDeepSeekJob(job, existing, today) {
  const title = String(job.title || '').trim();
  const existingJob = existing.byTitle.get(normalizeText(title));
  const id = existingJob?.id || `ds_${hashText(job.id || title)}`;
  const categories = categoriesForTitle(title);
  const tags = tagsForTitle(title, existingJob?.tags || []);
  const firstSeenAt = dateOnly(job.openedAt) || dateOnly(job.createdAt) || existingJob?.source?.firstSeenAt || today;
  const snapshotDate = dateOnly(job.updatedAt) || today;

  return {
    id,
    title,
    salary: existingJob?.salary || '官方未公开',
    location: formatMokaLocations(job),
    level: existingJob?.level || levelForTitle(title),
    tags,
    description:
      existingJob?.description ||
      `${title}，来自 DeepSeek 官方招聘页，关注大模型、Agent、工程平台或业务系统的真实落地。`,
    source: {
      company: 'DeepSeek',
      sourceName: 'DeepSeek 官方招聘页（Moka）',
      sourceUrl: DEEPSEEK_URL,
      evidenceUrl: DEEPSEEK_URL,
      firstSeenAt,
      snapshotDate,
      status: job.status || 'open',
      note: '岗位由 GitHub Actions 从 DeepSeek 官方 Moka 招聘页同步；岗位状态、薪资和 JD 细节以官方页面为准。',
    },
    questionCategories: categories,
    questionFocus: focusForTitle(title, tags, categories),
  };
}

async function fetchDeepSeekJobs(existingCompany, today) {
  const { html, cookie } = await fetchHtmlWithCookies(DEEPSEEK_HTML_URL);
  const initData = extractInitData(html);
  let jobs = Array.isArray(initData.jobs) ? initData.jobs : [];

  try {
    const response = await fetchWithTimeout(DEEPSEEK_JOBS_API, {
      method: 'POST',
      accept: 'application/json, text/plain, */*',
      headers: {
        'content-type': 'application/json',
        origin: 'https://app.mokahr.com',
        referer: DEEPSEEK_HTML_URL,
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify({
        siteId: initData.org?.siteId || 140576,
        orgId: initData.org?.id || 'high-flyer',
        keyword: '',
        limit: 100,
        offset: 0,
        locationIds: [],
        zhinengIds: [],
        departmentIds: [],
        commitments: [],
        projectFolderIds: [],
        campusSiteIds: [],
        needGroupType: 'list',
      }),
    });
    const encrypted = await response.json();
    const decrypted = decryptMokaPayload(encrypted, initData.aesIv);
    const apiJobs = decrypted?.data?.jobs || decrypted?.jobs || [];
    if (Array.isArray(apiJobs) && apiJobs.length > jobs.length) jobs = apiJobs;
  } catch (error) {
    console.warn(`[deepseek] API fallback to init-data: ${error.message}`);
  }

  const existing = existingJobMaps(existingCompany);
  const normalized = jobs
    .filter(job => job?.title && (!job.status || job.status === 'open'))
    .filter(job => isAgentOrLlmJob(job.title))
    .map(job => normalizeDeepSeekJob(job, existing, today));

  return normalized;
}

function extractArrayAfter(code, marker) {
  const markerIndex = code.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Marker ${marker} not found`);
  const start = code.indexOf('[', markerIndex);
  if (start < 0) throw new Error(`Array after ${marker} not found`);

  let depth = 0;
  let quote = '';
  let escaped = false;

  for (let i = start; i < code.length; i += 1) {
    const char = code[i];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = '';
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === '[') depth += 1;
    if (char === ']') {
      depth -= 1;
      if (depth === 0) return code.slice(start, i + 1);
    }
  }

  throw new Error(`Array after ${marker} is not closed`);
}

async function fetchXiaomiTopicGroups() {
  const campusHtml = await fetchText(XIAOMI_CAMPUS_URL, { accept: 'text/html,application/xhtml+xml' });
  const hash = campusHtml.match(/var HASH = '([^']+)'/)?.[1];
  if (!hash) throw new Error('Xiaomi HR asset hash not found');

  const chunkUrl = `https://cnbj1.fds.api.xiaomi.com/hr-official/${hash}/js/559.chunk.js`;
  const chunk = await fetchText(chunkUrl, { accept: 'application/javascript,text/javascript,*/*' });
  const literal = extractArrayAfter(chunk, 'R=');
  const groups = Function(`"use strict"; return (${literal});`)();
  if (!Array.isArray(groups) || !groups.length) throw new Error('Xiaomi topic groups not found');

  return { hash, groups };
}

function normalizeXiaomiJobs(groups, hash, existingCompany, today) {
  const existing = existingJobMaps(existingCompany);
  const snapshotDate = dateOnly(hash) || today;
  const jobs = [];

  for (const group of groups) {
    for (const topic of group.children || []) {
      if (!isAgentOrLlmJob(topic.name, group.name)) continue;

      const links = Array.isArray(topic.links) && topic.links.length ? topic.links : [XIAOMI_TOP_TALENT_URL];
      links.forEach((sourceUrl, index) => {
        const positionId = sourceUrl.match(/position\/([^/]+)/)?.[1] || hashText(`${topic.name}-${sourceUrl}-${index}`);
        const title = String(topic.name || '').trim();
        const id = `xm_${positionId}_${hashText(title).slice(0, 6)}`;
        const existingJob = existing.byId.get(id) || existing.byTitle.get(normalizeText(title));
        const location = topic.cities?.[index] || (topic.cities?.length ? topic.cities.join('/') : '官方未标注');
        const categories = categoriesForTitle(title);
        const tags = tagsForTitle(title, [group.name, sourceUrl.includes('topintern') ? '实习' : '校招']);

        jobs.push({
          id,
          title,
          salary: existingJob?.salary || '官方未公开',
          location,
          level: existingJob?.level || levelForTitle(title, sourceUrl),
          tags,
          description:
            existingJob?.description ||
            `小米${group.name}方向岗位/课题：${title}。来自小米官方招聘页，适合对 AI、工程系统与产业落地感兴趣的候选人跟踪。`,
          source: {
            company: '小米',
            sourceName: '小米官方招聘页',
            sourceUrl,
            evidenceUrl: XIAOMI_CAMPUS_URL,
            firstSeenAt: existingJob?.source?.firstSeenAt || today,
            snapshotDate,
            status: 'official-listing',
            note: `岗位来自小米官方 HR 页面「${group.name}」方向清单；投递状态、工作地点和 JD 细节以官方详情页为准。`,
          },
          questionCategories: categories,
          questionFocus: focusForTitle(title, tags, categories),
        });
      });
    }
  }

  return jobs;
}

function upsertCompany(data, id, patch) {
  const index = data.companies.findIndex(company => company.id === id);
  if (index >= 0) {
    data.companies[index] = { ...data.companies[index], ...patch };
  } else {
    data.companies.push({ id, ...patch });
  }
}

function buildXiaomiQuestions(data) {
  const plan = [
    ['algo_rl', 20],
    ['engineering', 20],
    ['data_strategy', 12],
    ['system', 12],
    ['product', 8],
    ['behavior', 8],
  ];
  const selected = [];

  for (const [category, count] of plan) {
    const source = data.questions?.[category] || [];
    selected.push(...source.slice(0, count));
  }

  return selected.slice(0, 80).map((question, index) => ({
    ...question,
    id: `xm_${question.id}`,
    number: index + 1,
  }));
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

async function writeJson(file, data) {
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function main() {
  const today = todayInChina();
  const data = await readJson(APP_DATA);
  const existingDeepSeek = data.companies.find(company => company.id === 'deepseek');
  const existingXiaomi = data.companies.find(company => company.id === 'xiaomi');

  const [deepSeekResult, xiaomiResult] = await Promise.allSettled([
    fetchDeepSeekJobs(existingDeepSeek, today),
    fetchXiaomiTopicGroups().then(({ hash, groups }) => normalizeXiaomiJobs(groups, hash, existingXiaomi, today)),
  ]);

  if (deepSeekResult.status === 'fulfilled' && deepSeekResult.value.length) {
    upsertCompany(data, 'deepseek', {
      name: 'DeepSeek',
      logo: '🔍',
      description: '深度求索，中国领先的大模型公司，以低成本高性能闻名',
      color: '#0EA5E9',
      gradient: 'from-[#0EA5E9] to-[#06B6D4]',
      jobs: deepSeekResult.value,
      questionCount: existingDeepSeek?.questionCount || 518,
    });
  } else {
    console.warn(`[deepseek] skipped: ${deepSeekResult.reason?.message || 'no jobs fetched'}`);
  }

  if (xiaomiResult.status === 'fulfilled' && xiaomiResult.value.length) {
    upsertCompany(data, 'xiaomi', {
      name: '小米',
      logo: '⚡',
      description: '小米集团 AI、智能硬件、汽车、IoT 与大模型方向岗位跟踪',
      color: '#FF6900',
      gradient: 'from-[#FF6900] to-[#F59E0B]',
      jobs: xiaomiResult.value,
      questionCount: 80,
    });
    data.companyQuestions = data.companyQuestions || {};
    data.companyQuestions.xiaomi = buildXiaomiQuestions(data);
  } else {
    console.warn(`[xiaomi] skipped: ${xiaomiResult.reason?.message || 'no jobs fetched'}`);
  }

  const summary = data.companies.map(company => `${company.id}:${company.jobs.length}`).join(', ');
  console.log(`Recruiting sync summary: ${summary}`);

  if (dryRun) return;

  await writeJson(APP_DATA, data);
  try {
    await fs.access(DOCS_DATA);
    await writeJson(DOCS_DATA, data);
  } catch {
    console.warn(`[docs] ${DOCS_DATA} not found; app data updated only`);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
