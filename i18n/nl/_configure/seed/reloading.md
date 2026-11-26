---
layout: default
title: Herladen en opstarten
parent: Configuratie-seed
nav_order: 3
translated_from: 6cb646436cb2361c1ad2402e0d57b5b56c934630
---

# Herladen en opstarten
{: .no_toc }

Het bestand wijzigen zonder herstart, en wat er bij het opstarten gebeurt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Het bestand wijzigen zonder herstart

De seed wordt opnieuw gelezen door de systeemtaak **Config seed herladen**, standaard elke minuut, en
opnieuw toegepast als de inhoud is gewijzigd. Een wijziging die in git is gecommit, bereikt daardoor automatisch een
draaiende instantie: op Kubernetes wordt een `ConfigMap` binnen ongeveer een minuut opnieuw onder de pod gekoppeld,
en de volgende controle pikt hem op. Er is geen rollout en geen herstart, en geen
hook hoeft iets aan te roepen.

Sinds 7.8.0 is het tijdstip een cron van 5 velden in `CONFIG_SEED_RELOAD_CRON` (standaard `* * * * *`), in te stellen op de eigen pagina
van de taak onder **Taken > Systeem** (zie [Jobs](../jobs/)) of in de omgeving. Zonder `CONFIG_SEED_PATH` staat de taak uit.

`CONFIG_SEED_RELOAD_SECONDS`, de instelling van voorheen, is sinds 7.8.0 verouderd en wordt in 8 verwijderd. Ze wordt nog gelezen zolang
`CONFIG_SEED_RELOAD_CRON` niet is ingesteld, met een waarschuwing in het log bij het opstarten: `60` geldt als `* * * * *`, een veelvoud
van 60 tot 3600 als elke zoveel minuten, en `0` schakelt het herladen nog steeds uit. Stel in plaats daarvan `CONFIG_SEED_RELOAD_CRON` in.

Voor een ongewijzigd bestand berekent de controle één hash en stopt, dus ze herschrijft nooit een rij die ze al
heeft toegepast.

Om het bestand meteen toe te passen in plaats van op de volgende controle te wachten, gebruik je een van deze:

```
POST /api/v2/config-seed/apply     # settings admin ; answers with what it did
kill -HUP 1                        # inside the container, no credentials needed
```

Beide **forceren** een toepassing, ook als het bestand niet is gewijzigd. Een geforceerde toepassing herstelt een
beheerd record dat rechtstreeks in de database is bewerkt, en kloont een gedeclareerde repository opnieuw
waarvan de werkboom ontbreekt.

{: .note }
> Een herlaadbeurt is **nooit fataal**, in tegenstelling tot de toepassing bij het opstarten. Een instantie die al
> draait, behoudt haar huidige configuratie, de reden wordt gelogd, en de rij *Configuratie-seed*
> op de pagina Status wordt rood en noemt de reden. Een typfout die naar git is gepusht, mag een draaiende instantie
> niet kunnen platleggen zonder dat een beheerder iets doet.
>
> Dezelfde kapotte inhoud wordt ook niet bij elke controle opnieuw geprobeerd; anders zou één slechte wijziging
> eindeloos dezelfde fout in het log schrijven. Herstel het bestand, of roep het endpoint aan om het
> meteen opnieuw te proberen.

---

## Een kapotte seed weigert te starten

Een onleesbaar bestand, ongeldige YAML, een onbekend veld, een dubbele naam of een niet-opgeloste
`${VARIABLE}` laat de server **afsluiten** in plaats van starten. Dit geldt alleen voor het **opstart**pad:
zie de opmerking hierboven voor wat hetzelfde bestand doet met een instantie die al draait.

Dit is bewust. Doorgaan met de vorige configuratie zou een instantie opleveren waarvan het
gedrag niet meer overeenkomt met het manifest dat haar zou moeten beschrijven, zonder dat iets
het verschil meldt. De reden wordt naar standard error en naar het logbestand geschreven, zodat
`kubectl logs` en `docker logs` hem tonen.

De validatie is streng: onbekende velden worden geweigerd in plaats van genegeerd, en de fout noemt
de foute sleutel:

```
Config seed failed, refusing to start: Seed file validation failed: /awx/items/0 must NOT have additional properties 'tokenn'
```

---

## Een lege database richt zichzelf in

Met `ALLOW_SCHEMA_CREATION` aan (de standaard) krijgt een database die **helemaal geen
AnsibleForms-tabellen** bevat bij het opstarten haar schema. Een nieuwe uitrol start daardoor
zonder dat iemand het endpoint `/schema` met de hand hoeft aan te roepen.

De voorwaarde is bewust streng: het aanmaken van het schema **verwijdert eerst elke tabel**, dus
het draait alleen tegen een database die helemaal leeg is. Een database waarin één kolom ontbreekt, of
die tabellen maar geen gebruikersaccounts heeft, is *niet* leeg en blijft onaangeroerd;
de schemapatches handelen die gevallen af.
