---
layout: default
title: Kanalen in een formulier gebruiken
parent: Meldingskanalen
nav_order: 5
translated_from: ab807b79469429faf3c3838f268af1ba6c29805a
---

# Kanalen in een formulier gebruiken
{: .no_toc }

Kanalen noemen in meldingen en goedkeuringen
{: .fs-6 .fw-300 }

Formulieren noemen kanalen bij hun naam, in `notifications` voor jobstatus en jobevents, en in `approval`:

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

- De chat- en webhookkanalen krijgen een kort bericht (het formulier, de job, wat er gebeurde) met een link naar de job; bij een
  goedkeuring is de pagina van de job de plek waar die wordt goedgekeurd of afgewezen.
- Een **mail**kanaal in de lijst verstuurt de gebruikelijke mail naar `recipients` (de `notifications`-adressen van een goedkeuring) via
  die server in plaats van de standaardserver.
- Een naam die niet bestaat, of een chat- of webhookkanaal dat is uitgeschakeld, wordt overgeslagen en in het log vermeld.
- Een **mail**kanaal dat is uitgeschakeld, wordt niet overgeslagen: de mail gaat in plaats daarvan via het standaardmailkanaal, en het
  log vermeldt dat.
