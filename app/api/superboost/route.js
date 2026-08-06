import Anthropic from '@anthropic-ai/sdk';
import puppeteer from 'puppeteer-core';
import fs from 'fs';

export const runtime = 'nodejs';
export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Pilot: only BetCity for now — public Superboost block on the sportsbook home,
// no login required. Add more bookmakers here once this proves reliable.
const TARGETS = [
  { naam: 'BetCity', url: 'https://www.betcity.nl/sportsbook#home' },
];

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

async function getBrowser() {
  if (process.env.VERCEL) {
    const chromium = (await import('@sparticuz/chromium')).default;
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  }
  // Local dev: use the system Chrome install
  const localPaths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ];
  const executablePath = localPaths.find(p => fs.existsSync(p));
  if (!executablePath) {
    throw new Error('Geen Chrome gevonden voor lokaal testen. Installeer Google Chrome of test op een Vercel-deploy.');
  }
  return puppeteer.launch({ executablePath, headless: true });
}

async function checkBookmaker(browser, { naam, url }) {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1440, height: 1600 });
    await page.setUserAgent(UA);

    let response;
    try {
      response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
    } catch (navErr) {
      return { bookmaker: naam, status: 'error', message: `Kon de pagina niet laden: ${navErr.message}` };
    }

    if (response && response.status() >= 400) {
      return { bookmaker: naam, status: 'blocked', httpStatus: response.status(), message: `Site gaf HTTP ${response.status()} terug — waarschijnlijk bot-detectie.` };
    }

    // Let client-rendered widgets (Superboost block etc.) finish loading
    await new Promise(r => setTimeout(r, 3000));

    const screenshot = await page.screenshot({ type: 'jpeg', quality: 80 });
    const base64 = Buffer.from(screenshot).toString('base64');

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
          {
            type: 'text',
            text: `Dit is een screenshot van de homepage van de sportsbook-sectie van bookmaker "${naam}". Is er een "Superboost" (of vergelijkbaar: boosted odds / odds boost) promoblok zichtbaar op deze pagina?

Geef ALLEEN JSON terug, zonder uitleg of markdown, in dit exacte formaat:
{"found": boolean, "bets": [{"wedstrijd": string, "selectie": string, "boosted_odds": string|null}]}

Als er geen superboost zichtbaar is, geef found:false en een lege bets array.`,
          },
        ],
      }],
    });

    const text = message.content[0].text.trim();
    const jsonText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return { bookmaker: naam, status: 'error', message: 'AI-response kon niet verwerkt worden.' };
    }

    return {
      bookmaker: naam,
      status: 'ok',
      found: !!parsed.found,
      bets: Array.isArray(parsed.bets) ? parsed.bets : [],
      screenshot: `data:image/jpeg;base64,${base64}`,
    };
  } finally {
    await page.close();
  }
}

export async function GET() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'ANTHROPIC_API_KEY niet geconfigureerd.' }, { status: 500 });
  }

  let browser;
  try {
    browser = await getBrowser();
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }

  try {
    const results = [];
    for (const target of TARGETS) {
      results.push(await checkBookmaker(browser, target));
    }
    return Response.json({ results });
  } catch (e) {
    console.error('[superboost]', e);
    return Response.json({ error: e.message || 'Onverwachte fout.' }, { status: 500 });
  } finally {
    await browser.close();
  }
}
