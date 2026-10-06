---
layout: default
title: How it works
nav_order: 2
---

# How it works
{: .no_toc }

The parts of an installation, what happens at a launch, and where data is kept
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Architecture

AnsibleForms is one Node.js server that serves the web application and a REST API, backed by a MySQL database.
It reads forms from YAML files, and runs each job either as a local `ansible-playbook` process or as a template
on AWX, AAP or Ascender:

<div class="af-diagram" markdown="0">
<svg viewBox="0 0 760 470" role="img" aria-labelledby="afd-title afd-desc" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;height:auto;color:var(--body-text-color);font-family:inherit">
<title id="afd-title">AnsibleForms architecture</title>
<desc id="afd-desc">The browser and an optional MCP client talk to the AnsibleForms server. The server stores its data in MySQL and in the persistent folder, runs ansible-playbook locally, and connects to AWX, AAP or Ascender, data sources, secret stores, git repositories, login providers, a mail server and an optional model provider.</desc>
<style>
.afd-box{fill:var(--af-accent-soft);stroke:currentColor;stroke-opacity:.45;stroke-width:1.2}
.afd-main{fill:none;stroke:var(--link-color);stroke-width:1.8}
.afd-inner{fill:var(--body-background-color);stroke:currentColor;stroke-opacity:.35;stroke-width:1}
.afd-opt{stroke-dasharray:5 4}
.afd-t{fill:currentColor;font-size:13px;font-weight:600}
.afd-s{fill:var(--af-muted);font-size:11px}
.afd-h{fill:var(--link-color);font-size:14px;font-weight:700}
.afd-line{stroke:currentColor;stroke-opacity:.6;stroke-width:1.3;fill:none}
</style>
<defs>
<marker id="afd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity=".7"/></marker>
</defs>
<rect class="afd-box" x="20" y="70" width="170" height="70" rx="10"/>
<text class="afd-t" x="105" y="99" text-anchor="middle">Browser</text>
<text class="afd-s" x="105" y="118" text-anchor="middle">forms, designer, jobs, chat</text>
<rect class="afd-box afd-opt" x="20" y="200" width="170" height="70" rx="10"/>
<text class="afd-t" x="105" y="229" text-anchor="middle">MCP client</text>
<text class="afd-s" x="105" y="248" text-anchor="middle">optional</text>
<line class="afd-line" x1="190" y1="105" x2="258" y2="105" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<line class="afd-line afd-opt" x1="190" y1="235" x2="258" y2="235" marker-end="url(#afd-arrow)"/>
<rect class="afd-main" x="260" y="30" width="240" height="350" rx="12"/>
<text class="afd-h" x="380" y="56" text-anchor="middle">AnsibleForms server</text>
<text class="afd-s" x="380" y="74" text-anchor="middle">Node.js / Express, one instance</text>
<rect class="afd-inner" x="280" y="88" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="114" text-anchor="middle">Web app and REST API</text>
<rect class="afd-inner" x="280" y="142" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="168" text-anchor="middle">Form engine, expressions</text>
<rect class="afd-inner" x="280" y="196" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="222" text-anchor="middle">Job runner, scheduler</text>
<rect class="afd-inner" x="280" y="250" width="200" height="50" rx="8"/>
<text class="afd-t" x="380" y="271" text-anchor="middle">ansible-playbook</text>
<text class="afd-s" x="380" y="288" text-anchor="middle">runs locally, in the container</text>
<rect class="afd-inner afd-opt" x="280" y="312" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="338" text-anchor="middle">MCP server (optional)</text>
<rect class="afd-box" x="200" y="410" width="170" height="50" rx="10"/>
<text class="afd-t" x="285" y="431" text-anchor="middle">Persistent folder</text>
<text class="afd-s" x="285" y="448" text-anchor="middle">config.yaml, forms, playbooks</text>
<rect class="afd-box" x="390" y="410" width="170" height="50" rx="10"/>
<text class="afd-t" x="475" y="431" text-anchor="middle">MySQL / MariaDB</text>
<text class="afd-s" x="475" y="448" text-anchor="middle">jobs, users, credentials</text>
<line class="afd-line" x1="300" y1="380" x2="300" y2="408" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="460" y1="380" x2="460" y2="408" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<rect class="afd-box" x="570" y="30" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="47" text-anchor="middle">AWX / AAP / Ascender</text>
<text class="afd-s" x="655" y="63" text-anchor="middle">templates, over their API</text>
<rect class="afd-box" x="570" y="80" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="97" text-anchor="middle">Data sources</text>
<text class="afd-s" x="655" y="113" text-anchor="middle">databases, REST APIs, files</text>
<rect class="afd-box" x="570" y="130" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="147" text-anchor="middle">Secret stores</text>
<text class="afd-s" x="655" y="163" text-anchor="middle">HashiCorp Vault, CyberArk</text>
<rect class="afd-box" x="570" y="180" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="197" text-anchor="middle">Git repositories</text>
<text class="afd-s" x="655" y="213" text-anchor="middle">forms, playbooks, config</text>
<rect class="afd-box" x="570" y="230" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="247" text-anchor="middle">Login providers</text>
<text class="afd-s" x="655" y="263" text-anchor="middle">LDAP, Entra ID, OIDC</text>
<rect class="afd-box" x="570" y="280" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="297" text-anchor="middle">Mail server</text>
<text class="afd-s" x="655" y="313" text-anchor="middle">notifications, approvals</text>
<rect class="afd-box afd-opt" x="570" y="330" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="347" text-anchor="middle">Model provider</text>
<text class="afd-s" x="655" y="363" text-anchor="middle">optional, chat assistant</text>
<line class="afd-line" x1="500" y1="51" x2="568" y2="51" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="101" x2="568" y2="101" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="151" x2="568" y2="151" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="201" x2="568" y2="201" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="251" x2="568" y2="251" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="301" x2="568" y2="301" marker-end="url(#afd-arrow)"/>
<line class="afd-line afd-opt" x1="500" y1="351" x2="568" y2="351" marker-end="url(#afd-arrow)"/>
</svg>
</div>

The components in the diagram each have a role of their own:

| Component | Role |
|---|---|
| **Browser** | The Vue web application: the forms, the [Designer](gui/designer-and-git.html), the job history and the settings |
| **AnsibleForms server** | Evaluates the forms, launches and tracks the jobs, runs the schedules and serves the [REST API](api/) |
| **ansible-playbook** | Runs playbooks from the playbooks folder; the container image includes Ansible |
| **MySQL / MariaDB** | Holds the jobs and their output, the users, the credentials and the connections |
| **Persistent folder** | Holds `config.yaml`, the form files, the playbooks, the logs and the backups |
| **AWX / AAP / Ascender** | Runs the job templates and workflow templates of [AWX forms](forms/awx.html) |
| **Data sources** | Fill the fields: [database queries](formfields/enum.html), [REST APIs](expressions/rest-apis.html), files and [other functions](expressions/remote.html) |
| **Secret stores** | Supply the user and password of a credential at use time, see [Secret stores](secret-stores/) |
| **Git repositories** | Keep the forms, the playbooks and `config.yaml` under version control |
| **MCP client, chat** | Optional, both off by default: the [MCP server](mcp/) and the [chat assistant](chat/) |

AnsibleForms runs as a single instance: see the [FAQ](faq.html#deployment-topology-single-instance-only) for the reasons.

### Built with

The server and the web interface are built on these components:

| Part | Technology |
|---|---|
| **Server** | Node.js and Express |
| **Database** | MySQL or MariaDB |
| **Web interface** | Vue 3, with Bootstrap 5 and Font Awesome |

---

## What happens when you launch a form

A launch goes through the same steps whether it comes from the browser or from the [REST API](api/jobs.html):

1. **Load** : the server sends only the forms the user's [roles](config/roles.html) allow, and evaluates server expressions
2. **Submit** : the browser turns the field values into extravars and posts them to `POST /api/v2/job`
3. **Check** : the server reloads the form for the user's roles and, with [launch validation](launch-validation/) on, checks the values
4. **Record** : the job is stored with status `running`, and its id is added to the extravars as `__jobid__`
5. **Credentials** : the form's credentials are read from the database or a [secret store](secret-stores/)
6. **Approve** : a form with an [`approval`](forms/approval.html) point waits until an approver accepts the job
7. **Run** : `ansible-playbook` runs locally, or the AWX/AAP/Ascender template is launched; multistep forms run each step
8. **Follow** : the output is saved as it arrives, and the browser polls the job every two seconds to show it live
9. **End** : the job gets its final status, and a mail goes out when the form's [`notifications`](forms/notifications.html) ask for it

---

## Where things are stored

AnsibleForms keeps its state in two places: the MySQL database and the persistent folder. Back up both.

### In the database
{: .no_toc }

The database, `AnsibleForms`, is created at the first start (unless `ALLOW_SCHEMA_CREATION` is `0`) and holds:

* the jobs, their extravars and their output, the schedules and the stored jobs
* the local users, the groups and the API tokens
* the credentials, encrypted with `ENCRYPTION_SECRET`, and the secret store connections
* the AWX, LDAP, OAuth2, repository, mail and chat assistant settings
* the audit log

### In the persistent folder
{: .no_toc }

It is `/app/dist/persistent` in the image and `server/persistent` from source; each path has its own [variable](customization/paths.html):

| Default path | Variable | Contents |
|---|---|---|
| `config.yaml` | [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) | The categories, the roles and the constants |
| `forms/` | [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) | The form files, `.yaml` or `.yml`, in subfolders if you like |
| `playbooks/` | [`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH) | The playbooks of `ansible` forms, and their working directory |
| `repositories/` | [`REPO_PATH`](customization/paths.html#env_REPO_PATH) | The clones of the git repositories |
| `forms_backups/` | [`FORMS_BACKUP_PATH`](customization/paths.html#env_FORMS_BACKUP_PATH) | The copies the Designer makes before it saves |
| `backups/` | [`BACKUP_PATH`](customization/paths.html#env_BACKUP_PATH) | The database backups |
| `uploads/` | [`UPLOAD_PATH`](customization/paths.html#env_UPLOAD_PATH) | The files uploaded through `file` fields |
| `logs/` | [`LOG_PATH`](customization/logging.html#env_LOG_PATH) | `ansibleforms.log` and `ansibleforms.errors.log` |
| `certificates/` | [`HTTPS_CERT`](customization/server.html#env_HTTPS_CERT), [`HTTPS_KEY`](customization/server.html#env_HTTPS_KEY) | The certificate and key, when `HTTPS` is `1` |
| `.env` | | The environment variables saved from the settings pages (unless `ALLOW_ENV_EDIT` is `0`) |

The generated SSH key lives in [`HOME_PATH`](customization/paths.html#env_HOME_PATH), outside the persistent folder by default.
