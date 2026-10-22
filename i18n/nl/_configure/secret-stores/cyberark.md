---
layout: default
title: CyberArk
parent: Secret stores
nav_order: 2
translated_from: f001addbd5578169444a321ab9e668e54139842b
---

# CyberArk
{: .no_toc }

Referenties lezen uit de CyberArk Central Credential Provider (CCP)
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

{: .warning }
> **Experimenteel.** Nog niet getest tegen een draaiende CyberArk-installatie; meld je bevindingen.

De CCP is de REST-interface van de Application Access Manager van CyberArk.

---

## Velden van de store

Naast de [velden die elke store heeft](./#adding-a-store) heeft een CyberArk-store deze velden:

| Veld | Betekenis |
|---|---|
| Referentie | Een **CyberArk**-referentie uit [Verbindingen > Inloggegevens](../credentials.html): de basis-URL van de CCP, bijv. `https://ccp.example.com` (`/AIMWebService/api/Accounts` wordt toegevoegd), de TLS-instellingen, de AppID (de applicatie die voor AnsibleForms in CyberArk is gedefinieerd), en een clientcertificaat en -sleutel in PEM, alleen als de AppID die vereist. |

---

## Secret reference

De secret reference identificeert het account als door `;` gescheiden sleutel-waardeparen:

```
Safe=Linux;Object=root-srv01
Safe=DB;UserName=forms;Address=db01.example.com
Query=Safe=Linux;Folder=Root;Object=root-srv01
```

- Toegestane sleutels: `Safe`, `Folder`, `Object`, `UserName`, `Address`, `Database`, `PolicyID`,
  `Reason`, `Query`, `QueryFormat`, `ConnectionTimeout`, `FailRequestOnPasswordChange`.
- `Query=` geeft de rest van de verwijzing door als een native CCP-query, met `QueryFormat=Exact`
  tenzij je het anders instelt.
- Een `AppID` in de verwijzing wordt genegeerd: de AppID van de store wordt altijd gebruikt.
- Het wachtwoord van het account (`Content`) wordt het wachtwoord; `UserName`, `Address`, `Port` en
  `Database` vullen gebruiker, host, poort en databasenaam in.

---

## Extra opties

De extra opties van de store worden ingesteld als JSON-object:

| Sleutel | Betekenis |
|---|---|
| `reason` | Verstuurd als `Reason` als de verwijzing er geen heeft, voor de audit van CyberArk. |
| `check_ref` | Een verwijzing die **Verbinding testen** echt leest. Zonder deze sleutel controleert de test alleen of de CCP antwoordt en de AppID accepteert. |
| `timeout_ms` | Time-out van het verzoek, standaard 10000. |

Bijvoorbeeld, om een reden mee te sturen en **Verbinding testen** een testaccount te laten lezen:

```json
{ "reason": "AnsibleForms", "check_ref": "Safe=Test;Object=ansibleforms-probe" }
```
