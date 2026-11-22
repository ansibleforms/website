---
layout: default
title: Beheerde objecten
parent: Configuratie-seed
nav_order: 2
translated_from: b007fcc08a96c4035422a238ae335bf4eedd48c5
---

# Beheerde objecten
{: .no_toc }

Hoe de seed eigenaar is van de objecten die hij noemt, en hoe hij geheimen buiten houdt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Secties van één rij zijn alles of niets

`ldap`, `settings` en `chat_assistant` (`chat` vóór 7.8.0) zijn elk **één rij**, dus de seed moet al hun velden declareren.

Een seed die een veld weglaat, weigert te starten en noemt het veld:

```
Config seed failed, refusing to start: Seed file validation failed: /settings must have required property 'url'
```

Declareer een lege waarde expliciet met `""` of `false`. Een paar velden zijn optioneel, en een optioneel veld dat wordt weggelaten, blijft ongewijzigd:

| Sectie | Optionele velden |
|---|---|
| `ldap` | `description`, `credential` (een referentie om mee te binden) en `groupfilter` |
| `chat_assistant` | `auth_type`, `api_version`, `request_user`, `ignore_certs`, `extra_headers`, en `credential` sinds 7.8.0 |
| `settings` | De `mail_*`-sleutels, sinds 7.6.0 verouderd (zie [Voorbeeld](example.html)) |

`settings` dekt alleen de URL, en de verouderde mailsleutels; alle andere instellingen blijven bewerkbaar.

---

## Het bestand bevat geen geheimen

Elke `${VARIABLE}` wordt vervangen door die omgevingsvariabele (op Kubernetes uit een `Secret`), zodat het bestand in Git kan staan.

Een variabele die niet is ingesteld, is een **fatale fout**, zodat een placeholder nooit als wachtwoord kan worden opgeslagen.

Referenties kunnen ook een [secret store](../secret-stores) gebruiken (`secret_store`, `secret_ref`); `vault_path` verdwijnt in 8.

---

## Beheerde objecten

Een object van de lijstsecties (`runners`, `secret_stores`, `credentials`, `databases`, `sso`, `repositories`, `syslog`,
`notifications` en `labels`) of van een sectie van één rij dat uit de seed komt, wordt gemarkeerd als **beheerd**:

- Het wordt bij **elke** start afgedwongen, zodat het bestand leidend blijft.
- Het is alleen-lezen: de API antwoordt met **403**, de interface schakelt Bewerken en Verwijderen uit, en de eigen pagina zegt dat het uit het
  configuratie-seedbestand komt en alleen-lezen is.
- Alleen de seed kan de markering zetten of wissen.

Objecten die met de hand zijn aangemaakt, worden **nooit aangeraakt**, tenzij de seed dezelfde naam declareert. Dat record wordt dan **overgenomen**:
de gedeclareerde velden worden afgedwongen en het wordt alleen-lezen. Overname wordt gelogd als waarschuwing en in het audittrail.

Het toepassen van de seed is idempotent: records die al overeenkomen, blijven ongemoeid, dus een herstart meldt normaal `0 updated`.

Een gedeclareerde repository waarvan de werkboom ontbreekt, wordt bij elke start **opnieuw gekloond**, zodat een mislukte eerste kloon
opnieuw wordt geprobeerd. De rij *Repositories* van de pagina Status toont elke repository zonder werkboom.

Sinds 7.8.0 kan een [git-repository](../repositories/) dezelfde soorten objecten bevatten. Een object dat een repository bevat, blijft van de
repository: het item van de seed ervoor wordt niet toegepast, en het serverlog meldt dat. Een repository die de seed declareert, blijft van de seed.

### Een object verwijderen

Een object uit het bestand verwijderen **geeft het vrij**: het record blijft bestaan en wordt weer bewerkbaar. Een hele sectie verwijderen
doet hetzelfde.

Voeg `prune: true` toe aan een lijstsectie om de beheerde records te **verwijderen** die het bestand niet meer declareert:

```yaml
credentials:
  prune: true
  items:
    - name: production-db
      # anything else the seed used to manage is deleted
```

`prune` verwijdert nooit een record dat met de hand is aangemaakt.

### De seed uitschakelen

Het verwijderen van `CONFIG_SEED_PATH` schakelt de seed uit: de volgende start geeft elk record en veld vrij dat de seed beheerde, zoals een
toegepaste lege seed zou doen. De records behouden hun waarden en worden weer bewerkbaar, en het serverlog en het auditlogboek melden wat is vrijgegeven.

Een `CONFIG_SEED_PATH` waarvan het bestand ontbreekt, geeft niets vrij: de server weigert dan te starten, omdat een gekoppeld bestand misschien
alleen wat laat is.

---

## Instellingen die de seed declareert

De seed is op twee manieren minder strikt eigenaar van de secties die in 7.8.0 zijn toegevoegd dan van de beheerde objecten.

| Secties | Hoe de seed eigenaar is |
|---|---|
| `defaults`, `logo`, `icon`, `name`, `links`, `mcp` | Veld per veld: elk gedeclareerd veld is alleen-lezen op zijn pagina, met een melding, en de API weigert het te wijzigen (403) |
| `users`, `groups`, `announcements`, `disclaimer`, `ssh` | Bij elke toepassing aangemaakt of gewijzigd, nooit vergrendeld of verwijderd |

Een veld van `defaults`, `logo`, `icon`, `name`, `links` of `mcp` dat de seed niet meer declareert, wordt vrijgegeven, en ze worden allemaal
vrijgegeven als de seed wordt uitgeschakeld. Een logo of pictogram uit de seed kan in de app niet worden geüpload of verwijderd. Als een repository
dezelfde pagina bevat, houdt de seed de velden die hij declareert en bevat de repository de andere.

Een gebruiker, een groep, een aankondiging, een disclaimerversie of de SSH-sleutel en known hosts uit de seed blijven bewerkbaar in de app, en de
volgende toepassing schrijft de waarden van de seed opnieuw waar ze verschillen. Een item uit het bestand verwijderen laat het in de app staan, en
`prune` verwijdert er geen van.
