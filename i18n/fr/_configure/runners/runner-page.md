---
layout: default
title: "La page d'un runner"
parent: Runners
nav_order: 4
translated_from: 4260f9b8ce60f26e8808cf17bf4a4c3993229c5d
---

# La page d'un runner
{: .no_toc }

Les onglets d'un runner, le mode, la connexion et les paramètres d'un RTE, et Tester la connexion
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Onglets

La page d'un runner affiche les étapes de sa boîte de dialogue sous forme d'onglets, plus ce qui s'exécute sur lui :

| Onglet | Ce qu'il contient |
|---|---|
| Détails | Le nom et la description, l'interrupteur **Par défaut** et l'interrupteur **Activé**, identiques pour tous les types de runners |
| Type | Le produit, comme dans la boîte de dialogue. Pour un RTE, aussi son **Mode** : **Base de données (obsolète)**, **Entrant** ou **Sortant**, le `RTE_MODE` avec lequel tourne son RTE (voir [Modes](../rte/modes.html)) |
| RTE | Propre à un RTE : son **Mode** en toutes lettres et, en mode socket, sa **Connexion** et ses paramètres (voir [Les paramètres d'un RTE](#an-rtes-settings)) |
| Identifiants | L'**Identifiant** avec lequel il se connecte, un identifiant de Connexions > Identifiants du type du runner, qui contient son jeton ou son accès et l'adresse de son serveur. Celui d'un RTE contient son `RTE_TOKEN`, et l'adresse du RTE sauf s'il est sortant. **Projet** pour Semaphore, Rundeck et Jenkins |
| Formulaires | Les formulaires qui s'exécutent sur lui, et comment : **Le nomme** ou **Comme runner par défaut**. Une ligne ouvre le formulaire |
| Jobs | Les 100 derniers jobs exécutés sur lui, avec leur statut, leur début, leur fin et leur durée. Une ligne ouvre le job |

Chaque onglet a sa propre adresse, comme `/settings/runners/<id>/rte`, si bien qu'un lien ou un favori l'ouvre. Un runner sans cet onglet s'ouvre sur
Détails.

Les deux interrupteurs de l'onglet Détails sont enregistrés immédiatement. **Par défaut** fait du runner celui par défaut de son type ; il se désactive en faisant
d'un autre runner celui par défaut. **Activé** active ou désactive le runner : désactivé, aucun job ne lui est envoyé, y compris comme runner par défaut de son type (voir
[Par défaut et Activé](list.html#default-and-enabled)).

Un RTE qui a demandé à rejoindre s'ouvre avec un encadré jaune, **Ce RTE demande à rejoindre**, avec son empreinte et ce qu'il a dit de lui-même, et
**Approuver** et **Refuser** (voir [Approuver un RTE](registration.html#approving-an-rte)). Un runner du [seed de configuration](../seed/) l'indique
en haut de sa page, et est en lecture seule.

---

## Les paramètres d'un RTE

L'onglet RTE gère un RTE depuis l'application, sans modifier son environnement sur la machine où il tourne.

**Connexion.** Un RTE en mode socket affiche un badge : **Connecté** ou **Non connecté**. Au survol, **Connecté** montre le nœud d'application
qui détient son socket, la version du RTE, et combien de ses jobs tournent. **Non connecté** signifie qu'aucun nœud d'application ne détient de socket vers lui :
vérifiez que le RTE tourne, son adresse ou `APP_URL`, et son jeton.

**Paramètres.** Un RTE en mode sortant ou entrant a quatre paramètres, chacun vide par défaut :

| Paramètre | Équivalent de | Ce qu'il fait |
|---|---|---|
| Jobs simultanés max. | [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) | Combien de playbooks il exécute à la fois, `10` par défaut ; `0` ne fixe aucune limite |
| Cache des fichiers | [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) | Quelle quantité des fichiers de job envoyés par l'application il conserve, en Mo, `1024` par défaut ; `0` n'en garde aucun |
| Délai d'arrêt | [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) | Combien de temps un RTE qui s'arrête attend ses playbooks en cours, `25` secondes par défaut |
| Fichiers de job | [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | **Transfert** : l'application envoie les fichiers d'un job avec le job. **Local** : il exécute depuis ses propres dossiers montés |

**Quelle valeur l'emporte.** Une valeur sur la page l'emporte sur la même variable définie sur le RTE. Un champ laissé vide utilise la variable propre du RTE,
sinon la valeur par défaut. Sous chaque champ, la page indique laquelle : **Remplace RTE_MAX_JOBS défini sur le RTE (3)**, ou **Vide : le RTE utilise sa
propre RTE_MAX_JOBS, 3** ; le texte indicatif montre la valeur que représente un champ vide.

**Comment ils atteignent le RTE.** Les paramètres sont stockés avec le runner dans la base de données de l'application. L'application les envoie par le socket du RTE
quand il se connecte et chaque fois qu'ils sont enregistrés, et le RTE les applique immédiatement : un cache plus petit est réduit, une nouvelle limite compte à partir du
job suivant. Le RTE ne les garde qu'en mémoire et n'écrit aucun fichier : après un redémarrage, il les reçoit à nouveau en se connectant, avant son premier job.

Un RTE en mode base de données (obsolète) n'a pas de socket : il lit ces paramètres depuis ses propres variables, et l'onglet l'indique.

---

## Tester la connexion

Les boutons en haut à droite agissent sur le runner tel qu'il est enregistré.

À côté d'**Enregistrer** se trouvent **Tester la connexion** et **Supprimer**, et dans l'onglet Identifiants **Ajouter un identifiant**, qui crée un identifiant du
type du runner et le choisit. Un jeton ou un mot de passe n'est plus jamais affiché une fois enregistré : changez-le sur l'identifiant.

**Tester la connexion** vérifie que le runner répond et accepte son jeton ou son accès, et l'indique dans un message : **Runner connection is
OK**, ou la raison de l'échec. Il n'exécute aucun job. Pour un RTE, il vérifie aussi le contrat que parle le RTE (voir
[Le contrat](../rte/images.html#the-contract)) :

| RTE | Ce que lit le test | Quand il échoue |
|---|---|---|
| Sortant ou Entrant | Qui détient son socket, tel que chaque nœud d'application l'enregistre, et ce qu'a dit le RTE à sa connexion. Il n'appelle rien | Aucun nœud d'application ne détient de socket vers lui : *the RTE '&lt;name&gt;' (outbound) is not connected: it has not dialed the app: check its APP_URL, its token and the network from the RTE to the app*, ou pour un RTE entrant, *no app node could dial it at &lt;address&gt;: check its RTE_URL, its token and the network from the app to the RTE*. Ou le RTE parle un autre contrat que le 3 |
| Base de données (obsolète) | Le `/rte/v1/health` du RTE, appelé avec son jeton | Le RTE ne répond pas à son adresse, refuse le jeton, ou parle un autre contrat que le 2 |

Le badge **Connexion** de l'onglet RTE montre le même état du socket sans test.
