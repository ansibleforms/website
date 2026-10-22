---
layout: default
title: Hoe het werkt
nav_order: 2
translated_from: e802a9168b87771c9d1a2d2d9af9368646b4f39f
---

# Hoe het werkt
{: .no_toc }

De onderdelen van een installatie, wat er bij een start gebeurt, en waar gegevens worden bewaard
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Architectuur

AnsibleForms is een Node.js-server die de webapplicatie en een REST API aanbiedt, ondersteund door een MySQL-database. Hij leest formulieren
uit YAML-bestanden en voert zelf niets uit: hij geeft elke job aan een [runner](runners.html). Een playbook gaat naar een van je RTE-containers
(runtime-omgeving), die `ansible-playbook` uitvoert, en een template of job gaat naar AWX, AAP, Ascender, Semaphore, Rundeck of Jenkins:

<div class="af-diagram" markdown="0">
<svg viewBox="0 0 760 500" role="img" aria-labelledby="afd-title afd-desc" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;height:auto;color:var(--body-text-color);font-family:inherit">
<title id="afd-title">Architectuur van AnsibleForms</title>
<desc id="afd-desc">De browser en een optionele MCP-client praten met de AnsibleForms-server. De server slaat zijn gegevens op in MySQL en in de persistente map, en maakt verbinding met gegevensbronnen, secret stores, git-repositories, aanmeldproviders, meldingskanalen, syslogservers en een optionele modelprovider. Zijn runners geven elk playbook aan een van een of meer RTE-containers, elk over een eigen WebSocket, die ansible-playbook uitvoeren en de uitvoer terugsturen naar de server, en elke template of job aan AWX, AAP, Ascender, Semaphore, Rundeck of Jenkins.</desc>
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
<text class="afd-t" x="105" y="94" text-anchor="middle">Browser</text>
<text class="afd-s" x="105" y="112" text-anchor="middle">formulieren, designer,</text>
<text class="afd-s" x="105" y="127" text-anchor="middle">jobs, chat</text>
<rect class="afd-box afd-opt" x="20" y="200" width="170" height="70" rx="10"/>
<text class="afd-t" x="105" y="229" text-anchor="middle">MCP-client</text>
<text class="afd-s" x="105" y="248" text-anchor="middle">optioneel</text>
<line class="afd-line" x1="190" y1="105" x2="258" y2="105" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<line class="afd-line afd-opt" x1="190" y1="235" x2="258" y2="235" marker-end="url(#afd-arrow)"/>
<rect class="afd-main" x="260" y="30" width="240" height="345" rx="12"/>
<text class="afd-h" x="380" y="56" text-anchor="middle">AnsibleForms-server</text>
<text class="afd-s" x="380" y="74" text-anchor="middle">Node.js / Express</text>
<rect class="afd-inner" x="280" y="88" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="114" text-anchor="middle">Webapp en REST API</text>
<rect class="afd-inner" x="280" y="142" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="168" text-anchor="middle">Formulieren, expressies</text>
<rect class="afd-inner" x="280" y="196" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="222" text-anchor="middle">Workflows, planningen</text>
<rect class="afd-inner afd-opt" x="280" y="250" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="276" text-anchor="middle">MCP-server (optioneel)</text>
<rect class="afd-run" x="280" y="304" width="200" height="50" rx="8"/>
<text class="afd-t" x="380" y="325" text-anchor="middle">Runners</text>
<text class="afd-s" x="380" y="342" text-anchor="middle">geven elke job aan zijn runner</text>
<rect class="afd-box" x="570" y="30" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="47" text-anchor="middle">Gegevensbronnen</text>
<text class="afd-s" x="655" y="63" text-anchor="middle">databases, API's, bestanden</text>
<rect class="afd-box" x="570" y="80" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="97" text-anchor="middle">Secret stores</text>
<text class="afd-s" x="655" y="113" text-anchor="middle">HashiCorp Vault, CyberArk</text>
<rect class="afd-box" x="570" y="130" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="147" text-anchor="middle">Git-repositories</text>
<text class="afd-s" x="655" y="163" text-anchor="middle">formulieren, playbooks, config</text>
<rect class="afd-box" x="570" y="180" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="197" text-anchor="middle">Aanmeldproviders</text>
<text class="afd-s" x="655" y="213" text-anchor="middle">LDAP, Entra ID, OIDC</text>
<rect class="afd-box" x="570" y="230" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="247" text-anchor="middle">Meldingskanalen</text>
<text class="afd-s" x="655" y="263" text-anchor="middle">mail, Slack, Teams, webhooks</text>
<rect class="afd-box" x="570" y="280" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="297" text-anchor="middle">Syslogservers</text>
<text class="afd-s" x="655" y="313" text-anchor="middle">het log, het audittrail</text>
<rect class="afd-box afd-opt" x="570" y="330" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="347" text-anchor="middle">Modelprovider</text>
<text class="afd-s" x="655" y="363" text-anchor="middle">optioneel, chat-assistent</text>
<line class="afd-line" x1="500" y1="51" x2="568" y2="51" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="101" x2="568" y2="101" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="151" x2="568" y2="151" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="201" x2="568" y2="201" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="251" x2="568" y2="251" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="301" x2="568" y2="301" marker-end="url(#afd-arrow)"/>
<line class="afd-line afd-opt" x1="500" y1="351" x2="568" y2="351" marker-end="url(#afd-arrow)"/>
<rect class="afd-box" x="20" y="420" width="170" height="60" rx="10"/>
<text class="afd-t" x="105" y="445" text-anchor="middle">Persistente map</text>
<text class="afd-s" x="105" y="463" text-anchor="middle">config, formulieren, playbooks</text>
<rect class="afd-box" x="210" y="420" width="150" height="60" rx="10"/>
<text class="afd-t" x="285" y="441" text-anchor="middle">MySQL / MariaDB</text>
<text class="afd-s" x="285" y="458" text-anchor="middle">jobs, gebruikers,</text>
<text class="afd-s" x="285" y="472" text-anchor="middle">referenties</text>
<polyline class="afd-line" points="260,355 105,355 105,418" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="285" y1="377" x2="285" y2="418" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<rect class="afd-main afd-solid afd-back" x="412" y="408" width="150" height="60" rx="10"/>
<rect class="afd-main afd-solid afd-back" x="406" y="414" width="150" height="60" rx="10"/>
<rect class="afd-main afd-solid" x="400" y="420" width="150" height="60" rx="10"/>
<text class="afd-t" x="475" y="445" text-anchor="middle">RTE-containers</text>
<text class="afd-s" x="475" y="463" text-anchor="middle">draaien ansible-playbook</text>
<rect class="afd-box" x="570" y="420" width="182" height="60" rx="10"/>
<text class="afd-t" x="661" y="445" text-anchor="middle">AWX / AAP / Ascender</text>
<text class="afd-s" x="661" y="463" text-anchor="middle">Semaphore, Rundeck, Jenkins</text>
<line class="afd-go" x1="420" y1="354" x2="420" y2="405" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<polyline class="afd-go" points="470,354 470,394 661,394 661,418" marker-end="url(#afd-arrow)"/>
<text class="afd-s" x="413" y="387" text-anchor="end">playbooks,</text>
<text class="afd-s" x="413" y="400" text-anchor="end">WebSocket</text>
<text class="afd-s" x="566" y="388" text-anchor="middle">templates, jobs</text>
</svg>
</div>

De onderdelen in het diagram hebben elk een eigen rol:

| Onderdeel | Rol |
|---|---|
| **Browser** | De Vue-webapplicatie: de formulieren, de [Designer](gui/designer-and-git.html), de jobgeschiedenis en de instellingen |
| **AnsibleForms-server** | Evalueert de formulieren, legt de jobs vast, voert de workflows en de planningen uit, geeft elke job aan zijn runner en volgt hem, en biedt de [REST API](api/) aan |
| **Runners** | Waar jobs draaien, toegevoegd onder **Verbindingen > Runners**: een formulier noemt er een met `runner: <name>`, of gebruikt de standaardrunner van zijn type (zie [Runners](runners.html)) |
| **RTE-containers** | Een of meer containers met een runtime-omgeving, dezelfde server gestart met `AF_ROLE=rte`: elk voert `ansible-playbook` uit voor [ansible-formulieren](forms/ansible.html), met de python-bibliotheken en collections van zijn image, en stuurt de uitvoer en de eindstatus terug naar de server over één WebSocket, zonder database-inloggegevens (zie [Hoe de RTE draait](rte/#how-the-rte-runs)) |
| **AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins** | Runners voor templates en jobs: [AWX-formulieren](forms/awx.html) starten een job- of workflowtemplate, formulieren voor [Semaphore](forms/semaphore.html), [Rundeck](forms/rundeck.html) en [Jenkins](forms/jenkins.html) starten een van hun jobs, en de server volgt de uitvoer |
| **MySQL / MariaDB** | Bevat de jobs en hun uitvoer, de gebruikers, de referenties en de verbindingen; alleen de server leest en schrijft erin |
| **Persistente map** | Bevat `config.yaml`, de formulierbestanden, de playbooks, de logs en de back-ups |
| **Gegevensbronnen** | Vullen de velden: [databasequery's](formfields/enum.html), [REST API's](expressions/rest-apis.html), bestanden en [andere functies](expressions/remote.html) |
| **Secret stores** | Leveren de gebruiker en het wachtwoord van een referentie op het moment van gebruik, zie [Secret stores](secret-stores/) |
| **Git-repositories** | Houden de formulieren, de playbooks en `config.yaml` onder versiebeheer |
| **Aanmeldproviders** | Melden de gebruikers aan: [LDAP, Entra ID en OIDC](authentication/), naast de lokale gebruikers |
| **Meldingskanalen** | Brengen de [meldingen](forms/notifications.html) en de goedkeuringsverzoeken over: [mail, Slack, Microsoft Teams, Telegram of een webhook](notification-channels.html) |
| **Syslogservers** | Ontvangen het log en het audittrail terwijl ze worden geschreven, zie [Syslog](production/logs.html#syslog) |
| **MCP-client, chat** | Optioneel, beide standaard uit: de [MCP-server](mcp/) en de [chat-assistent](chat/), die een modelprovider nodig heeft |

Standaard draait één container de server, de webapp en het achtergrondwerk samen, naast één RTE. Voor meerdere app-nodes achter een
load balancer, een worker die het achtergrondwerk uitvoert, en meer RTE's, zie [Schalen](production/scaling.html).

### Gebouwd met

De server en de webinterface zijn gebouwd op deze onderdelen:

| Deel | Technologie |
|---|---|
| **Server** | Node.js en Express |
| **Database** | MySQL of MariaDB |
| **Webinterface** | Vue 3, met Bootstrap 5 en Font Awesome |

---

## Wat er gebeurt als je een formulier start

Een start doorloopt dezelfde stappen, of hij nu uit de browser komt of uit de [REST API](api/jobs.html):

1. **Laden** : de server stuurt alleen de formulieren die de [rollen](config/roles.html) van de gebruiker toestaan, en evalueert de serverexpressies
2. **Verzenden** : de browser zet de veldwaarden om in extravars en post ze naar `POST /api/v2/job`
3. **Controleren** : de server laadt het formulier opnieuw voor de rollen van de gebruiker en controleert, met [startvalidatie](launch-validation/) aan, de waarden
4. **Vastleggen** : de job wordt opgeslagen met status `running`, en het id ervan wordt aan de extravars toegevoegd als `__jobid__`
5. **Goedkeuren** : een formulier met een [`approval`](forms/approval.html)-punt wacht tot een goedkeurder de job accepteert
6. **Referenties** : voor een playbook leest de app (nooit de RTE) de referenties van het formulier uit de database of een [secret store](secret-stores/)
7. **Uitvoeren** : de job gaat naar zijn runner, de runner die het formulier met `runner:` noemt of de standaard van zijn type. Voor een playbook stuurt de app de job naar zijn
   RTE over de WebSocket van de RTE, met de referenties voor die RTE verzegeld, en de RTE voert `ansible-playbook` uit (zie [Hoe de RTE draait](rte/#how-the-rte-runs)),
   en AWX, AAP, Ascender, Semaphore, Rundeck of Jenkins voert een template of een job uit. Een [workflow](workflows/) voert zijn nodes uit, elk als een
   eigen job op een eigen runner
8. **Volgen** : de server slaat de uitvoer in de database op zodra die binnenkomt, voor een playbook door de RTE over zijn socket gestuurd, of gelezen van de
   andere runners. De formulierpagina leest de job elke twee seconden opnieuw, en de pagina Taken volgt hem live terwijl de server
   elke wijziging aankondigt
9. **Einde** : de job krijgt zijn eindstatus, en zijn [`notifications`](forms/notifications.html) gaan per mail en naar zijn
   [meldingskanalen](notification-channels.html) als het formulier daarom vraagt

---

## Waar alles wordt opgeslagen

AnsibleForms bewaart zijn toestand op twee plaatsen: de MySQL-database en de persistente map. Maak van beide een back-up.

### In de database
{: .no_toc }

De database, `AnsibleForms`, wordt bij de eerste start aangemaakt (tenzij `ALLOW_SCHEMA_CREATION` `0` is) en bevat:

* de jobs, hun extravars en hun uitvoer, de planningen en de opgeslagen jobs
* de lokale gebruikers, de groepen en de API-tokens
* de referenties, versleuteld met `ENCRYPTION_SECRET`, en de verbindingen met secret stores
* de runners, de meldingskanalen (mail inbegrepen), de syslogservers, en de instellingen voor LDAP, SSO, repositories en de chat-assistent
* het auditlogboek

### In de persistente map
{: .no_toc }

Dat is `/app/dist/persistent` in de image en `server/persistent` vanuit de broncode; elk pad heeft een eigen [variabele](customization/paths.html):

| Standaardpad | Variabele | Inhoud |
|---|---|---|
| `config.yaml` | [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) | De categorieën, de rollen en de constanten |
| `forms/` | [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) | De formulierbestanden, `.yaml` of `.yml`, desgewenst in submappen |
| `playbooks/` | [`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH) | De playbooks van `ansible`-formulieren, en hun werkmap |
| `repositories/` | [`REPO_PATH`](customization/paths.html#env_REPO_PATH) | De clones van de git-repositories |
| `forms_backups/` | [`FORMS_BACKUP_PATH`](customization/paths.html#env_FORMS_BACKUP_PATH) | De kopieën die de Designer maakt voordat hij opslaat |
| `backups/` | [`BACKUP_PATH`](customization/paths.html#env_BACKUP_PATH) | De databaseback-ups |
| `uploads/` | [`UPLOAD_PATH`](customization/paths.html#env_UPLOAD_PATH) | De bestanden die via `file`-velden zijn geüpload |
| `logs/` | [`LOG_PATH`](customization/logging.html#env_LOG_PATH) | `ansibleforms.log` en `ansibleforms.errors.log` |
| `certificates/` | [`HTTPS_CERT`](customization/server.html#env_HTTPS_CERT), [`HTTPS_KEY`](customization/server.html#env_HTTPS_KEY) | Het certificaat en de sleutel, als `HTTPS` `1` is |
| `.env` | | De omgevingsvariabelen die vanuit de instellingenpagina's zijn opgeslagen (tenzij `ALLOW_ENV_EDIT` `0` is) |

De gegenereerde SSH-sleutel staat in [`HOME_PATH`](customization/paths.html#env_HOME_PATH), standaard buiten de persistente map.
