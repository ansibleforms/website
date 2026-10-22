---
layout: default
title: API REST
nav_order: 3
has_children: true
has_toc: false
permalink: /api/
translated_from: e14092fbd301073c7ed9be6839530efae43d4c6b
---

# API REST
{: .no_toc }

Lancer des formulaires et gérer AnsibleForms depuis des scripts
{: .fs-6 .fw-300 }

---

Pour les développeurs et les ingénieurs en automatisation : lancer des formulaires et gérer AnsibleForms depuis des scripts.

Tout ce que fait l'interface web passe par l'API REST, les scripts et les autres outils peuvent donc faire de même.

---

## Vue d'ensemble

L'API est servie sous `/api/v2` sur le serveur AnsibleForms :

* **Référence complète** : ces pages couvrent ce que les scripts utilisent le plus. Chaque endpoint est décrit, et peut être essayé, sur la
  page Swagger intégrée du serveur, `https://<your server>/api/v2/docs`.
* **Permissions** : un appel s'exécute sous l'utilisateur dont il porte le jeton, avec les rôles de cet utilisateur, comme dans le navigateur.
* **Validation au lancement** : les jobs lancés via l'API peuvent être vérifiés comme les lancements depuis le navigateur
  (voir [Validation au lancement](../launch-validation/)).
* **Limites de débit** : seuls les endpoints de connexion, de déconnexion, de rafraîchissement du jeton et d'authentification unique, le changement de mot de passe
  (`PUT /api/v2/profile`) et les endpoints des jetons d'API (`POST` et `DELETE /api/v2/profile/tokens`) sont limités (voir
  [Authentification](authentication.html)). Les autres appels n'ont pas de limite de débit (l'[assistant de chat](../chat/) a ses propres
  limites), un script doit donc modérer son rythme lui-même, par exemple quand il suit un job.

---

## Dans cette section

Chaque sujet a sa propre page :

| Page | Ce qu'elle couvre |
|---|---|
| [Authentification](authentication.html) | Se connecter, rafraîchir le jeton, ou utiliser un jeton de longue durée |
| [Jobs](jobs.html) | Lancer un formulaire, suivre le job, l'interrompre, le relancer ou l'approuver |
| [Réponses et erreurs](responses.html) | La forme d'une réponse, et les codes de statut |
| [Événements en direct](events.html) | Être prévenu quand les jobs et les paramètres changent, au lieu d'interroger en boucle |
