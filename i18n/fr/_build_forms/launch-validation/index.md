---
layout: default
title: Validation au lancement
nav_order: 4
has_children: true
has_toc: false
permalink: /launch-validation/
translated_from: 6b86704480781edc0ab1c24c25993fc2e220abf3
---

# Validation au lancement
{: .no_toc }

Vérifier chaque lancement d'un formulaire sur le serveur
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pour les administrateurs et les auteurs de formulaires : faites vérifier par le serveur chaque lancement, ses règles et ses extravars, quel que soit son expéditeur.

La vérification s'applique quel que soit qui ou ce qui lance le formulaire : le navigateur, un script qui appelle l'API REST,
ou un agent IA via le serveur MCP.

---

## Pourquoi elle existe

Les règles d'un formulaire (`required`, `regex`, `minValue`, `sameAs`, ...) ont toujours été vérifiées
dans le navigateur. Le navigateur envoie ensuite deux choses à `POST /api/v2/job` :

- `rawFormData` : les valeurs des champs telles que l'utilisateur les a saisies ;
- `extravars` : ce que reçoit le playbook, construit à partir de ces valeurs dans le navigateur.

Sans validation au lancement, le serveur fait confiance aux deux. N'importe qui disposant d'un jeton valide peut appeler ce
point de terminaison directement et envoyer n'importe quelles extravars, sans qu'aucune regex, aucun champ obligatoire ni aucune règle de liste
ne s'applique. Pour un formulaire utilisé uniquement dans le navigateur, cela peut être acceptable ; pour un
formulaire que d'autres systèmes lancent via REST, cela signifie que les règles du formulaire ne sont pas du tout appliquées.

Le serveur n'a pas non plus de moyen de distinguer une requête du navigateur d'une requête envoyée par un
script : les deux utilisent le même point de terminaison, le même jeton et le même corps, et les utilisateurs peuvent modifier
toute requête que leur propre navigateur envoie. Une vérification n'est fiable que sur le serveur, et la validation au lancement
est cette vérification.

---

## Les trois points d'entrée

La manière dont un lancement est validé dépend de son origine et du mode de validation au lancement :

| Lancé par | Validé | Extravars avec lesquelles le job s'exécute |
|---|---|---|
| **Serveur MCP** (agent IA) | toujours, sur le serveur | toujours construites par le serveur |
| **Navigateur** ou **API REST**, validation au lancement `off` | uniquement dans le navigateur | celles envoyées par le navigateur (ou l'appelant) |
| **Navigateur** ou **API REST**, validation au lancement `log` | sur le serveur, refus seulement journalisés | celles envoyées ; différences journalisées |
| **Navigateur** ou **API REST**, validation au lancement `enforce` | sur le serveur, refusé s'il est invalide | **construites par le serveur** |

Le navigateur, le serveur MCP et la validation au lancement utilisent le même code pour les règles (le
moteur de formulaire partagé) : les mêmes règles, dans le même ordre, avec les mêmes messages. Une erreur affichée
par le navigateur est refusée par le serveur avec le même texte.

---

## Dans cette section

Chaque sujet a sa propre page :

| Page | Contenu |
|---|---|
| [L'activer](switching-it-on.html) | Pour toute l'instance, ou pour un seul formulaire |
| [Log et enforce](log-and-enforce.html) | Ce que fait chaque mode d'un lancement qui enfreint les règles |
| [Lignes de liste](list-rows-and-subforms.html) | Comment les lignes des champs list sont validées |
| [Envois de fichiers](file-uploads.html) | Comment les champs fichier sont validés |
| [Mots de passe](passwords.html) | Comment les champs mot de passe sont validés et tenus à l'écart des API |
| [Relancer](relaunching.html) | Comment un job relancé est validé |
| [Déploiement](rolling-it-out.html) | Faire passer une instance en enforce, et les limitations connues |
