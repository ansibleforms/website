---
layout: default
title: HashiCorp Vault
parent: Secret stores
nav_order: 1
translated_from: 33cbbea1ca86bf474182d220bd6824af81aa752f
---

# HashiCorp Vault
{: .no_toc }

Referenties lezen uit HashiCorp Vault, uit KV v1 of v2 of een dynamische secrets engine
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Velden van de store

Naast de [velden die elke store heeft](./#adding-a-store) heeft een HashiCorp Vault-store deze velden:

| Veld | Betekenis |
|---|---|
| Referentie | Een **HashiCorp Vault**-referentie uit [Verbindingen > Inloggegevens](../credentials.html): het adres van de Vault, de TLS-instellingen, en het token als wachtwoord, met leestoegang tot de paden die je referenties gebruiken. **Referentie toevoegen** maakt er een van dat type. AnsibleForms vernieuwt het token niet. |
| Namespace | De namespace van Vault Enterprise, verstuurd als `X-Vault-Namespace`. Getoond zodra **Vault Enterprise** is ingeschakeld, in de stap **Type**. |
| KV versie | `2` (standaard) of `1`. |
| Standaard mount | Gebruikt voor een verwijzing zonder slash, bijv. `myapp` wordt `secret/data/myapp`. |

De secret reference is het pad, bijv. `secret/myapp/prod`. Voor KV v2 wordt het segment `/data/`
ingevoegd als je het weglaat.

---

## Dynamische databasereferenties

Een verwijzing van de vorm `<mount>/creds/<role>`, bijv. `database/creds/readonly`, leest uit een
dynamische secrets engine zoals de database engine van Vault. Vault maakt dan bij elke leesactie een nieuw
databaseaccount aan, geldig zolang de lease duurt.

- Een account wordt hergebruikt gedurende 80% van zijn lease, niet de cachetijd; met cache `0` leest elke query een nieuw account.
- Vault geeft alleen een gebruiker en wachtwoord terug: zet de rest van de verbinding in de referentierij.
- De lease wordt nooit vroegtijdig ingetrokken; het account verloopt wanneer Vault de lease beëindigt.
