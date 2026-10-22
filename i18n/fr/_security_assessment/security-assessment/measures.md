---
layout: default
title: Mesures de sécurité
nav_order: 2
translated_from: 1ceeb1a74d9235a43a8600d8bf7e0a39015a124a
---

# Mesures de sécurité
{: .no_toc }

Comment la connexion, les autorisations, les secrets et les connexions sont protégés
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Où il s'exécute

AnsibleForms est auto-hébergé, sur votre infrastructure, avec ses données dans une base de données que vous exploitez.

* Il n'y a ni service cloud AnsibleForms ni serveur de licences, et aucune télémétrie ni vérification de mises à jour.
* L'interface est servie par l'application elle-même et ne charge rien depuis un autre site.
* L'application ne se connecte qu'aux systèmes qu'un administrateur configure, listés dans [Connexions sortantes](#outbound-connections).

Les composants et ce que chacun contient :

| Composant | Ce qu'il fait | Ce qu'il contient |
|---|---|---|
| Application | L'interface web, l'API REST, le planificateur | Aucune donnée propre : tout est dans la base de données |
| MySQL ou MariaDB | La base de données de l'application | Les utilisateurs, les groupes, les identifiants (chiffrés), les jobs avec leurs extravars et leur sortie, le journal d'audit |
| Environnement d'exécution (RTE) | Exécute les playbooks, dans son propre conteneur | Les fichiers des jobs qu'il exécute, et les secrets d'un job uniquement pendant l'exécution de ce job |
| Dossier persistant | La configuration, les formulaires, les playbooks et les fichiers envoyés | Les fichiers qu'utilisent les formulaires et les playbooks |

Voir [Fonctionnement](../how-it-works.html) pour la vue d'ensemble, et [RTE](../rte/) pour l'environnement d'exécution.

---

## Connexion

Chaque page et chaque appel d'API qui lit ou modifie des données exige un utilisateur connecté. Les quelques points de terminaison ouverts sans connexion servent
la connexion elle-même, la version, le nom et le logo de l'instance, la documentation de l'API, et la mise en place de la base de données lors d'un premier démarrage,
que [`ALLOW_SCHEMA_CREATION`](../security/hardening.html#the-database)`=0` ferme :

| Méthode | Fonctionnement |
|---|---|
| Comptes locaux | Mots de passe hachés avec bcrypt, une [longueur minimale](../security/hardening.html#sign-in-limits-and-passwords), et le mot de passe admin par défaut, public, doit être changé à la première connexion |
| LDAP / Active Directory | L'annuaire vérifie le mot de passe, et ses groupes sont associés à des rôles. Voir [LDAP](../authentication/ldap.html) |
| OpenID Connect, Entra ID | Authentification unique via votre fournisseur d'identité, qui apporte aussi sa propre authentification multifacteur. Voir [Authentification](../authentication/) |

* Les échecs de connexion [verrouillent le compte](../security/hardening.html#sign-in-limits-and-passwords), et la connexion est limitée en débit.
* Une connexion renvoie un jeton d'accès signé valable 30 minutes et un jeton de rafraîchissement valable 24 heures.
* Les jetons peuvent prendre fin avant leur expiration : la déconnexion, un changement de mot de passe, un utilisateur bloqué et un jeton d'API révoqué y mettent fin sur
  tous les nœuds à la fois, voir [Jetons](../security/secrets.html#tokens).
* AnsibleForms n'a pas d'authentification multifacteur propre : utilisez l'authentification unique là où elle est exigée.

---

## Autorisations

Ce qu'un utilisateur peut faire découle des rôles de ses groupes, vérifiés par le serveur à chaque requête :

* Les rôles sont définis dans [config.yaml](../config/roles.html) : quels formulaires un utilisateur voit, et de quelles options il dispose,
  comme le concepteur, les pages de paramètres ou les jobs des autres utilisateurs.
* Le serveur vérifie chaque lancement au regard des règles du formulaire (ses champs, leurs valeurs et l'accès de l'utilisateur), y compris
  les lancements via l'API REST, voir [Validation au lancement](../launch-validation/).
* Le rôle admin exécute n'importe quel playbook, par conception. Les autres rôles n'obtiennent que ce qui leur est accordé : un utilisateur qui a plusieurs rôles n'obtient une
  option que si aucun de ces rôles ne la refuse ; un seul rôle restrictif suffit donc à la retenir.

---

## Secrets stockés

Les mots de passe, jetons et clés sont chiffrés avant d'être écrits dans la base de données :

* Chaque secret stocké (identifiants, mot de passe de bind LDAP, jetons des runners, secrets client de l'authentification unique, adresses de
  webhook et clés d'API) est chiffré en AES-256 avec un vecteur d'initialisation aléatoire par valeur, sous le
  [`ENCRYPTION_SECRET`](../security/secrets.html#the-two-master-secrets) que vous définissez.
* Aucun appel d'API ni aucune page de paramètres n'affiche un secret stocké, et les sauvegardes omettent les secrets maîtres.
* Les secrets peuvent rester dans votre coffre : [HashiCorp Vault et CyberArk](../secret-stores/) sont lus quand un job en a besoin.
* Les secrets d'un job parviennent à l'environnement d'exécution scellés en AES-256-GCM, sous une clé dérivée de son jeton.
* Les extravars dont le nom ressemble à un secret sont masquées dans la vue du job, et les champs mot de passe le sont toujours, voir [Données des jobs](../security/hardening.html#job-data).

Le reste de la base de données (les jobs, leurs extravars et leur sortie) est stocké tel quel : protégez-le avec le chiffrement au repos
et le contrôle d'accès propres à la base de données, voir [La base de données](../security/hardening.html#the-database).

---

## Piste d'audit

Chaque modification, et chaque tentative refusée, est enregistrée :

* Chaque création, modification et suppression, via l'interface ou l'API, est écrite dans le journal d'audit avec l'utilisateur, son
  adresse, l'action, l'objet et le résultat. Les refus et les connexions sont aussi enregistrés, y compris les échecs.
* Les valeurs qui ressemblent à des secrets sont masquées avant d'être écrites.
* Le journal est conservé 365 jours par défaut, et peut être copié vers syslog via UDP, TCP ou TLS.

---

## Dans le navigateur

L'interface est protégée contre le code injecté dans une page :

* Une [Content-Security-Policy](../security/hardening.html#the-content-security-policy) n'autorise que les scripts et les frames de l'application elle-même.
* Chaque réponse porte des en-têtes de protection : nosniff, protection contre l'intégration en frame, et HSTS en HTTPS.
* Le HTML des formulaires, des textes d'aide et des réponses du chat est assaini, et la sortie des jobs est échappée.

---

## Sur le serveur

Le code qui traite les saisies des utilisateurs évite les injections classiques :

* Les requêtes de base de données passent leurs valeurs en paramètres, jamais sous forme de texte collé dans la requête.
* Les commandes, git compris, s'exécutent à partir d'une liste d'arguments, jamais d'un shell : les caractères du shell n'ont donc aucun effet.
* Les expressions serveur passent par un [filtre d'expressions](../security/hardening.html#expressions-and-outbound-calls), et leurs appels REST par un filtre d'hôtes.
* Le [serveur MCP](../mcp/), l'[assistant de chat](../chat/) et le point de terminaison des métriques sont désactivés jusqu'à ce que vous les activiez.

---

## Connexions

Le trafic vers et depuis AnsibleForms peut être chiffré de bout en bout :

* L'application sert elle-même le [HTTPS](../security/https.html), ou se place derrière votre reverse proxy.
* Un environnement d'exécution communique avec l'application via un WebSocket, `wss://` avec une adresse HTTPS, et l'application
  épingle le certificat d'un environnement entrant, voir [Modes du RTE](../rte/modes.html).
* LDAP, l'authentification unique, les runners, git, les coffres de secrets et les appels REST des expressions vérifient le certificat du
  serveur qu'ils atteignent, sauf si un administrateur désactive la vérification pour un serveur au certificat auto-signé.

### Connexions sortantes

AnsibleForms ne se connecte qu'à ce qu'un administrateur configure :

| Connexion | Quand |
|---|---|
| LDAP, OpenID Connect, Entra ID (connexion Microsoft et Graph) | Quand cette méthode de connexion est configurée |
| AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins | Quand un formulaire s'exécute sur ce runner |
| Serveurs git | Quand un dépôt est configuré |
| Serveur de messagerie, Slack, Teams, Telegram, webhooks | Quand un canal de notification est configuré |
| HashiCorp Vault, CyberArk | Quand un coffre de secrets est configuré |
| Un fournisseur de modèles (Anthropic, OpenAI et d'autres) | Uniquement avec l'[assistant de chat](../chat/) activé, qui est désactivé par défaut |
| Les hôtes et API nommés dans les formulaires | Quand les expressions d'un formulaire ou un playbook les appellent |
| Serveurs syslog | Quand le transfert de l'audit ou des journaux est configuré |

---

## Les conteneurs

Les images sont construites pour s'exécuter avec le moins de privilèges possible :

* L'application et l'environnement d'exécution s'exécutent avec l'utilisateur non privilégié `node`, pas en root.
* Elles sont construites sur des images Debian slim épinglées par digest, voir [Développement sécurisé](development.html#code-analysis-and-dependencies).
* L'application écoute sur un seul port, 8000.

Pour les étapes qui sécurisent une nouvelle instance, suivez [Durcissement](../security/hardening.html).
