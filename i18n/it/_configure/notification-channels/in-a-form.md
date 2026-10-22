---
layout: default
title: Usare i canali in un modulo
parent: Canali di notifica
nav_order: 5
translated_from: ab807b79469429faf3c3838f268af1ba6c29805a
---

# Usare i canali in un modulo
{: .no_toc }

Indicare i canali nelle notifiche e nelle approvazioni
{: .fs-6 .fw-300 }

I moduli indicano i canali con il loro nome, in `notifications` per lo stato e gli eventi dei job, e in `approval`:

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

- I canali di chat e webhook ricevono un messaggio breve (il modulo, il job, cosa è successo) con un collegamento al job; per
  un'approvazione, la pagina del job è dove la si approva o la si rifiuta.
- Un canale **mail** nella lista invia la solita mail ai `recipients` (gli indirizzi delle `notifications` di un'approvazione) tramite
  quel server invece di quello predefinito.
- Un nome che non esiste, o un canale di chat o webhook disattivato, viene saltato e segnalato nel log.
- Un canale **mail** disattivato non viene saltato: la mail passa invece dal canale mail predefinito, e il
  log lo segnala.
