---
layout: default
title: Beheerde objecten
parent: Configuratie-seed
nav_order: 2
translated_from: dd0ea4d46391bf9b2e5928063cd30e33ac1285f9
---

# Beheerde objecten
{: .no_toc }

Hoe de seed eigenaar is van de objecten die hij noemt, en hoe hij geheimen buiten houdt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Secties van één rij zijn alles of niets

`ldap`, `settings` en `chat` zijn elk **één rij**, dus de seed moet al hun velden declareren; de andere secties zijn lijsten.

Een seed die een veld weglaat, weigert te starten en noemt het veld:

```
Config seed failed, refusing to start: Seed file validation failed: /settings must have required property 'mail_server'
```

Declareer een lege waarde expliciet met `""` of `false`. Een paar velden zijn optioneel, en een optioneel veld dat wordt weggelaten, blijft ongewijzigd:

| Sectie | Optionele velden |
|---|---|
| `ldap` | `description`, `credential` (een referentie om mee te binden) en `groupfilter` |
| `chat` | `auth_type`, `api_version`, `request_user`, `ignore_certs` en `extra_headers` |
| `settings` | Geen |

`settings` dekt alleen de mailvelden en de URL; alle andere instellingen blijven bewerkbaar.

---

## Het bestand bevat geen geheimen

Elke `${VARIABLE}` wordt vervangen door die omgevingsvariabele (op Kubernetes uit een `Secret`), zodat het bestand in Git kan staan.

Een variabele die niet is ingesteld, is een **fatale fout**, zodat een placeholder nooit als wachtwoord kan worden opgeslagen.

Referenties kunnen ook een [secret store](../secret-stores) gebruiken (`secret_store`, `secret_ref`); `vault_path` verdwijnt in 8.

---

## Beheerde objecten

Een object dat uit de seed komt, wordt gemarkeerd als **beheerd**:

- Het wordt bij **elke** start afgedwongen, zodat het bestand leidend blijft.
- Het is alleen-lezen: de API antwoordt met **403**, de interface schakelt Bewerken en Verwijderen uit, en de eigen pagina zegt dat het uit het
  configuratie-seedbestand komt en alleen-lezen is.
- Alleen de seed kan de markering zetten of wissen.

Objecten die met de hand zijn aangemaakt, worden **nooit aangeraakt**, tenzij de seed dezelfde naam declareert. Dat record wordt dan **overgenomen**:
de gedeclareerde velden worden afgedwongen en het wordt alleen-lezen. Overname wordt gelogd als waarschuwing en in het audittrail.

Het toepassen van de seed is idempotent: records die al overeenkomen, blijven ongemoeid, dus een herstart meldt normaal `0 updated`.

Een gedeclareerde repository waarvan de werkboom ontbreekt, wordt bij elke start **opnieuw gekloond**, zodat een mislukte eerste kloon
opnieuw wordt geprobeerd. De rij *Repositories* van de pagina Status toont elke repository zonder werkboom.

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

Het verwijderen van `CONFIG_SEED_PATH` geeft **niets** vrij: de seed wordt niet meer toegepast, en de records die hij beheerde blijven beheerd
en alleen-lezen. Om ze weer te bewerken, geef je ze eerst vrij: laat `CONFIG_SEED_PATH` naar een bestand zonder die records wijzen (een leeg bestand declareert
niets en geeft elk record vrij), laat het toepassen bij een start of een herlaadbeurt, en verwijder dan de variabele. De vrijgegeven records blijven zoals ze
zijn, en worden bewerkbaar.
