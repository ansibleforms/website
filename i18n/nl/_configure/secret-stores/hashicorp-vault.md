---
layout: default
title: HashiCorp Vault
parent: Secret stores
nav_order: 1
translated_from: 1134189481b234cb2b18edbabd74427e37d2f43c
---

# HashiCorp Vault
{: .no_toc }

Referenties lezen en schrijven in HashiCorp Vault KV, dynamische geheimen lezen
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

## Referenties schrijven

Vanaf 7.6.0 kunnen gebruiker en wachtwoord van een referentie bij **Opslaan** naar de Vault worden geschreven (zie [Referenties schrijven](./#writing-credentials)).

Zet **Schrijven toestaan** aan in de **Opties** van de kluis, en geef aan waar ze mag schrijven:

| Veld | Betekenis |
|---|---|
| Schrijven toestaan | Laat een referentie bij **Opslaan** haar gebruiker en wachtwoord naar deze kluis schrijven. Standaard uit. |
| Schrijfprefix | Het pad waarop of waaronder referenties worden geschreven, bv. `secret/ansibleforms`. Alleen een mount, bv. `secret`, staat de hele mount toe. Verplicht als schrijven aan staat. |

Het geheim wordt geschreven als `username` en `password`, in KV v2 of v1 zoals de **KV-versie** van de kluis aangeeft. Het token heeft de rechten
read, create en update onder het prefix nodig; read controleert of er al een geheim staat. Voor KV v2 en het prefix `secret/ansibleforms`:

```hcl
path "secret/data/ansibleforms/*" {
  capabilities = ["read", "create", "update"]
}
```

Het pad van een engine voor dynamische geheimen, bv. `database/creds/readonly`, wordt nooit beschreven: Vault maakt die referenties zelf.

---

## Dynamische databasereferenties

Een verwijzing van de vorm `<mount>/creds/<role>`, bijv. `database/creds/readonly`, leest uit een
dynamische secrets engine zoals de database engine van Vault. Vault maakt dan bij elke leesactie een nieuw
databaseaccount aan, geldig zolang de lease duurt.

- Een account wordt hergebruikt gedurende 80% van zijn lease, niet de cachetijd; met cache `0` leest elke query een nieuw account.
- Vault geeft alleen een gebruiker en wachtwoord terug: zet de rest van de verbinding in de referentierij.
- De lease wordt nooit vroegtijdig ingetrokken; het account verloopt wanneer Vault de lease beëindigt.
