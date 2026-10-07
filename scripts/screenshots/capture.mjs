// Takes the GUI screenshots of the website from an instance seeded with seed.mjs, at
// 1900x940, into source/assets/screenshots/.
//
// Usage : node capture.mjs https://127.0.0.1:8444 [name ...]
//   with names, only those screenshots are taken (e.g. dashboard designer)

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const BASE = process.argv[2] || 'https://127.0.0.1:8444';
const ONLY = process.argv.slice(3);
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../source/assets/screenshots');
const ADMIN = { user: 'admin', password: 'AnsibleForms!123' };
const VIEWPORT = { width: 1900, height: 940 };
const QUALITY = 85;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // the instance's self-signed certificate

// ------------------------------------------------------------------------------------
// api helpers : the token for the browser, and the ids of the jobs to show
// ------------------------------------------------------------------------------------
const auth = Buffer.from(`${ADMIN.user}:${ADMIN.password}`).toString('base64');
const { token, refreshtoken } = await (
  await fetch(`${BASE}/api/v2/auth/login`, { method: 'POST', headers: { Authorization: `Basic ${auth}` } })
).json();

/**
 * Calls the API as the admin.
 *
 * Args:
 *   method (string): the http method.
 *   p (string): the path under /api/v2.
 *
 * Returns:
 *   Promise<object>: the parsed answer.
 */
async function api(method, p) {
  const res = await fetch(`${BASE}/api/v2${p}`, { method, headers: { Authorization: `Bearer ${token}` } });
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

const jobs = (await api('GET', '/job')).records || [];
/** The newest job of a form with a given status and type (a multistep job's steps share its form). */
const lastJob = (form, status, type) =>
  jobs
    .filter((j) => j.form === form && (!status || j.status === status) && (!type || j.job_type === type))
    .sort((a, b) => b.id - a.id)[0]?.id;

// ------------------------------------------------------------------------------------
// browser
// ------------------------------------------------------------------------------------
const browser = await chromium.launch();

/**
 * Opens a signed-in page (or a signed-out one) in a theme.
 *
 * Args:
 *   options (object): { theme: 'light' | 'dark', signedIn: boolean }.
 *
 * Returns:
 *   Promise<object>: the page and its context.
 */
async function open({ theme = 'light', signedIn = true } = {}) {
  const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: VIEWPORT });
  await context.addInitScript(
    ([t, rt, th, signed]) => {
      if (signed) {
        localStorage.setItem('token', t);
        localStorage.setItem('refreshtoken', rt);
      }
      localStorage.setItem('theme', th);
      localStorage.setItem('themeChosen', '1');
      document.cookie = 'af_language=en;path=/';
    },
    [token, refreshtoken, theme, signedIn],
  );
  const page = await context.newPage();
  page.on('pageerror', (e) => console.log('  page error :', e.message));
  return { page, context };
}

/**
 * Saves the page as a screenshot.
 *
 * Args:
 *   page (object): the page.
 *   name (string): the file name, without .jpg.
 */
async function save(page, name) {
  await page.mouse.move(0, VIEWPORT.height - 1); // no hover effect left on what was clicked
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, `${name}.jpg`), type: 'jpeg', quality: QUALITY });
  console.log('  saved', name);
}

/**
 * Visits a path and waits for the page to settle : its requests done, then a moment more.
 * A page that polls (schedules, logs) never goes quiet, so that wait gives up after 5s.
 */
async function visit(page, p, wait = 2500) {
  await page.goto(BASE + p);
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(wait);
}

// ------------------------------------------------------------------------------------
// the screenshots : name -> what to do before saving it
// ------------------------------------------------------------------------------------
const SHOTS = {
  async dashboard() {
    const { page, context } = await open();
    await visit(page, '/');
    await save(page, 'dashboard');
    await context.close();
  },
  async darkmode() {
    const { page, context } = await open({ theme: 'dark' });
    await visit(page, '/');
    await save(page, 'darkmode');
    await context.close();
  },
  async login() {
    const { page, context } = await open({ signedIn: false });
    await visit(page, '/login', 3000);
    await save(page, 'login');
    await context.close();
  },
  async form() {
    const { page, context } = await open();
    await visit(page, '/form?form=' + encodeURIComponent('New Virtual Machine'));
    await save(page, 'form');
    await context.close();
  },
  async 'form-json'() {
    const { page, context } = await open();
    await visit(page, '/form?form=' + encodeURIComponent('New Virtual Machine'));
    await page.getByRole('button', { name: 'Show Extravars' }).click();
    await page.waitForTimeout(800);
    await save(page, 'form-json');
    await context.close();
  },
  async 'job-log'() {
    const { page, context } = await open();
    await visit(page, '/jobs');
    await save(page, 'job-log');
    await context.close();
  },
  async 'job-output'() {
    const { page, context } = await open();
    await visit(page, `/jobs/${lastJob('New Virtual Machine', 'success', 'ansible')}`, 3500);
    await save(page, 'job-output');
    await context.close();
  },
  async multistep() {
    const { page, context } = await open();
    await visit(page, `/jobs/${lastJob('Web Server Deployment', 'success', 'multistep')}`, 3500);
    await save(page, 'multistep');
    await context.close();
  },
  async schedules() {
    const { page, context } = await open();
    await visit(page, '/jobs/schedules');
    await save(page, 'schedules');
    await context.close();
  },
  async designer() {
    const { page, context } = await open();
    await visit(page, '/designer', 3000);
    await page.getByRole('button', { name: 'Start Designer' }).click();
    await page.waitForTimeout(3000);
    await page.locator('.af-sidebar').getByText('Forms', { exact: true }).click();
    await page.waitForTimeout(1500);
    await page.getByText('provisioning.yaml', { exact: true }).click();
    await page.waitForTimeout(800);
    await page.getByText('New Virtual Machine', { exact: true }).click();
    await page.waitForTimeout(1500);
    await save(page, 'designer');
    await api('DELETE', '/lock');
    await context.close();
  },
  async git() {
    const { page, context } = await open();
    await visit(page, '/admin/repositories');
    await save(page, 'git');
    await context.close();
  },
  async 'git-edit'() {
    const { page, context } = await open();
    await visit(page, '/admin/repositories');
    await page.getByText('ansibleforms-docker', { exact: true }).first().click();
    await page.waitForTimeout(1500);
    await save(page, 'git-edit');
    await context.close();
  },
  async credentials() {
    const { page, context } = await open();
    await visit(page, '/admin/credentials');
    await page.getByText('cmdb-database', { exact: true }).first().click();
    await page.waitForTimeout(1500);
    await save(page, 'credentials');
    await context.close();
  },
  async backups() {
    const { page, context } = await open();
    await visit(page, '/admin/backups');
    await save(page, 'backups');
    await context.close();
  },
  async restore() {
    const { page, context } = await open();
    await visit(page, '/admin/backups');
    // the row's menu (⋮), then Restore
    const row = page.locator('tr', { hasText: 'Manual backup after the role changes' });
    await row.locator('.bs-dt-row-menu').click();
    await page.locator('.dropdown-menu.show .dropdown-item', { hasText: 'Restore' }).click();
    await page.waitForTimeout(1500);
    await save(page, 'restore');
    await context.close();
  },
  async ldap() {
    const { page, context } = await open();
    await visit(page, '/admin/ldap');
    await save(page, 'ldap');
    await context.close();
  },
  async logs() {
    const { page, context } = await open();
    await visit(page, '/logs', 3500);
    await save(page, 'logs');
    await context.close();
  },
  async profile() {
    const { page, context } = await open();
    await visit(page, '/profile');
    await save(page, 'profile');
    await context.close();
  },
  async settings() {
    const { page, context } = await open();
    await visit(page, '/admin/settings');
    await save(page, 'settings');
    await context.close();
  },
  async swagger() {
    const { page, context } = await open();
    // the Swagger UI itself ; /api-docs is the page that links to it
    await visit(page, '/api/v2/docs/', 4000);
    await save(page, 'swagger');
    await context.close();
  },
  // last : running the form adds a job to the history the job screenshots show
  async run() {
    const { page, context } = await open();
    await visit(page, '/form?form=' + encodeURIComponent('Database Storage Setup'));
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await page.waitForTimeout(6000);
    await save(page, 'run');
    await context.close();
  },
};

for (const [name, take] of Object.entries(SHOTS)) {
  if (ONLY.length && !ONLY.includes(name)) continue;
  try {
    await take();
  } catch (e) {
    console.log(`  FAILED ${name} :`, e.message.split('\n')[0]);
  }
}
await browser.close();
