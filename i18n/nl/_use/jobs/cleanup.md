---
layout: default
title: Opruimen
parent: Jobs
nav_order: 6
translated_from: 3ccd056f3993f5aea914db2765e62d0d8f89d366
---

# Opruimen
{: .no_toc }

Jobs die door een herstart zijn afgebroken, en hoe lang afgeronde jobs bewaard blijven
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Verlaten jobs

Een lopende job wordt gevolgd door het AnsibleForms-proces dat hem startte. Stopt dat volgen, dan wordt de job gemarkeerd als
`abandoned`:

* **Bij het opstarten** worden de jobs die dit proces vóór zijn herstart volgde, en de jobs van vóór 7 die door geen enkel proces
  worden gevolgd, als verlaten gemarkeerd als ze nog `running` zijn of worden afgebroken; het log toont `Abandoned <n> jobs`. Een job die
  op een RTE draait, wordt niet aangeraakt: die gaat door zonder het proces dat hem startte.
* **Elke minuut** markeert de [systeemtaak](system-tasks.html) **Gestopte nodes** de jobs als verlaten die worden gevolgd door een ander
  AnsibleForms-proces (of RTE) dat 2 minuten niet meer heeft geantwoord; het log toont `Abandoned <n> jobs followed by a node that stopped answering`.
* **Elk uur** markeert de systeemtaak **Verlaten jobs** de jobs als verlaten die meer dan een dag geleden zijn gestart, nog
  `running` zijn en een dag lang geen uitvoer schreven. Een job die op een RTE draait, blijft ook hier ongemoeid: de RTE ruimt zijn eigen jobs op wanneer hij herstart.

Vanaf 7.3.0 wordt een sjabloonjob op AWX, AAP of Ascender die door een herstart of een gestopt knooppunt is verlaten, weer opgepakt als hij
in de afgelopen 24 uur is gestart: één AnsibleForms-proces neemt hem over, volgt hem opnieuw op de runner, en de job eindigt met wat
daar echt is gebeurd. Jobs op de andere runners, playbooks, workflows en multistep-jobs blijven verlaten.

Een verlaten playbook kan gedeeltelijk zijn uitgevoerd. Controleer de beheerde hosts voordat je het herstart; zie
[Een job toont de status abandoned](../troubleshooting.html#a-job-shows-the-status-abandoned).

---

## Bewaartermijn van jobs

Afgeronde jobs blijven zoveel dagen bewaard als de beheerder instelt in [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS).

De nachtelijke systeemtaak **Jobs opschonen** (om 2:30) verwijdert de afgeronde jobs, met hun uitvoer en stappen, die meer dan
dat aantal dagen geleden zijn geëindigd. Ze verwijdert alleen jobs met status `success`, `failed`, `warning`, `aborted`, `rejected` of
`abandoned`, dus lopende jobs en jobs die op goedkeuring wachten, blijven bewaard hoe oud ze ook zijn. De standaard is `90` sinds
7.6.0 (`0` daarvoor), en `0` bewaart elke job.

Deze tijden zijn de standaard: vanaf 7.8.0 wijzigt een beheerder ze op de pagina van de taak, onder **Jobs > Systeem**, en ziet daar
elke run (zie [Systeemtaken](system-tasks.html)).
