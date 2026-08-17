import { renderResumeHtml } from '../templates/resume.html.js';
import { renderSimpleResumeHtml } from '../templates/resume-simple.html.js';

export function renderResumeByTemplate(
  resume,
  profile,
  template = 'color',
  options = {}
) {
  if (template === 'simple') {
    return renderSimpleResumeHtml(resume, profile, options);
  }
  return renderResumeHtml(resume, profile, options);
}

/**
 * Launch Chromium for PDF.
 * Local: full `puppeteer` (downloads Chrome).
 * Render / cloud: `@sparticuz/chromium` + `puppeteer-core`.
 */
async function launchBrowser() {
  const commonArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--font-render-hinting=none',
  ];

  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    const puppeteer = (await import('puppeteer-core')).default;
    return puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      headless: true,
      args: commonArgs,
    });
  }

  // Render sets RENDER=true. Also honor an explicit flag.
  const useSparticuz =
    process.env.USE_SPARTICUZ_CHROMIUM === '1' ||
    process.env.RENDER === 'true' ||
    Boolean(process.env.RENDER);

  if (useSparticuz) {
    const puppeteer = (await import('puppeteer-core')).default;
    const chromium = (await import('@sparticuz/chromium')).default;
    chromium.setGraphicsMode = false;

    return puppeteer.launch({
      args: [...chromium.args, ...commonArgs],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  }

  const puppeteer = (await import('puppeteer')).default;
  return puppeteer.launch({
    headless: true,
    args: commonArgs,
  });
}

// Concurrency queue to protect memory (starter cloud tiers have 512MB RAM)
const MAX_CONCURRENT_PDF_JOBS = Number(process.env.MAX_PDF_CONCURRENCY) || 2;
let activePdfJobs = 0;
const pdfQueue = [];

function acquirePdfSlot() {
  if (activePdfJobs < MAX_CONCURRENT_PDF_JOBS) {
    activePdfJobs++;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    pdfQueue.push(resolve);
  });
}

function releasePdfSlot() {
  activePdfJobs--;
  if (pdfQueue.length > 0) {
    activePdfJobs++;
    const next = pdfQueue.shift();
    next();
  }
}

export async function generateResumePdf(
  resume,
  profile,
  template = 'color',
  options = {}
) {
  await acquirePdfSlot();
  try {
    return await executePdfRender(resume, profile, template, options);
  } finally {
    releasePdfSlot();
  }
}

async function executePdfRender(
  resume,
  profile,
  template = 'color',
  options = {}
) {
  const html = renderResumeByTemplate(resume, profile, template, options);

  let browser;
  try {
    browser = await launchBrowser();
  } catch (err) {
    const tip =
      'PDF engine failed to start Chromium. On Render this needs @sparticuz/chromium; locally run npm install in backend.';
    const message = err?.message || String(err);
    throw new Error(`${tip} (${message})`);
  }

  try {
    const page = await browser.newPage();
    // HTML is fully inline — avoid networkidle timeouts in cloud
    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    const overflow = await page.evaluate(() => {
      const el = document.querySelector('.page');
      return el ? el.scrollHeight > el.clientHeight + 2 : false;
    });

    if (overflow) {
      const shrink =
        template === 'simple'
          ? 'html, body { font-size: 9.5px !important; } .name { font-size: 18px !important; }'
          : 'html, body { font-size: 8.5px !important; } .name { font-size: 16px !important; }';
      await page.addStyleTag({ content: shrink });
    }

    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return pdf;
  } finally {
    if (browser) await browser.close();
  }
}

export { renderResumeHtml, renderSimpleResumeHtml };
