---
layout: default
title: Comunicar una vulnerabilitat
nav_order: 4
translated_from: 382775f2312f05fd6dcd85154cb81c2709000d69
---

# Comunicar una vulnerabilitat
{: .no_toc }

Com comunicar un problema de seguretat en privat, i què passa després
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Comunica-ho en privat

AnsibleForms guarda credencials i tokens de vault, així que no comuniquis mai un problema de seguretat en una issue pública:

1. Obre **[Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new)**: un avís privat que només veuen els mantenidors.
2. Si aquesta pàgina no està disponible per a tu, obre una issue normal que digui només que tens un informe de seguretat i que demani
   un canal privat: sense detalls, sense passos per reproduir-lo i sense números de versió. Un mantenidor obre un avís privat i
   t'hi convida.

La política completa és al [SECURITY.md](https://github.com/ansibleforms/ansibleforms/blob/main/SECURITY.md) del repositori.

---

## Què cal incloure

Com més d'aquesta informació doni un informe, més aviat es corregeix:

* Què hi guanya un atacant: les dades d'un altre usuari, un playbook que no pot executar, l'amfitrió o drets d'administrador.
* La versió, i com està desplegada: Docker, Kubernetes o instal·lada de manera nativa.
* Una manera de reproduir-lo, o la petició que el provoca.
* Si necessita un usuari amb la sessió iniciada, i amb quines [opcions de rol](../config/roles.html).

---

## Què passa després

Un informe passa pel mateix avís privat des del primer missatge fins a la publicació:

| Pas | Què reps |
|---|---|
| Confirmació de recepció | La confirmació que l'informe ha arribat, i si es reprodueix |
| Acceptat | Una correcció a la propera versió de cada [versió amb suport](development.html#supported-versions), i un avís publicat que t'hi reconeix, tret que prefereixis no aparèixer-hi |
| Rebutjat | El raonament, normalment que el comportament necessita un permís que la persona que l'ha comunicat ja tenia |

Un cop publicada la correcció, l'avís es publica i apareix a [Avisos de seguretat](advisories.html).

---

## Abast

La política traça la línia allà on la traça el model de rols:

| Dins de l'abast | Fora de l'abast |
|---|---|
| Qualsevol cosa a què pugui arribar un usuari amb la sessió iniciada més enllà del que li concedeix el seu rol | Troballes que requereixen que el compte d'administrador ja estigui compromès: que un administrador executi qualsevol playbook és el producte |
| Qualsevol cosa accessible sense iniciar la sessió | Informes d'escàners sense cap impacte demostrat |
| Credencials desades que es tornen llegibles, o que s'escriuen en un registre | |
| Injecció al shell, a la base de dades o al navegador | |
