---
layout: default
title: Variables d'environnement
nav_order: 8
has_children: true
has_toc: false
permalink: /customization/
translated_from: fd6e83f3550f59aa576c8addaf28bfa6115b96a0
---

# Variables d'environnement
{: .no_toc }

Configurez AnsibleForms avec des variables d'environnement
{: .fs-6 .fw-300 }

---

Pour les administrateurs qui déploient AnsibleForms : les variables d'environnement que lit le serveur, regroupées par thème.

AnsibleForms se règle avec des variables d'environnement, qu'il tourne avec Docker Compose, sur Kubernetes ou depuis les sources.

---

## D'où viennent les valeurs

Le serveur lit chaque variable depuis la première de ces sources qui la définit, si bien qu'une valeur plus haut dans la liste l'emporte toujours :

1. **L'environnement du processus** : `environment:` et `env_file:` dans docker-compose (le `.env` du projet est transmis ainsi),
   `env` et `envFrom` sur Kubernetes, ou le shell qui lance `node`.
2. **`persistent/.env`**, le fichier qu'écrivent les pages de paramètres (`data/.env` dans le projet docker-compose, un autre chemin avec
   `MANAGED_ENV_PATH`). Il est lu à chaque démarrage, en production aussi, et ne remplace jamais une variable déjà définie.
3. **`server/.env.<NODE_ENV>`**, par exemple `.env.development`. Lu uniquement quand `NODE_ENV` ne vaut pas `production` (ou avec
   `FORCE_DOTENV=1`), en pratique lors d'une exécution [depuis les sources](../installation/from-source.html) en mode développement.
4. **La valeur par défaut intégrée**, indiquée dans les tableaux de chaque groupe.

Les pages de paramètres, dans **Paramètres > Général**, affichent la valeur en vigueur et enregistrent les modifications dans `persistent/.env`. Beaucoup de variables
s'appliquent dès leur enregistrement ; les autres sont enregistrées mais nécessitent un redémarrage, et la page les liste après l'enregistrement. Une variable définie dans
l'environnement du processus ne peut pas y être modifiée : la page l'affiche comme *Définie dans l'environnement, non modifiable ici.*
Quelques variables, comme `ENCRYPTION_SECRET` et `ACCESS_TOKEN_SECRET`, ne peuvent jamais être modifiées depuis la page.

Les variables que lit un RTE, comme `AF_ROLE`, `RTE_MODE`, `APP_URL` ou `RTE_MAX_JOBS`, ne figurent pas du tout sur les pages de paramètres :
l'application ne les utilise pas, définissez-les donc dans l'environnement où tourne le RTE. Les variables `RTE_*` que lit l'application elle-même,
`RTE_QUEUE_MINUTES` et `RTE_FILES_MAX_MB`, font exception et restent sur les pages. Quatre variables de RTE, `RTE_MAX_JOBS`,
`RTE_CACHE_MB`, `RTE_FILES` et `RTE_DRAIN_SECONDS`, peuvent à la place être définies par RTE sur sa page de runner, où une valeur l'emporte sur la
variable (voir [Les paramètres d'un RTE](../runners/runner-page.html#an-rtes-settings)).

Avec [`ALLOW_ENV_EDIT`](configuration.html#env_ALLOW_ENV_EDIT)`=0`, les pages ne font qu'afficher les valeurs et l'enregistrement est refusé. Utilisez-le
quand l'environnement est déclaré dans un manifeste, comme décrit dans [Modification et audit](../seed/environment-and-audit.html).

Le [seed de configuration](../seed/) ne définit aucune variable d'environnement. Il déclare des objets qui sont stockés dans la base de données, et les
références `${ENV_VAR}` qu'il contient sont résolues depuis l'environnement du serveur en cours d'exécution.

Quelques variables ne sont lues que depuis l'environnement et ne figurent pas dans les tableaux : `MANAGED_ENV_PATH` et `FORCE_DOTENV`, décrites
plus haut, et les variables de proxy système `HTTPS_PROXY` et `NO_PROXY` (lues aussi en minuscules). Un RTE sortant joint l'application via
`HTTPS_PROXY`, et un RTE entrant y fait passer son appel d'enregistrement, sauf si l'hôte de l'application figure dans `NO_PROXY` (noms d'hôte,
suffixes `.domain`, ou `*` pour tous les hôtes).

Les variables marquées <span class="af-badge af-badge-secret">Secret</span> contiennent un mot de passe, un jeton ou une clé : gardez-les hors du contrôle
de version, par exemple dans un Secret Kubernetes ou un fichier `.env` qui n'est pas commité.

---

## Dans cette section

Les variables sont regroupées par thème, avec une page par groupe :

| Page | Ce qu'elle couvre |
|---|---|
{% for g in site.data.env_groups %}| [{{ g.title }}]({{ g.slug }}.html) | {{ g.lead | slice: 0 | upcase }}{{ g.lead | slice: 1, 500 }} |
{% endfor %}
{% capture other %}{% include env_vars_table.html rest=true %}{% endcapture %}
{% if other contains "<tr>" %}
---

## Autres variables

Les variables suivantes ne sont pas encore affectées à un groupe :

{{ other }}
{% endif %}
