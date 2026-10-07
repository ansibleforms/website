// Fills a fresh AnsibleForms instance with the example data of the screenshots, through its
// API : a job history (successes, a failure, multistep runs and an aborted one), credentials,
// LDAP settings, a git repository, schedules and backups. The forms, the categories and the
// playbooks come from ./data, which run.sh mounts as the instance's persistent folder.
//
// Usage : node seed.mjs https://127.0.0.1:8444

const BASE = process.argv[2] || 'https://127.0.0.1:8444';
const ADMIN = { user: 'admin', password: 'AnsibleForms!123' };
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // the instance's self-signed certificate

// ------------------------------------------------------------------------------------
// api helpers
// ------------------------------------------------------------------------------------
let token = '';

/**
 * Calls the API as the admin.
 *
 * Args:
 *   method (string): the http method.
 *   path (string): the path under /api/v2.
 *   body (object): the json body, if any.
 *
 * Returns:
 *   Promise<object>: the parsed answer.
 *
 * Raises:
 *   Error: when the answer is not a success.
 */
async function api(method, path, body) {
  const res = await fetch(`${BASE}/api/v2${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} : ${res.status} ${text}`);
  return text ? JSON.parse(text) : {};
}

/**
 * Signs in as the admin and keeps the token for the next calls.
 */
async function login() {
  const auth = Buffer.from(`${ADMIN.user}:${ADMIN.password}`).toString('base64');
  const res = await fetch(`${BASE}/api/v2/auth/login`, { method: 'POST', headers: { Authorization: `Basic ${auth}` } });
  if (!res.ok) throw new Error(`login : ${res.status}`);
  token = (await res.json()).token;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Waits until a job has ended.
 *
 * Args:
 *   id (number): the job id.
 *
 * Returns:
 *   Promise<string>: its final status.
 */
async function waitFor(id) {
  for (let i = 0; i < 240; i++) {
    const job = await api('GET', `/job/${id}`);
    if (['success', 'failed', 'aborted', 'warning', 'rejected', 'abandoned'].includes(job.status)) return job.status;
    await sleep(500);
  }
  throw new Error(`job ${id} did not end`);
}

/**
 * Runs a form and waits for its job.
 *
 * Args:
 *   formName (string): the form.
 *   extravars (object): the field values.
 *
 * Returns:
 *   Promise<number>: the job id.
 */
async function run(formName, extravars = {}) {
  const job = await api('POST', '/job', { formName, extravars });
  const status = await waitFor(job.id);
  console.log(`  job ${job.id} ${formName} : ${status}`);
  return job.id;
}

// ------------------------------------------------------------------------------------
// the data
// ------------------------------------------------------------------------------------
const NEW_VM = {
  hostname: 'web-prd-014',
  env: 'production',
  datacenter: 'Brussels DC1',
  os: 'Rocky Linux 9',
  cpu: 4,
  memory_gb: 16,
  disks: [
    { mount: '/var/www', size_gb: 100, tier: 'SSD' },
    { mount: '/var/log', size_gb: 50, tier: 'Standard' },
  ],
  owner: 'web-team@example.com',
  ready_by: '2026-10-12T09:00:00',
  backup: true,
};
const CHANGE = { target: 'srv-prd-001', reason: 'Planned change' };

await login();
console.log('signed in to', BASE);

console.log('jobs');
await run('Ansible-Galaxy Install', CHANGE);
await run('Create a snapshot', CHANGE);
await run('Database Storage resize', CHANGE);
await run('Patch Windows Servers', { target: 'app-prd-0*', reboot: true });
await run('Service Health Check', CHANGE);
await run('Web Server Deployment', { hostname: 'web-prd-015', pool: 'web-prd' });
await run('Rotate Passwords', CHANGE);
await run('Database Storage Setup', CHANGE);
await run('Verify Backups', CHANGE);
await run('File Share resize', CHANGE);
await run('Archive Folders', CHANGE);
await run('New Virtual Machine', NEW_VM);
// a deployment stopped in its first (slow) step : an aborted multistep job
{
  const job = await api('POST', '/job', { formName: 'Web Server Deployment', extravars: { hostname: 'web-prd-016', pool: 'web-prd' } });
  await sleep(2500);
  await api('POST', `/job/${job.id}/abort/`);
  console.log(`  job ${job.id} Web Server Deployment : ${await waitFor(job.id)}`);
}
await run('Patch Windows Servers', { target: 'app-prd-02', reboot: false });
await run('Database Storage Setup', CHANGE);
await run('Cleanup Job History', CHANGE);
await run('Web Server Deployment', { hostname: 'web-prd-017', pool: 'web-prd' });

console.log('credentials');
const credentials = [
  { name: 'cmdb-database', user: 'svc_forms', password: 'Example!123', host: 'cmdb.example.com', port: 3306, is_database: true, db_type: 'mysql', db_name: 'cmdb', description: 'Read-only account for the CMDB queries' },
  { name: 'vcenter', user: 'svc-ansibleforms@vsphere.local', password: 'Example!123', host: 'vcenter.example.com', port: 443, description: 'vCenter service account for the provisioning forms' },
  { name: 'netapp-cluster', user: 'ansible', password: 'Example!123', host: 'cluster1.example.com', port: 443, description: 'ONTAP cluster admin for the storage forms' },
  { name: 'reporting-db', user: 'report', password: 'Example!123', host: 'reporting.example.com', port: 5432, is_database: true, db_type: 'postgres', db_name: 'reports', description: 'Reporting database (PostgreSQL)' },
  { name: 'windows-winrm', user: 'EXAMPLE\\svc-patching', password: 'Example!123', host: 'wsus.example.com', port: 5986, description: 'WinRM account for the Windows patching' },
];
for (const c of credentials) await api('POST', '/credential', c);

console.log('ldap');
await api('PUT', '/ldap', {
  server: 'ldap.example.com',
  port: 636,
  enable_tls: true,
  ignore_certs: false,
  enable: false,
  bind_user_dn: 'CN=svc-ansibleforms,OU=Service Accounts,DC=example,DC=com',
  bind_user_pw: 'Example!123',
  search_base: 'OU=Users,DC=example,DC=com',
  username_attribute: 'sAMAccountName',
  groups_attribute: 'memberOf',
  mail_attribute: 'mail',
  groups_search_base: 'OU=Groups,DC=example,DC=com',
  group_class: 'group',
  group_member_attribute: 'member',
  group_member_user_attribute: 'distinguishedName',
  cert: '',
  ca_bundle: '',
});

console.log('repository');
await api('POST', '/repository', {
  name: 'ansibleforms-docker',
  uri: 'https://github.com/ansibleforms/docker.git',
  branch: 'main',
  description: 'Docker Compose setup, pulled every hour',
  cron: '0 * * * *',
  use_for_config: false,
  use_for_forms: false,
  use_for_playbooks: false,
  use_for_vars_files: false,
  rebase_on_start: false,
});
// creating it clones it : wait for the clone, so the list shows its head and status
for (let i = 0; i < 60; i++) {
  const repos = (await api('GET', '/repository')).records || [];
  const repo = repos.find((r) => r.name === 'ansibleforms-docker');
  if (repo?.status && repo.status !== 'running') {
    console.log(`  cloned : ${repo.status} ${repo.head || ''}`);
    break;
  }
  await sleep(1000);
}

console.log('schedules');
const schedules = [
  { name: 'Nightly log rotation', cron: '0 2 * * *', form: 'Nightly Workflow', extra_vars: '' },
  { name: 'Weekly backup verification', cron: '30 6 * * 1', form: 'Verify Backups', extra_vars: 'target: srv-prd-001\n' },
  { name: 'Monthly Linux patching', cron: '0 22 * * 6#2', form: 'Patch Linux Servers', extra_vars: 'target: lnx-prd-*\n' },
  { name: 'Service health report', cron: '*/30 * * * *', form: 'Service Health Check', extra_vars: 'target: shop-prd\n' },
  { name: 'Decommission web-tst-007', one_time_run: true, run_at: '2026-12-15 18:00:00', form: 'Remove Virtual Machine', extra_vars: 'target: web-tst-007\n' },
];
for (const s of schedules) await api('POST', '/schedule', s);

console.log('backups');
await api('POST', '/backup', { description: 'Before the October patch window' });
await sleep(1500); // backup folders are named by the second
await api('POST', '/backup', { description: 'Manual backup after the role changes' });

console.log('done');
