---
layout: default
title: Utilitzar canals en un formulari
parent: Canals de notificació
nav_order: 5
translated_from: ab807b79469429faf3c3838f268af1ba6c29805a
---

# Utilitzar canals en un formulari
{: .no_toc }

Com nomenar canals a les notificacions i a les aprovacions
{: .fs-6 .fw-300 }

Els formularis nomenen els canals pel seu nom, a `notifications` per a l'estat i els esdeveniments de la tasca, i a `approval`:

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

- Els canals de xat i de webhook reben un missatge breu (el formulari, la tasca, què ha passat) amb un enllaç a la tasca; en una
  aprovació, la pàgina de la tasca és on s'aprova o es rebutja.
- Un canal de **correu** de la llista envia el correu habitual a `recipients` (les adreces de `notifications` d'una aprovació) a través
  d'aquest servidor en lloc del predeterminat.
- Un nom que no existeix, o un canal de xat o de webhook desactivat, s'omet i s'indica al registre.
- Un canal de **correu** desactivat no s'omet: el correu surt pel canal de correu predeterminat, i el
  registre ho indica.
