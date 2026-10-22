---
layout: default
title: Wijzigingen pullen
parent: Git-repositories
nav_order: 3
translated_from: 1246850e9b868af155c96ce8f3f5d55f0464fb6e
---

# Wijzigingen pullen
{: .no_toc }

Geplande, handmatige en API-pulls, en lokale wijzigingen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Wijzigingen pullen

Een repository wordt gepulld volgens haar schema, bij het starten, vanaf de pagina of via de API; er is geen webhook-endpoint.

| Aanleiding | Hoe |
|---|---|
| Schema | **Geplande pull inschakelen** en een **Pull-schema**, bijvoorbeeld `0 * * * *` voor elk uur |
| Start | **Pullen bij het starten van de app** kloont de repository, of pullt haar als ze al gekloond is |
| Instellingenpagina | **Pull** in het menu van de rij, of **Alles pullen** boven de lijst |
| Ontwerper | **Laden (repository)**, dat de formulierenrepositories pullt en de ontwerper opnieuw laadt; het nemen van de vergrendeling van de ontwerper pullt ook eerst elke formulierenrepository |
| API | `POST /api/v2/repository/<name>/pull` (`showSettings` of `showConnectionsSettings`) of `POST /api/v2/forms-repos/pull/<name>` (zie hieronder) |

### Pullen vanuit een pipeline of een webhook

AnsibleForms heeft geen aparte webhook-ontvanger, maar een CI-job of een webhook van een git-server kan het pull-endpoint aanroepen.

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/repository/forms/pull
```

Maak het token aan zoals beschreven in [API-tokens](../profile/api-token.html), voor een gebruiker van wie de rol `showSettings` of
`showConnectionsSettings` heeft. `/api/v2/forms-repos/pull/<name>` vereist in plaats daarvan `showDesigner` en `allowFormDesign`, met de ontwerper
ingeschakeld ([`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER)). `GET /api/v2/repository/<name>` geeft de
`head`, `status` en `output` terug, zodat een pipeline kan controleren welke commit de instantie na een pull draait.

### Lokale wijzigingen

Een pull overschrijft nooit werk dat nog niet is gepusht, dus een geplande pull controleert de working tree voordat hij draait.

Een geplande pull wordt overgeslagen zolang de working tree niet-gecommitte wijzigingen of niet-gepushte commits heeft, en zolang een ontwerper
de vergrendeling van de ontwerper heeft. Een handmatige pull van een working tree met conflicterende wijzigingen mislukt met:

```
Repository '<name>' has local changes that block the pull. Use 'Save (repository)' to push them first, or discard them.
```

Push de wijzigingen, of gooi ze weg met **Resetten** in het menu van de rij, dat de working tree verwijdert en opnieuw kloont.
