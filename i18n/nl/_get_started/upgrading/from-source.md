---
layout: default
title: Vanuit de broncode
parent: Upgraden
nav_order: 3
translated_from: f01384ded41bf8e1913196bb78e7ea1a6532989c
---

# Vanuit de broncode
{: .no_toc }

Upgrade een installatie die vanuit de broncode is gebouwd
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Een installatie die vanuit de broncode is gebouwd, upgrade je door de nieuwe release uit te checken, opnieuw te bouwen en de
applicatie te herstarten. Je instellingen, formulieren, playbooks, certificaten en logs staan in `server/persistent`, dat Git en de
build niet wijzigen.

---

## Voordat je upgradet

Bereid de upgrade zo voor dat je terug kunt als er iets misgaat:

* **Maak een back-up** onder **Instellingen → Back-ups**. De nieuwe release upgradet het databaseschema bij de eerste start.
* **Lees de [changelog](../changelog)** voor de releases tussen je versie en de nieuwe.
* **Ga je naar een nieuwe hoofdversie?** Volg eerst [Upgraden naar v7](../upgrade-7.html).
* **Controleer welke Node.js-versie** de nieuwe release vereist, in de changelog.

---

## 1. Haal de nieuwe release op

Haal de release-tags op en check de gewenste release uit. Release-tags dragen het versienummer, en `git tag` toont
ze; de branch `main` kan wijzigingen bevatten die nog niet zijn uitgebracht:

```bash
cd /srv/apps/ansibleforms
git fetch --tags
git checkout <version>
```

---

## 2. Opnieuw bouwen

Bouw opnieuw in dezelfde drie stappen als bij de installatie. Bouw eerst de client opnieuw:

```bash
cd client
npm ci
npm run build
```

Werk daarna de afhankelijkheden van de server bij:

```bash
cd ../server
npm ci --omit=dev
```

Kopieer tot slot de opnieuw gebouwde client weer naar de map `views` van de server:

```bash
rm -rf views
mkdir views
cp -r ../client/dist/. views/
```

Vergelijk `.env.example`, in de root van de repository, met je `persistent/.env` om instellingen over te nemen die de release toevoegt.

---

## 3. Herstarten

Herstart de applicatie en de RTE om de nieuwe code te laden. Het databaseschema wordt bij de eerste start geüpgraded:

```bash
pm2 restart ansibleforms ansibleforms-rte
```

Kom je van 7.2, dan draaide de RTE in databasemodus, met de database-instellingen en `RTE_URL`, verouderd in 7.3.0 en verwijderd in 8.0.0.
Start hem opnieuw in inbound-modus, en declareer zijn runner met een RTE-referentie in de seed of onder **Verbindingen → Runners**, zoals de
[installatie](../installation/from-source.html#run) laat zien: `pm2 delete ansibleforms-rte`, en daarna het bijbehorende `pm2 start`-commando.

Draai je de applicatie zonder PM2, stop dan `npm run start` en start het opnieuw.

---

## 4. Controleer de upgrade

Volg het log van de applicatie terwijl die start:

```bash
pm2 logs ansibleforms
```

In AnsibleForms toont **Help → Over** de versie die draait, en **Instellingen → Status** de gezondheid van de
database, het schema en de andere systemen waarvan AnsibleForms afhankelijk is.

---

## Terugdraaien

Om terug te gaan naar de release die je eerder draaide, de versie die **Help → Over** vóór de upgrade toonde, check je de tag daarvan uit met
`git checkout <version>`, en bouw en herstart je zoals in stap 2 en 3. Als die release niet start op de geüpgradede database, herstel je de back-up die je onder
**Instellingen → Back-ups** hebt gemaakt.
