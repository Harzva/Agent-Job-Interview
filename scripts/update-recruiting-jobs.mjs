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
const KIMI_URL = 'https://careers.kimi.com/';
const KIMI_MOKA_URL = 'https://app.mokahr.com/apply/moonshot/148506#/jobs';
const KIMI_MOKA_HTML_URL = 'https://app.mokahr.com/apply/moonshot/148506/';
const MINIMAX_URL = 'https://www.minimaxi.com/careers';
const MINIMAX_FEISHU_SOCIAL_URL = 'https://vrfi1sk8a0.jobs.feishu.cn/index/';
const MINIMAX_FEISHU_CAMPUS_URL = 'https://vrfi1sk8a0.jobs.feishu.cn/379481/';
const ZHIPU_CAMPUS_URL = 'https://zhipu-ai.jobs.feishu.cn/zhipucampus/';
const XIAOMI_CAMPUS_URL = 'https://hr.xiaomi.com/campus';
const XIAOMI_TOP_TALENT_URL = 'https://xiaomi.jobs.f.mioffice.cn/toptalent/';
const COMPANY_LOGO_URLS = {
  deepseek: './logos/deepseek.png',
  huawei: './logos/huawei.png',
  bytedance: './logos/bytedance.svg',
  samsung: './logos/samsung.svg',
  xiaomi: './logos/xiaomi.png',
  kimi: 'https://careers.kimi.com/favicon.ico?favicon.151bc5b8.ico',
  minimax: 'https://filecdn.minimax.chat/public/58eca777-e31f-448a-9823-e2220e49b426.png',
  zhipu: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/uptkheh7nulozbflpe/portal_build/logo/logo.png',
};

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

const dryRun = process.argv.includes('--dry-run');

const LLM_AGENT_RELEVANCE_PATTERN =
  /agent|智能体|大模型|llm|基座模型|多模态|生成式|vla|深度学习|强化学习|rlhf|ppo|dpo|grpo|ai\s*infra|AI超算|超算集群|模型训练|模型推理|推理框架|推理加速|AI编译器/i;
const LLM_AGENT_DETAIL_PATTERN =
  /agent|智能体|大模型|llm|vlm|glm|基座模型|多模态|生成式|rag|tool\s*use|强化学习|rlhf|ppo|dpo|grpo|megatron|deepspeed|模型训练|模型推理|推理框架|推理加速|AI编译器/i;
const FEISHU_STRONG_TITLE_PATTERN =
  /agent|智能体|大模型|llm|vlm|glm|agi|aigc|多模态|基座模型|语言模型|模型(?!.*招聘)|强化学习|rlhf|ppo|dpo|grpo|推理|训练框架|预训练|后训练|ai\s*(agent|infra|system|前端|后端|服务端|全栈|客户端|产品|评测|算法|系统|平台|基础设施)|ai[-\s]?system|ai基础设施|ai评测|ai产品/i;
const FEISHU_TECH_TITLE_PATTERN =
  /算法|工程师|研发|研究|架构|开发|平台|系统|数据|评测|产品经理|PM|TPM|FDE|Infra|Devops|K8S|Kernel|Linux|Co-Design|Vibe Coder/i;
const NON_TARGET_FEISHU_TITLE_PATTERN =
  /采购|行政|招聘|Talent Acquisition|HR|市场部|市场营销|营销|销售|渠道|商务|Account Executive|General Manager|GTM|SEO|KOL|品宣|运营|安全运营$|Regional/i;
const FEISHU_NON_TARGET_OVERRIDE_PATTERN =
  /agent|智能体|工程师|研发|算法|产品经理|PM|TPM|FDE|架构|数据|评测|系统|平台|Infra|开发|研究|Co-Design|训练框架|推理框架/i;
const XIAOMI_BIG_MODEL_CONTEXT_PATTERN =
  /认知|记忆|问答|对话|训练|推理|对齐|评估|语音|视觉|影像|端侧|垂域|开源|成本|编译器|infra|芯片协同|生成与理解/i;

function isAgentOrLlmJob(title, groupName = '', detailText = '') {
  const normalizedTitle = String(title || '');
  const normalizedGroup = String(groupName || '');
  const normalizedDetail = String(detailText || '');

  if (LLM_AGENT_RELEVANCE_PATTERN.test(normalizedTitle)) return true;
  if (LLM_AGENT_RELEVANCE_PATTERN.test(normalizedGroup)) return true;
  if (LLM_AGENT_DETAIL_PATTERN.test(normalizedDetail)) return true;
  return normalizedGroup === '大模型' && XIAOMI_BIG_MODEL_CONTEXT_PATTERN.test(normalizedTitle);
}

function isFeishuAgentOrLlmJob(title, groupName = '', detailText = '') {
  const normalizedTitle = String(title || '');
  const normalizedGroup = String(groupName || '');
  const normalizedDetail = String(detailText || '');

  if (NON_TARGET_FEISHU_TITLE_PATTERN.test(normalizedTitle) && !FEISHU_NON_TARGET_OVERRIDE_PATTERN.test(normalizedTitle)) {
    return false;
  }

  if (FEISHU_STRONG_TITLE_PATTERN.test(`${normalizedTitle} ${normalizedGroup}`)) return true;
  return FEISHU_TECH_TITLE_PATTERN.test(normalizedTitle) && LLM_AGENT_DETAIL_PATTERN.test(normalizedDetail);
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

function plainText(value) {
  return decodeHtml(String(value || ''))
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function dateFromTimestamp(value) {
  if (!value) return '';
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '';
  const milliseconds = numeric > 1e12 ? numeric : numeric * 1000;
  const parsed = new Date(milliseconds);
  return Number.isNaN(parsed.valueOf()) ? '' : parsed.toISOString().slice(0, 10);
}

function summarizeJobText(title, companyName, description, requirement) {
  const summary = plainText(description || requirement).slice(0, 120);
  if (summary) return summary;
  return `${title}，来自 ${companyName} 官方招聘页，关注大模型、Agent、工程平台或业务系统的真实落地。`;
}

function normalizeOfficialJob(job, existing, today, config) {
  const title = String(job.title || '').trim();
  const existingJob = existing.byTitle.get(normalizeText(title));
  const id = existingJob?.id || `${config.prefix}_${hashText(job.id || title)}`;
  const categories = categoriesForTitle(title);
  const tags = tagsForTitle(title, existingJob?.tags || []);
  const firstSeenAt =
    dateOnly(job.openedAt) ||
    dateOnly(job.createdAt) ||
    dateFromTimestamp(job.publish_time) ||
    existingJob?.source?.firstSeenAt ||
    today;
  const snapshotDate = dateOnly(job.updatedAt) || today;
  const description = summarizeJobText(title, config.companyName, job.description, job.requirement);

  return {
    id,
    title,
    salary: existingJob?.salary || '官方未公开',
    location: config.formatLocation(job),
    level: existingJob?.level || levelForTitle(title),
    tags,
    description: existingJob?.description || description,
    source: {
      company: config.companyName,
      sourceName: config.sourceName,
      sourceUrl: config.sourceUrlForJob?.(job) || config.sourceUrl,
      evidenceUrl: config.evidenceUrl,
      firstSeenAt,
      snapshotDate,
      status: job.status || 'open',
      note: config.note,
    },
    questionCategories: categories,
    questionFocus: focusForTitle(title, tags, categories),
  };
}

async function fetchMokaJobs(config, existingCompany, today) {
  const { html, cookie } = await fetchHtmlWithCookies(config.htmlUrl);
  const initData = extractInitData(html);
  let jobs = Array.isArray(initData.jobs) ? initData.jobs : [];

  try {
    const response = await fetchWithTimeout(DEEPSEEK_JOBS_API, {
      method: 'POST',
      accept: 'application/json, text/plain, */*',
      headers: {
        'content-type': 'application/json',
        origin: 'https://app.mokahr.com',
        referer: config.htmlUrl,
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify({
        siteId: initData.org?.siteId || config.siteId,
        orgId: initData.org?.id || config.orgId,
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
    console.warn(`[${config.companyId}] Moka API fallback to init-data: ${error.message}`);
  }

  const existing = existingJobMaps(existingCompany);
  const seen = new Set();
  const normalized = jobs
    .filter(job => job?.title && (!job.status || job.status === 'open'))
    .filter(job => isAgentOrLlmJob(job.title, '', `${job.description || ''} ${job.requirement || ''}`))
    .map(job => normalizeOfficialJob(job, existing, today, config))
    .filter(job => {
      const key = normalizeText(`${job.title}-${job.location}`);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return normalized;
}

function fetchDeepSeekJobs(existingCompany, today) {
  return fetchMokaJobs(
    {
      companyId: 'deepseek',
      companyName: 'DeepSeek',
      prefix: 'ds',
      htmlUrl: DEEPSEEK_HTML_URL,
      sourceUrl: DEEPSEEK_URL,
      evidenceUrl: DEEPSEEK_URL,
      sourceName: 'DeepSeek 官方招聘页（Moka）',
      siteId: 140576,
      orgId: 'high-flyer',
      formatLocation: formatMokaLocations,
      note: '岗位由 GitHub Actions 从 DeepSeek 官方 Moka 招聘页同步；岗位状态、薪资和 JD 细节以官方页面为准。',
    },
    existingCompany,
    today,
  );
}

function fetchKimiJobs(existingCompany, today) {
  return fetchMokaJobs(
    {
      companyId: 'kimi',
      companyName: 'Kimi / Moonshot AI',
      prefix: 'kimi',
      htmlUrl: KIMI_MOKA_HTML_URL,
      sourceUrl: KIMI_MOKA_URL,
      evidenceUrl: KIMI_URL,
      sourceName: 'Kimi 官方招聘页（Moka）',
      siteId: 148506,
      orgId: 'moonshot',
      formatLocation: formatMokaLocations,
      note: '岗位由 GitHub Actions 从 Kimi 官方 Moka 招聘页同步；岗位状态、薪资和 JD 细节以官方页面为准。',
    },
    existingCompany,
    today,
  );
}

function extractScriptUrls(html, baseUrl) {
  return [...String(html || '').matchAll(/<script[^>]+src=["']([^"']+)["']/g)]
    .map(match => new URL(match[1], baseUrl).toString());
}

function extractBalancedFunctionBody(code, marker) {
  const markerIndex = code.indexOf(marker);
  if (markerIndex < 0) throw new Error(`${marker} not found`);
  const start = code.indexOf('{', markerIndex);
  if (start < 0) throw new Error(`${marker} body not found`);

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

    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return code.slice(start + 1, i);
    }
  }

  throw new Error(`${marker} body is not closed`);
}

function websitePathFromUrl(url) {
  return new URL(url).pathname.replace(/^\/+/, '').replace(/\/+$/, '');
}

function appendQueryParams(url, data) {
  const pairs = [];
  for (const key of Object.keys(data || {})) {
    const value = data[key];
    if (value !== undefined && value !== 'undefined') {
      pairs.push(`${key}=${encodeURIComponent(value)}`);
    }
  }

  const query = pairs.join('&');
  if (!query) return url;
  return url.includes('?') ? `${url}&${query}` : `${url}?${query}`;
}

let feishuSignerPromise;

async function loadFeishuSigner(referenceUrl) {
  if (feishuSignerPromise) return feishuSignerPromise;

  feishuSignerPromise = (async () => {
    const html = await fetchText(referenceUrl, { accept: 'text/html,application/xhtml+xml' });
    const scriptUrls = extractScriptUrls(html, referenceUrl);

    for (const scriptUrl of scriptUrls) {
      const script = await fetchText(scriptUrl, { accept: 'application/javascript,text/javascript,*/*' });
      if (!script.includes('57195:function') || !script.includes('_signature')) continue;

      const body = extractBalancedFunctionBody(script, '57195:function');
      const module = { exports: {} };
      // Feishu protects public job-list APIs with the same in-page signer used by its career frontend.
      // The job sync executes only this signer module and sends no secrets to the page.
      new Function('e', 't', body)(module, module.exports);
      if (typeof module.exports.sign === 'function') return module.exports.sign;
    }

    throw new Error('Feishu signer not found');
  })();

  return feishuSignerPromise;
}

async function getFeishuCsrf(origin, pageUrl) {
  const response = await fetchWithTimeout(`${origin}/api/v1/csrf/token`, {
    method: 'POST',
    accept: 'application/json, text/plain, */*',
    headers: {
      'content-type': 'application/json',
      origin,
      referer: pageUrl,
      'Portal-Channel': 'saas-career',
      'Portal-Platform': 'pc',
      'website-path': websitePathFromUrl(pageUrl),
    },
    body: JSON.stringify({ portal_entrance: 1 }),
  });

  if (!response.ok) throw new Error(`${origin} csrf returned ${response.status}`);
  const payload = await response.json();
  const token = payload?.data?.token;
  if (!token) throw new Error(`${origin} csrf token not found`);
  const cookie = getSetCookies(response.headers).map(item => item.split(';')[0]).filter(Boolean).join('; ');
  return { token, cookie };
}

async function fetchFeishuJobPosts({ pageUrl, keyword = '', subjectIds = [] }) {
  const origin = new URL(pageUrl).origin;
  const sign = await loadFeishuSigner(pageUrl);
  const { token, cookie } = await getFeishuCsrf(origin, pageUrl);
  const body = {
    keyword,
    limit: 100,
    offset: 0,
    job_category_id_list: [],
    tag_id_list: [],
    location_code_list: [],
    subject_id_list: subjectIds,
    recruitment_id_list: [],
    portal_type: 6,
    job_function_id_list: [],
    storefront_id_list: [],
    portal_entrance: 1,
  };

  let requestPath = appendQueryParams('/api/v1/search/job/posts', body);
  requestPath = appendQueryParams(requestPath, { _signature: sign({ body, url: requestPath }) });

  const response = await fetchWithTimeout(`${origin}${requestPath}`, {
    method: 'POST',
    accept: 'application/json, text/plain, */*',
    headers: {
      'content-type': 'application/json',
      origin,
      referer: pageUrl,
      'Portal-Channel': 'saas-career',
      'Portal-Platform': 'pc',
      'website-path': websitePathFromUrl(pageUrl),
      'x-csrf-token': token,
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(`${pageUrl} returned ${response.status}`);
  const payload = await response.json();
  const jobs = payload?.data?.job_post_list || [];
  if (!Array.isArray(jobs)) throw new Error(`${pageUrl} job list not found`);
  return jobs;
}

function formatFeishuLocations(job) {
  const locations = Array.isArray(job.city_list) && job.city_list.length ? job.city_list : [job.city_info];
  return unique(locations.map(location => location?.i18n_name || location?.name || location?.en_name)).join('/') || '官方未标注';
}

function feishuDetailUrl(pageUrl, job) {
  return new URL(`position/detail/${job.id}`, pageUrl).toString();
}

function normalizeFeishuJob(job, existing, today, config) {
  const title = String(job.title || '').trim();
  const existingJob = existing.byTitle.get(normalizeText(title));
  const id = existingJob?.id || `${config.prefix}_${job.id || hashText(`${title}-${config.pageUrl}`)}`;
  const detailText = `${job.description || ''} ${job.requirement || ''}`;
  const categories = categoriesForTitle(`${title} ${detailText}`);
  const recruitType = job.recruit_type?.i18n_name || job.recruit_type?.name || '';
  const tags = tagsForTitle(`${title} ${detailText}`, [recruitType, config.sourceTag]);
  const publishedAt = dateFromTimestamp(job.publish_time);

  return {
    id,
    title,
    salary: existingJob?.salary || '官方未公开',
    location: formatFeishuLocations(job),
    level: existingJob?.level || levelForTitle(`${title} ${recruitType}`, config.pageUrl),
    tags,
    description: existingJob?.description || summarizeJobText(title, config.companyName, job.description, job.requirement),
    source: {
      company: config.companyName,
      sourceName: config.sourceName,
      sourceUrl: feishuDetailUrl(config.pageUrl, job),
      evidenceUrl: config.evidenceUrl,
      firstSeenAt: publishedAt || existingJob?.source?.firstSeenAt || today,
      snapshotDate: today,
      status: 'open',
      note: config.note,
    },
    questionCategories: categories,
    questionFocus: focusForTitle(title, tags, categories),
  };
}

async function fetchFeishuCompanyJobs(config, existingCompany, today) {
  const existing = existingJobMaps(existingCompany);
  const jobBatches = await Promise.all(
    config.sources.map(source => fetchFeishuJobPosts(source).then(jobs => jobs.map(job => ({ ...job, __source: source })))),
  );
  const jobs = jobBatches.flat();
  const normalized = [];
  const seen = new Set();

  for (const job of jobs) {
    const detailText = `${job.description || ''} ${job.requirement || ''}`;
    if (!job.title || !isFeishuAgentOrLlmJob(job.title, job.job_subject?.i18n_name || job.job_subject?.name || '', detailText)) {
      continue;
    }

    const sourceConfig = {
      ...config,
      pageUrl: job.__source.pageUrl,
      sourceName: job.__source.sourceName || config.sourceName,
      sourceTag: job.__source.sourceTag || config.sourceTag,
    };
    const normalizedJob = normalizeFeishuJob(job, existing, today, sourceConfig);
    const key = normalizeText(`${normalizedJob.title}-${normalizedJob.location}`);
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(normalizedJob);
  }

  return normalized;
}

function fetchMiniMaxJobs(existingCompany, today) {
  return fetchFeishuCompanyJobs(
    {
      companyName: 'MiniMax',
      prefix: 'mm',
      evidenceUrl: MINIMAX_URL,
      sourceName: 'MiniMax 官方招聘页（飞书）',
      sourceTag: '社招',
      note: '岗位由 GitHub Actions 从 MiniMax 官方招聘页及其飞书招聘站同步；岗位状态、薪资和 JD 细节以官方页面为准。',
      sources: [
        { pageUrl: MINIMAX_FEISHU_SOCIAL_URL, sourceName: 'MiniMax 社招官网（飞书）', sourceTag: '社招' },
        { pageUrl: MINIMAX_FEISHU_CAMPUS_URL, sourceName: 'MiniMax 校招官网（飞书）', sourceTag: '校招' },
      ],
    },
    existingCompany,
    today,
  );
}

function fetchZhipuJobs(existingCompany, today) {
  return fetchFeishuCompanyJobs(
    {
      companyName: '智谱 AI',
      prefix: 'zp',
      evidenceUrl: ZHIPU_CAMPUS_URL,
      sourceName: '智谱 AI 校招官网（飞书）',
      sourceTag: '校招',
      note: '岗位由 GitHub Actions 从智谱 AI 官方飞书招聘站同步；岗位状态、薪资和 JD 细节以官方页面为准。',
      sources: [{ pageUrl: ZHIPU_CAMPUS_URL, sourceName: '智谱 AI 校招官网（飞书）', sourceTag: '校招' }],
    },
    existingCompany,
    today,
  );
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

function applyKnownCompanyLogos(data) {
  for (const company of data.companies || []) {
    if (COMPANY_LOGO_URLS[company.id]) {
      company.logoUrl = COMPANY_LOGO_URLS[company.id];
    }
  }
}

function backfillStaticCompanySources(data, today) {
  const sourceMeta = {
    huawei: {
      company: '华为',
      sourceUrl: 'https://career.huawei.com/reccampportal/',
      sourceName: '历史整理样例（华为招聘官网待自动同步）',
    },
    bytedance: {
      company: '字节跳动',
      sourceUrl: 'https://jobs.bytedance.com/',
      sourceName: '历史整理样例（字节招聘官网待自动同步）',
    },
    samsung: {
      company: '三星电子',
      sourceUrl: 'https://www.samsung.com/cn/about-us/careers/',
      sourceName: '历史整理样例（三星招聘官网待自动同步）',
    },
  };

  for (const company of data.companies || []) {
    const meta = sourceMeta[company.id];
    if (!meta) continue;
    for (const job of company.jobs || []) {
      if (job.source?.sourceName) continue;
      job.source = {
        company: meta.company,
        sourceName: meta.sourceName,
        sourceUrl: meta.sourceUrl,
        evidenceUrl: meta.sourceUrl,
        firstSeenAt: today,
        snapshotDate: today,
        status: 'manual-seed',
        note: '该岗位来自早期题库种子数据，保留用于演示公司页和题库绑定；后续可接入官方招聘页自动同步后替换为实时来源。',
      };
    }
  }
}

function buildCompanyQuestionSet(data, prefix) {
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
    id: `${prefix}_${question.id}`,
    number: index + 1,
  }));
}

function buildXiaomiQuestions(data) {
  return buildCompanyQuestionSet(data, 'xm');
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
  const existingKimi = data.companies.find(company => company.id === 'kimi');
  const existingMiniMax = data.companies.find(company => company.id === 'minimax');
  const existingZhipu = data.companies.find(company => company.id === 'zhipu');
  const existingXiaomi = data.companies.find(company => company.id === 'xiaomi');

  const [deepSeekResult, kimiResult, miniMaxResult, zhipuResult, xiaomiResult] = await Promise.allSettled([
    fetchDeepSeekJobs(existingDeepSeek, today),
    fetchKimiJobs(existingKimi, today),
    fetchMiniMaxJobs(existingMiniMax, today),
    fetchZhipuJobs(existingZhipu, today),
    fetchXiaomiTopicGroups().then(({ hash, groups }) => normalizeXiaomiJobs(groups, hash, existingXiaomi, today)),
  ]);

  if (deepSeekResult.status === 'fulfilled' && deepSeekResult.value.length) {
    upsertCompany(data, 'deepseek', {
      name: 'DeepSeek',
      logo: '🔍',
      logoUrl: COMPANY_LOGO_URLS.deepseek,
      description: '深度求索，中国领先的大模型公司，以低成本高性能闻名',
      color: '#0EA5E9',
      gradient: 'from-[#0EA5E9] to-[#06B6D4]',
      jobs: deepSeekResult.value,
      questionCount: existingDeepSeek?.questionCount || 518,
    });
  } else {
    console.warn(`[deepseek] skipped: ${deepSeekResult.reason?.message || 'no jobs fetched'}`);
  }

  if (kimiResult.status === 'fulfilled' && kimiResult.value.length) {
    upsertCompany(data, 'kimi', {
      name: 'Kimi',
      logo: '🌙',
      logoUrl: COMPANY_LOGO_URLS.kimi,
      description: 'Moonshot AI 旗下 Kimi，大模型产品、算法、工程与应用岗位跟踪',
      color: '#7C3AED',
      gradient: 'from-[#7C3AED] to-[#22D3EE]',
      jobs: kimiResult.value,
      questionCount: 80,
    });
    data.companyQuestions = data.companyQuestions || {};
    data.companyQuestions.kimi = buildCompanyQuestionSet(data, 'kimi');
  } else {
    console.warn(`[kimi] skipped: ${kimiResult.reason?.message || 'no jobs fetched'}`);
  }

  if (miniMaxResult.status === 'fulfilled' && miniMaxResult.value.length) {
    upsertCompany(data, 'minimax', {
      name: 'MiniMax',
      logo: '〽️',
      logoUrl: COMPANY_LOGO_URLS.minimax,
      description: 'MiniMax 通用人工智能、Agent 产品、多模态与全球化业务岗位跟踪',
      color: '#DE1F84',
      gradient: 'from-[#DE1F84] to-[#FD6F32]',
      jobs: miniMaxResult.value,
      questionCount: 80,
    });
    data.companyQuestions = data.companyQuestions || {};
    data.companyQuestions.minimax = buildCompanyQuestionSet(data, 'mm');
  } else {
    console.warn(`[minimax] skipped: ${miniMaxResult.reason?.message || 'no jobs fetched'}`);
  }

  if (zhipuResult.status === 'fulfilled' && zhipuResult.value.length) {
    upsertCompany(data, 'zhipu', {
      name: '智谱 AI',
      logo: 'Z',
      logoUrl: COMPANY_LOGO_URLS.zhipu,
      description: '智谱 AI GLM、Agent、多模态、强化学习与工程研发岗位跟踪',
      color: '#3370FF',
      gradient: 'from-[#3370FF] to-[#06B6D4]',
      jobs: zhipuResult.value,
      questionCount: 80,
    });
    data.companyQuestions = data.companyQuestions || {};
    data.companyQuestions.zhipu = buildCompanyQuestionSet(data, 'zp');
  } else {
    console.warn(`[zhipu] skipped: ${zhipuResult.reason?.message || 'no jobs fetched'}`);
  }

  if (xiaomiResult.status === 'fulfilled' && xiaomiResult.value.length) {
    upsertCompany(data, 'xiaomi', {
      name: '小米',
      logo: '⚡',
      logoUrl: COMPANY_LOGO_URLS.xiaomi,
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

  applyKnownCompanyLogos(data);
  backfillStaticCompanySources(data, today);

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
