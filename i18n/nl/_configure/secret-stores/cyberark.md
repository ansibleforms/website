---
layout: default
title: CyberArk
parent: Secret stores
nav_order: 2
translated_from: 2c82742312515c87bc1c83fea368929c0a32bfb3
---

# CyberArk
{: .no_toc }

Referenties lezen via de CyberArk CCP, schrijven via de PVWA
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

## Referenties schrijven

Vanaf 7.6.0 kunnen gebruiker en wachtwoord van een referentie bij **Opslaan** naar CyberArk worden geschreven (zie [Referenties schrijven](./#writing-credentials)).
De CCP leest alleen, dus AnsibleForms schrijft via de REST-API van de PVWA, aangemeld met een eigen referentie.

Zet **Schrijven toestaan** aan in de **Opties** van de kluis en vul in:

| Veld | Betekenis |
|---|---|
| Schrijven toestaan | Laat een referentie bij **Opslaan** haar gebruiker en wachtwoord naar deze kluis schrijven. Standaard uit. |
| Kluizen om naar te schrijven | De safes waarnaar referenties mogen worden geschreven, gescheiden door komma's, bv. `Linux, DB`. Verplicht als schrijven aan staat. |
| PVWA-adres | De basis-URL van de PVWA, bv. `https://pvwa.example.com`. Verplicht. |
| PVWA-referentie | Een eigen referentie van het type **Gebruiker en wachtwoord** of **API**, nooit uit een geheimenkluis gelezen, die accounts aan die safes mag toevoegen en hun wachtwoorden mag wijzigen. Verplicht. |
| Aanmeldmethode | Hoe de PVWA-referentie zich aanmeldt: CyberArk (standaard), LDAP, RADIUS of Windows. |
| Platform-ID | Het platform van de accounts die ze toevoegt, bv. `UnixSSH`. Nodig om een nieuw account toe te voegen. |

De referentie noemt het account zoals bij lezen, `Safe=Linux;Object=srv01-root`, met `Address=srv01.example.com` als het platform er een nodig heeft.

- Een nieuw account wordt aan de safe toegevoegd met het platform, de gebruikersnaam en het wachtwoord.
- Een bestaand account wordt alleen gewijzigd als **Een bestaand geheim overschrijven** is aangevinkt: eerst de gebruikersnaam, dan het wachtwoord.
- De PVWA-sessie wordt na elke schrijfactie afgemeld. De OAuth-aanmelding van Privilege Cloud wordt niet ondersteund.

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
