---
layout: default
title: Le verrou du concepteur
parent: Concepteur
nav_order: 1
translated_from: f23a01e973e287a772930e69ca9ccaa7cb463c65
---

# Le verrou du concepteur
{: .no_toc }

Une seule personne modifie à la fois
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Prendre le verrou

Le concepteur est désactivé tant que vous ne l'activez pas, avec l'interrupteur en haut à droite du concepteur. L'activer prend le
verrou : dès lors, vous êtes le seul à pouvoir enregistrer, jusqu'à ce que vous le désactiviez de nouveau.

Sans le verrou, le concepteur affiche **Le designer n'est pas actif**, et rien ne peut être modifié.

Les enregistrements ne se chevauchent jamais : depuis la 7.3.0, pendant qu'un enregistrement, un push ou un chargement est en cours, un second **Enregistrer** (un double clic, ou Ctrl+S maintenu) est
ignoré : il ne peut donc pas écrire une seconde sauvegarde ou un second commit en concurrence avec le premier.

---

## Quand quelqu'un d'autre l'a

Pendant qu'un autre utilisateur détient le verrou, le concepteur affiche **Le designer est utilisé par** cet utilisateur, et rien d'autre : ni sections,
ni fichiers.

L'interrupteur apparaît activé mais grisé, avec **Verrouillé par** et le nom de l'utilisateur à côté. Vous pouvez prendre le verrou dès qu'il
désactive le concepteur. Chaque concepteur ouvert le voit aussitôt quand le verrou est pris ou libéré, sans rechargement.

Quand deux utilisateurs activent le concepteur au même moment, l'un d'eux obtient le verrou. Depuis la 7.3.0, l'autre voit qui le détient
et chaque éditeur reste en lecture seule : rien ne peut être saisi qui ne pourrait pas être enregistré.

---

## Libérer le verrou de quelqu'un

Un admin peut libérer un verrou détenu par quelqu'un d'autre, par exemple quand cette personne est rentrée chez elle en laissant le concepteur ouvert.

**Libérer**, à côté de **Verrouillé par**, n'apparaît que pour les admins. Une confirmation est demandée d'abord : les modifications non enregistrées de l'utilisateur sont perdues.

Depuis la 7.3.0, l'utilisateur dont le verrou a été libéré en est informé, ainsi que de l'auteur : **Votre verrou du concepteur a été libéré par** le nom de l'admin,
avec **Les modifications non enregistrées ne peuvent plus être enregistrées.** Son concepteur ne reprend pas le verrou de lui-même ; il le réactive
quand il veut continuer.

---

## Un verrou oublié

Un verrou que personne n'utilise se libère tout seul : personne n'attend ainsi un concepteur que personne n'a ouvert.

Le concepteur ouvert du détenteur signale sans cesse au serveur qu'il est toujours là. Quand le serveur n'a plus de nouvelles depuis
5 minutes, parce que le navigateur a été fermé, que l'ordinateur s'est éteint ou que le réseau a disparu, le verrou est de nouveau libre. Quand
le détenteur revient au concepteur, celui-ci reprend le verrou si personne d'autre ne l'a pris. La libération par un admin est l'exception : le
verrou n'est pas repris après elle.
