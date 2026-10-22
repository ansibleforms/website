---
layout: default
title: Kanäle in einem Formular verwenden
parent: Benachrichtigungskanäle
nav_order: 5
translated_from: ab807b79469429faf3c3838f268af1ba6c29805a
---

# Kanäle in einem Formular verwenden
{: .no_toc }

Kanäle in Benachrichtigungen und Genehmigungen nennen
{: .fs-6 .fw-300 }

Formulare nennen Kanäle über ihren Namen, in `notifications` für Jobstatus und Job-Ereignisse und in `approval`:

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

- Die Chat- und Webhook-Kanäle erhalten eine kurze Nachricht (das Formular, der Job, was passiert ist) mit einem Link zum Job; bei einer
  Genehmigung ist die Seite des Jobs der Ort, an dem genehmigt oder abgelehnt wird.
- Ein **Mail**-Kanal in der Liste sendet die übliche Mail an `recipients` (die `notifications`-Adressen einer Genehmigung) über
  diesen Server statt über den Standardserver.
- Ein Name, der nicht existiert, oder ein ausgeschalteter Chat- oder Webhook-Kanal wird übersprungen, und das Protokoll vermerkt es.
- Ein ausgeschalteter **Mail**-Kanal wird nicht übersprungen: Die Mail geht stattdessen über den Standard-Mail-Kanal, und das
  Protokoll vermerkt es.
