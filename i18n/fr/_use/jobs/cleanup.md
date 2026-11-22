---
layout: default
title: Nettoyage
parent: Jobs
nav_order: 6
translated_from: 3ccd056f3993f5aea914db2765e62d0d8f89d366
---

# Nettoyage
{: .no_toc }

Les jobs interrompus par un redémarrage, et la durée de conservation des jobs terminés
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Jobs abandonnés

Un job en cours est suivi par le processus AnsibleForms qui l'a démarré. Quand ce suivi s'arrête, le job est marqué
`abandoned` :

* **Au démarrage**, les jobs que ce processus suivait avant de redémarrer, et les jobs d'avant la 7 qu'aucun processus
  ne suit, sont marqués abandonnés s'ils sont encore `running` ou en cours d'arrêt ; le journal affiche `Abandoned <n> jobs`. Un job qui
  s'exécute sur un RTE n'est pas touché : il continue sans le processus qui l'a démarré.
* **Chaque minute**, la [tâche système](system-tasks.html) **Nœuds arrêtés** marque abandonnés les jobs suivis par un autre
  processus AnsibleForms (ou un RTE) qui a cessé de répondre depuis 2 minutes ; le journal affiche `Abandoned <n> jobs followed by a node that stopped answering`.
* **Chaque heure**, la tâche système **Jobs abandonnés** marque abandonnés les jobs démarrés il y a plus d'un jour, toujours
  `running` et qui n'ont écrit aucune sortie depuis un jour. Un job qui s'exécute sur un RTE est laissé tranquille ici aussi : le RTE nettoie ses propres jobs quand il redémarre.

Depuis la 7.3.0, un job de template sur AWX, AAP ou Ascender abandonné à cause d'un redémarrage ou d'un nœud arrêté est repris, s'il a démarré
dans les dernières 24 heures : un processus AnsibleForms le prend en charge, le suit de nouveau sur le runner, et le job se termine avec ce qui
s'y est réellement passé. Les jobs sur les autres runners, les playbooks, les workflows et les jobs multistep restent abandonnés.

Un playbook abandonné peut s'être exécuté en partie. Vérifiez les hôtes gérés avant de le relancer ; voir
[Un job affiche le statut abandoned](../troubleshooting.html#a-job-shows-the-status-abandoned).

---

## Conservation des jobs

Les jobs terminés sont conservés pendant le nombre de jours que l'administrateur définit dans [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS).

La tâche système nocturne **Nettoyage des jobs** (à 2 h 30) supprime les jobs terminés, avec leur sortie et leurs étapes, qui se sont
terminés il y a plus de ce nombre de jours. Elle ne supprime que les jobs au statut `success`, `failed`, `warning`, `aborted`, `rejected`
ou `abandoned` : les jobs en cours et les jobs en attente d'approbation sont conservés quel que soit leur âge. La valeur par défaut est
`90` depuis la 7.6.0 (`0` avant), et `0` conserve tous les jobs.

Ces heures sont les valeurs par défaut : depuis la 7.8.0, un admin les modifie sur la page de la tâche, sous **Jobs > Système**, et y voit
chacune de ses exécutions (voir [Tâches système](system-tasks.html)).
