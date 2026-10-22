---
layout: default
title: Utiliser les canaux dans un formulaire
parent: Canaux de notification
nav_order: 5
translated_from: ab807b79469429faf3c3838f268af1ba6c29805a
---

# Utiliser les canaux dans un formulaire
{: .no_toc }

Nommer des canaux dans les notifications et les approbations
{: .fs-6 .fw-300 }

Les formulaires nomment les canaux par leur nom, dans `notifications` pour le statut et les événements du job, et dans `approval` :

```yaml
notifications:
  recipients:
    - ops@example.com
  channels:
    - ops-slack
    - ops-teams
  onStatus:
    - failed

approval:
  title: Remove host $(vm.name) ?
  roles:
    - approvers
  channels:
    - approvers-teams
```

- Les canaux de chat et de webhook reçoivent un court message (le formulaire, le job, ce qui s'est passé) avec un lien vers le job ; pour une
  approbation, c'est sur la page du job qu'elle est approuvée ou rejetée.
- Un canal **mail** dans la liste envoie le mail habituel aux `recipients` (les adresses des `notifications` d'une approbation) via
  ce serveur au lieu de celui par défaut.
- Un nom qui n'existe pas, ou un canal de chat ou de webhook désactivé, est ignoré et signalé dans le journal.
- Un canal **mail** désactivé n'est pas ignoré : le mail passe à la place par le canal mail par défaut, et le
  journal l'indique.
