---
layout: default
title: Comment ça marche
nav_order: 2
translated_from: e802a9168b87771c9d1a2d2d9af9368646b4f39f
---

# Comment ça marche
{: .no_toc }

Les éléments d'une installation, ce qui se passe lors d'un lancement, et où les données sont conservées
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Architecture

AnsibleForms est un serveur Node.js qui sert l'application web et une API REST, adossé à une base de données MySQL. Il lit les formulaires
depuis des fichiers YAML et n'exécute rien lui-même : il confie chaque job à un [runner](runners.html). Un playbook part vers l'un de vos conteneurs RTE
(runtime environment, environnement d'exécution), qui exécute `ansible-playbook`, et un modèle ou un job part vers AWX, AAP, Ascender, Semaphore, Rundeck ou Jenkins :

<div class="af-diagram" markdown="0">
<svg viewBox="0 0 760 500" role="img" aria-labelledby="afd-title afd-desc" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;height:auto;color:var(--body-text-color);font-family:inherit">
<title id="afd-title">Architecture d'AnsibleForms</title>
<desc id="afd-desc">Le navigateur et un client MCP optionnel communiquent avec le serveur AnsibleForms. Le serveur stocke ses données dans MySQL et dans le dossier persistant, et se connecte aux sources de données, aux coffres de secrets, aux dépôts git, aux fournisseurs de connexion, aux canaux de notification, aux serveurs syslog et à un fournisseur de modèles optionnel. Ses runners confient chaque playbook à l'un d'un ou plusieurs conteneurs RTE, chacun via un WebSocket, qui exécutent ansible-playbook et renvoient la sortie au serveur, et chaque modèle ou job à AWX, AAP, Ascender, Semaphore, Rundeck ou Jenkins.</desc>
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
<text class="afd-t" x="105" y="94" text-anchor="middle">Navigateur</text>
<text class="afd-s" x="105" y="112" text-anchor="middle">formulaires, concepteur,</text>
<text class="afd-s" x="105" y="127" text-anchor="middle">jobs, chat</text>
<rect class="afd-box afd-opt" x="20" y="200" width="170" height="70" rx="10"/>
<text class="afd-t" x="105" y="229" text-anchor="middle">Client MCP</text>
<text class="afd-s" x="105" y="248" text-anchor="middle">optionnel</text>
<line class="afd-line" x1="190" y1="105" x2="258" y2="105" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<line class="afd-line afd-opt" x1="190" y1="235" x2="258" y2="235" marker-end="url(#afd-arrow)"/>
<rect class="afd-main" x="260" y="30" width="240" height="345" rx="12"/>
<text class="afd-h" x="380" y="56" text-anchor="middle">Serveur AnsibleForms</text>
<text class="afd-s" x="380" y="74" text-anchor="middle">Node.js / Express</text>
<rect class="afd-inner" x="280" y="88" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="114" text-anchor="middle">Application web, API REST</text>
<rect class="afd-inner" x="280" y="142" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="168" text-anchor="middle">Formulaires, expressions</text>
<rect class="afd-inner" x="280" y="196" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="222" text-anchor="middle">Workflows, planifications</text>
<rect class="afd-inner afd-opt" x="280" y="250" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="276" text-anchor="middle">Serveur MCP (optionnel)</text>
<rect class="afd-run" x="280" y="304" width="200" height="50" rx="8"/>
<text class="afd-t" x="380" y="325" text-anchor="middle">Runners</text>
<text class="afd-s" x="380" y="342" text-anchor="middle">confient chaque job à son runner</text>
<rect class="afd-box" x="570" y="30" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="47" text-anchor="middle">Sources de données</text>
<text class="afd-s" x="655" y="63" text-anchor="middle">bases, API REST, fichiers</text>
<rect class="afd-box" x="570" y="80" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="97" text-anchor="middle">Coffres de secrets</text>
<text class="afd-s" x="655" y="113" text-anchor="middle">HashiCorp Vault, CyberArk</text>
<rect class="afd-box" x="570" y="130" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="147" text-anchor="middle">Dépôts git</text>
<text class="afd-s" x="655" y="163" text-anchor="middle">formulaires, playbooks, config</text>
<rect class="afd-box" x="570" y="180" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="197" text-anchor="middle">Authentification</text>
<text class="afd-s" x="655" y="213" text-anchor="middle">LDAP, Entra ID, OIDC</text>
<rect class="afd-box" x="570" y="230" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="247" text-anchor="middle">Canaux de notification</text>
<text class="afd-s" x="655" y="263" text-anchor="middle">mail, Slack, Teams, webhooks</text>
<rect class="afd-box" x="570" y="280" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="297" text-anchor="middle">Serveurs syslog</text>
<text class="afd-s" x="655" y="313" text-anchor="middle">le journal, la piste d'audit</text>
<rect class="afd-box afd-opt" x="570" y="330" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="347" text-anchor="middle">Fournisseur de modèles</text>
<text class="afd-s" x="655" y="363" text-anchor="middle">optionnel, assistant de chat</text>
<line class="afd-line" x1="500" y1="51" x2="568" y2="51" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="101" x2="568" y2="101" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="151" x2="568" y2="151" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="201" x2="568" y2="201" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="251" x2="568" y2="251" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="301" x2="568" y2="301" marker-end="url(#afd-arrow)"/>
<line class="afd-line afd-opt" x1="500" y1="351" x2="568" y2="351" marker-end="url(#afd-arrow)"/>
<rect class="afd-box" x="20" y="420" width="170" height="60" rx="10"/>
<text class="afd-t" x="105" y="445" text-anchor="middle">Dossier persistant</text>
<text class="afd-s" x="105" y="463" text-anchor="middle">config, formulaires, playbooks</text>
<rect class="afd-box" x="210" y="420" width="150" height="60" rx="10"/>
<text class="afd-t" x="285" y="441" text-anchor="middle">MySQL / MariaDB</text>
<text class="afd-s" x="285" y="458" text-anchor="middle">jobs, utilisateurs,</text>
<text class="afd-s" x="285" y="472" text-anchor="middle">identifiants</text>
<polyline class="afd-line" points="260,355 105,355 105,418" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="285" y1="377" x2="285" y2="418" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<rect class="afd-main afd-solid afd-back" x="412" y="408" width="150" height="60" rx="10"/>
<rect class="afd-main afd-solid afd-back" x="406" y="414" width="150" height="60" rx="10"/>
<rect class="afd-main afd-solid" x="400" y="420" width="150" height="60" rx="10"/>
<text class="afd-t" x="475" y="445" text-anchor="middle">Conteneurs RTE</text>
<text class="afd-s" x="475" y="463" text-anchor="middle">lancent ansible-playbook</text>
<rect class="afd-box" x="570" y="420" width="182" height="60" rx="10"/>
<text class="afd-t" x="661" y="445" text-anchor="middle">AWX / AAP / Ascender</text>
<text class="afd-s" x="661" y="463" text-anchor="middle">Semaphore, Rundeck, Jenkins</text>
<line class="afd-go" x1="420" y1="354" x2="420" y2="405" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<polyline class="afd-go" points="470,354 470,394 661,394 661,418" marker-end="url(#afd-arrow)"/>
<text class="afd-s" x="413" y="387" text-anchor="end">playbooks,</text>
<text class="afd-s" x="413" y="400" text-anchor="end">WebSocket</text>
<text class="afd-s" x="566" y="388" text-anchor="middle">modèles, jobs</text>
</svg>
</div>

Chaque composant du schéma a son propre rôle :

| Composant | Rôle |
|---|---|
| **Navigateur** | L'application web Vue : les formulaires, le [Concepteur](gui/designer-and-git.html), l'historique des jobs et les paramètres |
| **Serveur AnsibleForms** | Évalue les formulaires, enregistre les jobs, exécute les workflows et les planifications, confie chaque job à son runner et le suit, et sert l'[API REST](api/) |
| **Runners** | Là où les jobs s'exécutent, ajoutés sous **Connexions > Runners** : un formulaire en nomme un avec `runner: <name>`, ou utilise le runner par défaut de son type (voir [Runners](runners.html)) |
| **Conteneurs RTE** | Un ou plusieurs conteneurs d'environnement d'exécution, le même serveur démarré avec `AF_ROLE=rte` : chacun exécute `ansible-playbook` pour les [formulaires ansible](forms/ansible.html), avec les bibliothèques python et les collections de son image, et renvoie la sortie et le statut final au serveur via un WebSocket, sans identifiants de base de données (voir [Comment le RTE s'exécute](rte/#how-the-rte-runs)) |
| **AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins** | Les runners des modèles et des jobs : les [formulaires AWX](forms/awx.html) lancent un modèle de job ou de workflow, les formulaires [Semaphore](forms/semaphore.html), [Rundeck](forms/rundeck.html) et [Jenkins](forms/jenkins.html) lancent l'un de leurs jobs, et le serveur suit sa sortie |
| **MySQL / MariaDB** | Contient les jobs et leur sortie, les utilisateurs, les identifiants et les connexions ; seul le serveur la lit et l'écrit |
| **Dossier persistant** | Contient `config.yaml`, les fichiers de formulaires, les playbooks, les journaux et les sauvegardes |
| **Sources de données** | Alimentent les champs : [requêtes de base de données](formfields/enum.html), [API REST](expressions/rest-apis.html), fichiers et [autres fonctions](expressions/remote.html) |
| **Coffres de secrets** | Fournissent l'utilisateur et le mot de passe d'un identifiant au moment de son utilisation, voir [Coffres de secrets](secret-stores/) |
| **Dépôts git** | Gardent les formulaires, les playbooks et `config.yaml` sous contrôle de version |
| **Fournisseurs de connexion** | Connectent les utilisateurs : [LDAP, Entra ID et OIDC](authentication/), en plus des utilisateurs locaux |
| **Canaux de notification** | Transportent les [notifications](forms/notifications.html) et les demandes d'approbation : [mail, Slack, Microsoft Teams, Telegram ou un webhook](notification-channels.html) |
| **Serveurs syslog** | Reçoivent le journal et la piste d'audit au fur et à mesure de leur écriture, voir [Syslog](production/logs.html#syslog) |
| **Client MCP, chat** | Optionnels, tous deux désactivés par défaut : le [serveur MCP](mcp/) et l'[assistant de chat](chat/), qui a besoin d'un fournisseur de modèles |

Par défaut, un seul conteneur fait tourner ensemble le serveur, l'application web et le travail en arrière-plan, à côté d'un RTE. Pour plusieurs nœuds d'application derrière un
répartiteur de charge, un worker qui s'occupe du travail en arrière-plan, et davantage de RTE, voir [Mise à l'échelle](production/scaling.html).

### Technologies utilisées

Le serveur et l'interface web reposent sur ces composants :

| Élément | Technologie |
|---|---|
| **Serveur** | Node.js et Express |
| **Base de données** | MySQL ou MariaDB |
| **Interface web** | Vue 3, avec Bootstrap 5 et Font Awesome |

---

## Ce qui se passe quand vous lancez un formulaire

Un lancement passe par les mêmes étapes, qu'il vienne du navigateur ou de l'[API REST](api/jobs.html) :

1. **Chargement** : le serveur n'envoie que les formulaires que les [rôles](config/roles.html) de l'utilisateur autorisent, et évalue les expressions côté serveur
2. **Envoi** : le navigateur transforme les valeurs des champs en extravars et les poste sur `POST /api/v2/job`
3. **Vérification** : le serveur recharge le formulaire pour les rôles de l'utilisateur et, avec la [validation au lancement](launch-validation/) activée, vérifie les valeurs
4. **Enregistrement** : le job est stocké avec le statut `running`, et son id est ajouté aux extravars sous `__jobid__`
5. **Approbation** : un formulaire avec un point d'[`approval`](forms/approval.html) attend qu'un approbateur accepte le job
6. **Identifiants** : pour un playbook, l'application (jamais le RTE) lit les identifiants du formulaire dans la base de données ou dans un [coffre de secrets](secret-stores/)
7. **Exécution** : le job part vers son runner, celui que le formulaire nomme avec `runner:` ou celui par défaut de son type. Pour un playbook, l'application envoie le job à son
   RTE via le WebSocket du RTE, avec ses identifiants scellés pour lui, et le RTE exécute `ansible-playbook` (voir [Comment le RTE s'exécute](rte/#how-the-rte-runs)),
   et AWX, AAP, Ascender, Semaphore, Rundeck ou Jenkins exécute un modèle ou un job. Un [workflow](workflows/) exécute ses nœuds, chacun comme
   un job à part sur son propre runner
8. **Suivi** : le serveur enregistre la sortie dans la base de données au fur et à mesure qu'elle arrive, envoyée par le RTE via son socket pour un playbook, ou lue depuis les
   autres runners. La page du formulaire relit le job toutes les deux secondes, et la page Jobs le suit en direct à mesure que le serveur
   annonce chaque changement
9. **Fin** : le job reçoit son statut final, et ses [`notifications`](forms/notifications.html) partent par mail et vers ses
   [canaux de notification](notification-channels.html) quand le formulaire les demande

---

## Où les choses sont stockées

AnsibleForms conserve son état à deux endroits : la base de données MySQL et le dossier persistant. Sauvegardez les deux.

### Dans la base de données
{: .no_toc }

La base de données, `AnsibleForms`, est créée au premier démarrage (sauf si `ALLOW_SCHEMA_CREATION` vaut `0`) et contient :

* les jobs, leurs extravars et leur sortie, les planifications et les jobs enregistrés
* les utilisateurs locaux, les groupes et les jetons d'API
* les identifiants, chiffrés avec `ENCRYPTION_SECRET`, et les connexions aux coffres de secrets
* les runners, les canaux de notification (mail compris), les serveurs syslog, et les paramètres LDAP, SSO, des dépôts et de l'assistant de chat
* le journal d'audit

### Dans le dossier persistant
{: .no_toc }

C'est `/app/dist/persistent` dans l'image et `server/persistent` depuis les sources ; chaque chemin a sa propre [variable](customization/paths.html) :

| Chemin par défaut | Variable | Contenu |
|---|---|---|
| `config.yaml` | [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) | Les catégories, les rôles et les constantes |
| `forms/` | [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) | Les fichiers de formulaires, `.yaml` ou `.yml`, dans des sous-dossiers si vous le souhaitez |
| `playbooks/` | [`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH) | Les playbooks des formulaires `ansible`, et leur répertoire de travail |
| `repositories/` | [`REPO_PATH`](customization/paths.html#env_REPO_PATH) | Les clones des dépôts git |
| `forms_backups/` | [`FORMS_BACKUP_PATH`](customization/paths.html#env_FORMS_BACKUP_PATH) | Les copies que le Concepteur fait avant d'enregistrer |
| `backups/` | [`BACKUP_PATH`](customization/paths.html#env_BACKUP_PATH) | Les sauvegardes de la base de données |
| `uploads/` | [`UPLOAD_PATH`](customization/paths.html#env_UPLOAD_PATH) | Les fichiers téléversés via les champs `file` |
| `logs/` | [`LOG_PATH`](customization/logging.html#env_LOG_PATH) | `ansibleforms.log` et `ansibleforms.errors.log` |
| `certificates/` | [`HTTPS_CERT`](customization/server.html#env_HTTPS_CERT), [`HTTPS_KEY`](customization/server.html#env_HTTPS_KEY) | Le certificat et la clé, quand `HTTPS` vaut `1` |
| `.env` | | Les variables d'environnement enregistrées depuis les pages de paramètres (sauf si `ALLOW_ENV_EDIT` vaut `0`) |

La clé SSH générée se trouve dans [`HOME_PATH`](customization/paths.html#env_HOME_PATH), hors du dossier persistant par défaut.
