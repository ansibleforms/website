---
layout: default
title: Com funciona
nav_order: 2
translated_from: e802a9168b87771c9d1a2d2d9af9368646b4f39f
---

# Com funciona
{: .no_toc }

Les parts d'una instal·lació, què passa en un llançament i on es desen les dades
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Arquitectura

AnsibleForms és un servidor Node.js que serveix l'aplicació web i una API REST, amb una base de dades MySQL al darrere. Llegeix els formularis
de fitxers YAML i no executa res per si mateix: lliura cada tasca a un [runner](runners.html). Un playbook va a un dels teus contenidors RTE
(runtime environment, entorn d'execució), que executa `ansible-playbook`, i una plantilla o un job va a AWX, AAP, Ascender, Semaphore, Rundeck o Jenkins:

<div class="af-diagram" markdown="0">
<svg viewBox="0 0 760 500" role="img" aria-labelledby="afd-title afd-desc" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;height:auto;color:var(--body-text-color);font-family:inherit">
<title id="afd-title">Arquitectura d'AnsibleForms</title>
<desc id="afd-desc">El navegador i un client MCP opcional es comuniquen amb el servidor d'AnsibleForms. El servidor desa les seves dades a MySQL i a la carpeta persistent, i es connecta a fonts de dades, magatzems de secrets, repositoris git, proveïdors d'inici de sessió, canals de notificació, servidors syslog i un proveïdor de models opcional. Els seus runners lliuren cada playbook a un d'un o diversos contenidors RTE, cadascun a través d'un WebSocket, que executen ansible-playbook i retornen la sortida al servidor, i cada plantilla o job a AWX, AAP, Ascender, Semaphore, Rundeck o Jenkins.</desc>
<style>
.afd-box{fill:var(--af-accent-soft);stroke:currentColor;stroke-opacity:.45;stroke-width:1.2}
.afd-main{fill:none;stroke:var(--link-color);stroke-width:1.8}
.afd-solid{fill:var(--body-background-color)}
.afd-back{stroke-opacity:.45}
.afd-inner{fill:var(--body-background-color);stroke:currentColor;stroke-opacity:.35;stroke-width:1}
.afd-run{fill:var(--af-accent-soft);stroke:var(--link-color);stroke-width:1.4}
.afd-opt{stroke-dasharray:5 4}
.afd-t{fill:currentColor;font-size:13px;font-weight:600}
.afd-s{fill:var(--af-muted);font-size:11px}
.afd-h{fill:var(--link-color);font-size:14px;font-weight:700}
.afd-line{stroke:currentColor;stroke-opacity:.6;stroke-width:1.3;fill:none}
.afd-go{stroke:var(--link-color);stroke-opacity:.85;stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="afd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity=".7"/></marker>
</defs>
<rect class="afd-box" x="20" y="70" width="170" height="70" rx="10"/>
<text class="afd-t" x="105" y="94" text-anchor="middle">Navegador</text>
<text class="afd-s" x="105" y="112" text-anchor="middle">formularis, dissenyador,</text>
<text class="afd-s" x="105" y="127" text-anchor="middle">tasques, xat</text>
<rect class="afd-box afd-opt" x="20" y="200" width="170" height="70" rx="10"/>
<text class="afd-t" x="105" y="229" text-anchor="middle">Client MCP</text>
<text class="afd-s" x="105" y="248" text-anchor="middle">opcional</text>
<line class="afd-line" x1="190" y1="105" x2="258" y2="105" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<line class="afd-line afd-opt" x1="190" y1="235" x2="258" y2="235" marker-end="url(#afd-arrow)"/>
<rect class="afd-main" x="260" y="30" width="240" height="345" rx="12"/>
<text class="afd-h" x="380" y="56" text-anchor="middle">Servidor d'AnsibleForms</text>
<text class="afd-s" x="380" y="74" text-anchor="middle">Node.js / Express</text>
<rect class="afd-inner" x="280" y="88" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="114" text-anchor="middle">Aplicació web i API REST</text>
<rect class="afd-inner" x="280" y="142" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="168" text-anchor="middle">Formularis, expressions</text>
<rect class="afd-inner" x="280" y="196" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="222" text-anchor="middle">Workflows, programacions</text>
<rect class="afd-inner afd-opt" x="280" y="250" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="276" text-anchor="middle">Servidor MCP (opcional)</text>
<rect class="afd-run" x="280" y="304" width="200" height="50" rx="8"/>
<text class="afd-t" x="380" y="325" text-anchor="middle">Runners</text>
<text class="afd-s" x="380" y="342" text-anchor="middle">lliuren cada tasca al seu runner</text>
<rect class="afd-box" x="570" y="30" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="47" text-anchor="middle">Fonts de dades</text>
<text class="afd-s" x="655" y="63" text-anchor="middle">bases de dades, API, fitxers</text>
<rect class="afd-box" x="570" y="80" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="97" text-anchor="middle">Magatzems de secrets</text>
<text class="afd-s" x="655" y="113" text-anchor="middle">HashiCorp Vault, CyberArk</text>
<rect class="afd-box" x="570" y="130" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="147" text-anchor="middle">Repositoris git</text>
<text class="afd-s" x="655" y="163" text-anchor="middle">formularis, playbooks, config</text>
<rect class="afd-box" x="570" y="180" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="197" text-anchor="middle">Inici de sessió</text>
<text class="afd-s" x="655" y="213" text-anchor="middle">LDAP, Entra ID, OIDC</text>
<rect class="afd-box" x="570" y="230" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="247" text-anchor="middle">Notificacions</text>
<text class="afd-s" x="655" y="263" text-anchor="middle">correu, Slack, Teams, webhooks</text>
<rect class="afd-box" x="570" y="280" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="297" text-anchor="middle">Servidors syslog</text>
<text class="afd-s" x="655" y="313" text-anchor="middle">el registre, l'auditoria</text>
<rect class="afd-box afd-opt" x="570" y="330" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="347" text-anchor="middle">Proveïdor de models</text>
<text class="afd-s" x="655" y="363" text-anchor="middle">opcional, assistent de xat</text>
<line class="afd-line" x1="500" y1="51" x2="568" y2="51" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="101" x2="568" y2="101" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="151" x2="568" y2="151" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="201" x2="568" y2="201" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="251" x2="568" y2="251" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="301" x2="568" y2="301" marker-end="url(#afd-arrow)"/>
<line class="afd-line afd-opt" x1="500" y1="351" x2="568" y2="351" marker-end="url(#afd-arrow)"/>
<rect class="afd-box" x="20" y="420" width="170" height="60" rx="10"/>
<text class="afd-t" x="105" y="445" text-anchor="middle">Carpeta persistent</text>
<text class="afd-s" x="105" y="463" text-anchor="middle">config, formularis, playbooks</text>
<rect class="afd-box" x="210" y="420" width="150" height="60" rx="10"/>
<text class="afd-t" x="285" y="441" text-anchor="middle">MySQL / MariaDB</text>
<text class="afd-s" x="285" y="458" text-anchor="middle">tasques, usuaris,</text>
<text class="afd-s" x="285" y="472" text-anchor="middle">credencials</text>
<polyline class="afd-line" points="260,355 105,355 105,418" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="285" y1="377" x2="285" y2="418" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<rect class="afd-main afd-solid afd-back" x="412" y="408" width="150" height="60" rx="10"/>
<rect class="afd-main afd-solid afd-back" x="406" y="414" width="150" height="60" rx="10"/>
<rect class="afd-main afd-solid" x="400" y="420" width="150" height="60" rx="10"/>
<text class="afd-t" x="475" y="445" text-anchor="middle">Contenidors RTE</text>
<text class="afd-s" x="475" y="463" text-anchor="middle">executen ansible-playbook</text>
<rect class="afd-box" x="570" y="420" width="182" height="60" rx="10"/>
<text class="afd-t" x="661" y="445" text-anchor="middle">AWX / AAP / Ascender</text>
<text class="afd-s" x="661" y="463" text-anchor="middle">Semaphore, Rundeck, Jenkins</text>
<line class="afd-go" x1="420" y1="354" x2="420" y2="405" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<polyline class="afd-go" points="470,354 470,394 661,394 661,418" marker-end="url(#afd-arrow)"/>
<text class="afd-s" x="413" y="387" text-anchor="end">playbooks,</text>
<text class="afd-s" x="413" y="400" text-anchor="end">WebSocket</text>
<text class="afd-s" x="566" y="388" text-anchor="middle">plantilles, jobs</text>
</svg>
</div>

Cada component del diagrama té el seu propi paper:

| Component | Paper |
|---|---|
| **Navegador** | L'aplicació web Vue: els formularis, el [Dissenyador](gui/designer-and-git.html), l'historial de tasques i la configuració |
| **Servidor d'AnsibleForms** | Avalua els formularis, registra les tasques, executa els workflows i les programacions, lliura cada tasca al seu runner i en fa el seguiment, i serveix l'[API REST](api/) |
| **Runners** | On s'executen les tasques, afegits a **Connexions > Runners**: un formulari n'anomena un amb `runner: <name>`, o fa servir el runner predeterminat del seu tipus (consulta [Runners](runners.html)) |
| **Contenidors RTE** | Un o diversos contenidors d'entorn d'execució, el mateix servidor iniciat amb `AF_ROLE=rte`: cadascun executa `ansible-playbook` per als [formularis d'Ansible](forms/ansible.html), amb les biblioteques de python i les col·leccions de la seva imatge, i envia la sortida i l'estat final al servidor a través d'un WebSocket, sense credencials de la base de dades (consulta [Com s'executa l'RTE](rte/#how-the-rte-runs)) |
| **AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins** | Runners per a plantilles i jobs: els [formularis d'AWX](forms/awx.html) llancen una plantilla de job o de workflow, els formularis de [Semaphore](forms/semaphore.html), [Rundeck](forms/rundeck.html) i [Jenkins](forms/jenkins.html) llancen un dels seus jobs, i el servidor en segueix la sortida |
| **MySQL / MariaDB** | Conté les tasques i la seva sortida, els usuaris, les credencials i les connexions; només el servidor hi llegeix i hi escriu |
| **Carpeta persistent** | Conté `config.yaml`, els fitxers de formularis, els playbooks, els registres i les còpies de seguretat |
| **Fonts de dades** | Emplenen els camps: [consultes a bases de dades](formfields/enum.html), [API REST](expressions/rest-apis.html), fitxers i [altres funcions](expressions/remote.html) |
| **Magatzems de secrets** | Proporcionen l'usuari i la contrasenya d'una credencial en el moment d'usar-la, consulta [Magatzems de secrets](secret-stores/) |
| **Repositoris git** | Mantenen els formularis, els playbooks i `config.yaml` sota control de versions |
| **Proveïdors d'inici de sessió** | Inicien la sessió dels usuaris: [LDAP, Entra ID i OIDC](authentication/), a més dels usuaris locals |
| **Canals de notificació** | Porten les [notificacions](forms/notifications.html) i les sol·licituds d'aprovació: [correu, Slack, Microsoft Teams, Telegram o un webhook](notification-channels.html) |
| **Servidors syslog** | Reben el registre i la traça d'auditoria a mesura que s'escriuen, consulta [Syslog](production/logs.html#syslog) |
| **Client MCP, xat** | Opcionals, tots dos desactivats per defecte: el [servidor MCP](mcp/) i l'[assistent de xat](chat/), que necessita un proveïdor de models |

Per defecte, un contenidor executa alhora el servidor, l'aplicació web i la feina en segon pla, al costat d'un RTE. Per a diversos nodes d'aplicació darrere d'un
balancejador de càrrega, un worker que executa la feina en segon pla i més RTE, consulta [Escalat](production/scaling.html).

### Construït amb

El servidor i la interfície web es basen en aquests components:

| Part | Tecnologia |
|---|---|
| **Servidor** | Node.js i Express |
| **Base de dades** | MySQL o MariaDB |
| **Interfície web** | Vue 3, amb Bootstrap 5 i Font Awesome |

---

## Què passa quan llances un formulari

Un llançament passa pels mateixos passos tant si ve del navegador com de l'[API REST](api/jobs.html):

1. **Càrrega** : el servidor envia només els formularis que permeten els [rols](config/roles.html) de l'usuari, i avalua les expressions del servidor
2. **Enviament** : el navegador converteix els valors dels camps en extravars i els envia amb `POST /api/v2/job`
3. **Comprovació** : el servidor torna a carregar el formulari per als rols de l'usuari i, amb la [validació del llançament](launch-validation/) activada, comprova els valors
4. **Registre** : la tasca es desa amb l'estat `running`, i el seu id s'afegeix a les extravars com a `__jobid__`
5. **Aprovació** : un formulari amb un punt d'[`approval`](forms/approval.html) espera fins que un aprovador accepta la tasca
6. **Credencials** : per a un playbook, l'aplicació (mai l'RTE) llegeix les credencials del formulari de la base de dades o d'un [magatzem de secrets](secret-stores/)
7. **Execució** : la tasca va al seu runner, el que el formulari anomena amb `runner:` o el predeterminat del seu tipus. Per a un playbook, l'aplicació envia la tasca al seu
   RTE pel WebSocket de l'RTE, amb les credencials segellades per a ell, i l'RTE executa `ansible-playbook` (consulta [Com s'executa l'RTE](rte/#how-the-rte-runs)),
   i AWX, AAP, Ascender, Semaphore, Rundeck o Jenkins executa una plantilla o un job. Un [workflow](workflows/) executa els seus nodes, cadascun com una
   tasca pròpia al seu propi runner
8. **Seguiment** : el servidor desa la sortida a la base de dades a mesura que arriba, enviada per l'RTE a través del seu socket en el cas d'un playbook, o llegida dels
   altres runners. La pàgina del formulari torna a llegir la tasca cada dos segons, i la pàgina Tasques la segueix en directe a mesura que el servidor
   anuncia cada canvi
9. **Final** : la tasca rep el seu estat final, i les seves [`notifications`](forms/notifications.html) s'envien per correu i als seus
   [canals de notificació](notification-channels.html) quan el formulari les demana

---

## On es desen les coses

AnsibleForms desa el seu estat en dos llocs: la base de dades MySQL i la carpeta persistent. Fes còpia de seguretat de tots dos.

### A la base de dades
{: .no_toc }

La base de dades, `AnsibleForms`, es crea en el primer inici (tret que `ALLOW_SCHEMA_CREATION` sigui `0`) i conté:

* les tasques, les seves extravars i la seva sortida, les programacions i les tasques desades
* els usuaris locals, els grups i els tokens d'API
* les credencials, xifrades amb `ENCRYPTION_SECRET`, i les connexions als magatzems de secrets
* els runners, els canals de notificació (inclòs el correu), els servidors syslog, i la configuració de LDAP, SSO, repositoris i assistent de xat
* el registre d'auditoria

### A la carpeta persistent
{: .no_toc }

És `/app/dist/persistent` a la imatge i `server/persistent` des del codi font; cada ruta té la seva pròpia [variable](customization/paths.html):

| Ruta predeterminada | Variable | Contingut |
|---|---|---|
| `config.yaml` | [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) | Les categories, els rols i les constants |
| `forms/` | [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) | Els fitxers de formularis, `.yaml` o `.yml`, en subcarpetes si vols |
| `playbooks/` | [`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH) | Els playbooks dels formularis `ansible`, i el seu directori de treball |
| `repositories/` | [`REPO_PATH`](customization/paths.html#env_REPO_PATH) | Els clons dels repositoris git |
| `forms_backups/` | [`FORMS_BACKUP_PATH`](customization/paths.html#env_FORMS_BACKUP_PATH) | Les còpies que fa el Dissenyador abans de desar |
| `backups/` | [`BACKUP_PATH`](customization/paths.html#env_BACKUP_PATH) | Les còpies de seguretat de la base de dades |
| `uploads/` | [`UPLOAD_PATH`](customization/paths.html#env_UPLOAD_PATH) | Els fitxers pujats mitjançant camps `file` |
| `logs/` | [`LOG_PATH`](customization/logging.html#env_LOG_PATH) | `ansibleforms.log` i `ansibleforms.errors.log` |
| `certificates/` | [`HTTPS_CERT`](customization/server.html#env_HTTPS_CERT), [`HTTPS_KEY`](customization/server.html#env_HTTPS_KEY) | El certificat i la clau, quan `HTTPS` és `1` |
| `.env` | | Les variables d'entorn desades des de les pàgines de configuració (tret que `ALLOW_ENV_EDIT` sigui `0`) |

La clau SSH generada és a [`HOME_PATH`](customization/paths.html#env_HOME_PATH), fora de la carpeta persistent per defecte.
