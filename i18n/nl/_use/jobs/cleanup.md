---
layout: default
title: Opruimen
parent: Jobs
nav_order: 6
translated_from: 48c1ec6d3d2ac80c86dd71d6799fbb1b59c5cb2f
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
* **Elke minuut** worden de jobs die worden gevolgd door een ander AnsibleForms-proces (of RTE) dat 2 minuten niet meer heeft geantwoord,
  als verlaten gemarkeerd; het log toont `Abandoned <n> jobs followed by a node that stopped answering`.
* **Elk uur** worden jobs die meer dan een dag geleden zijn gestart, nog `running` zijn en een dag lang geen uitvoer schreven, als verlaten gemarkeerd.
  Een job die op een RTE draait, blijft ook hier ongemoeid: de RTE ruimt zijn eigen jobs op wanneer hij herstart.

Vanaf 7.3.0 wordt een sjabloonjob op AWX, AAP of Ascender die door een herstart of een gestopt knooppunt is verlaten, weer opgepakt als hij
in de afgelopen 24 uur is gestart: één AnsibleForms-proces neemt hem over, volgt hem opnieuw op de runner, en de job eindigt met wat
daar echt is gebeurd. Jobs op de andere runners, playbooks, workflows en multistep-jobs blijven verlaten.

Een verlaten playbook kan gedeeltelijk zijn uitgevoerd. Controleer de beheerde hosts voordat je het herstart; zie
[Een job toont de status abandoned](../troubleshooting.html#a-job-shows-the-status-abandoned).

---

## Bewaartermijn van jobs

Jobs blijven bewaard tot ze worden verwijderd, tenzij de beheerder een bewaartermijn instelt.

Is [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS) ingesteld, dan verwijdert een nachtelijke taak (om 2:30)
de afgeronde jobs, met hun uitvoer en stappen, die meer dan dat aantal dagen geleden zijn geëindigd. Ze verwijdert alleen jobs met
status `success`, `failed`, `warning`, `aborted`, `rejected` of `abandoned`, dus lopende jobs en jobs die op goedkeuring
wachten, blijven bewaard hoe oud ze ook zijn. De standaard, `0`, bewaart elke job.
