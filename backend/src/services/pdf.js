import puppeteer from 'puppeteer';
import { renderResumeHtml } from '../templates/resume.html.js';
import { renderSimpleResumeHtml } from '../templates/resume-simple.html.js';

export function renderResumeByTemplate(resume, profile, template = 'color') {
  if (template === 'simple') {
    return renderSimpleResumeHtml(resume, profile);
  }
  return renderResumeHtml(resume, profile);
}

export async function generateResumePdf(resume, profile, template = 'color') {
  const html = renderResumeByTemplate(resume, profile, template);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

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
    await browser.close();
  }
}

export { renderResumeHtml, renderSimpleResumeHtml };
