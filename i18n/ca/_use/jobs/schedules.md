---
layout: default
title: Programacions
parent: Tasques
nav_order: 4
redirect_from:
  - /schedules.html
  - /schedules/
  - /schedules/scheduling.html
  - /schedules/schedules-page.html
translated_from: 57383a13d04c8157937b3c6caa33ad7af84c93b7
---

# Programacions
{: .no_toc }

Executa un formulari més tard, segons un cron o una rrule, i gestiona totes les programacions
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Les accions del formulari

Un formulari pot fer més que executar-se immediatament: el desplegable que hi ha al costat del seu botó **Envia** conté tres accions més.

| Acció | Què fa | Opció de rol |
|---|---|---|
| **Programa (recurrent)** | Crea una programació que executa el formulari segons una expressió cron | `allowScheduledJobs` |
| **Executa més tard (una vegada)** | Crea una programació que executa el formulari una vegada, a la data i l'hora que triïs | `allowPlannedJobs` |
| **Desa** | Desa els valors dels camps, per tornar-los a carregar al formulari més tard | `allowStoredJobs` |

Una acció l'opció de rol de la qual està desactivada no es mostra. El formulari es valida abans de qualsevol d'elles, igual que per a **Envia**. Totes dues
accions de programació creen una entrada a **Tasques > Programats**; **Desa** crea una entrada a la pàgina **Tasques desades**. La
barra lateral de la pàgina [Tasques](./) les obre a **Futur**, com a **Programats** i **Desats**. Les opcions de rol es descriuen
a [Opcions de rol](../config/roles.html#role-options).

{: .warning }
> Tracta `allowScheduledJobs` com una opció de nivell d'administrador. Les seves programacions no pertanyen a l'usuari que les ha creat: tots els usuaris
> amb l'opció veuen i poden canviar totes les programacions. A més, una programació d'aquestes s'executa amb drets d'administrador, per a qualsevol formulari, sigui quin sigui
> l'accés propi de qui l'ha creada. Concedeix-la només a rols en què confiaries com a administradors.

{: .note }
> **Executa més tard (una vegada)** només necessita `allowPlannedJobs`. Per a un usuari sense `allowScheduledJobs`, planifica una execució **com a aquest
> usuari**: el servidor comprova que l'usuari pugui executar el formulari, i la tasca s'executa com a ell, i és seva, quan arriba l'hora
> (vegeu [Execucions planificades](#planned-runs)).

---

## Programar un formulari

Omple el formulari, obre el desplegable que hi ha al costat d'**Envia** i tria una de les accions de programació.

- **Programa (recurrent)** obre **Crea una programació**: introdueix un **Nom** i una **Expressió cron** (la per defecte, `0 0 * * *`,
  s'executa cada dia a mitjanit), i després selecciona **Crea una programació**.
- **Executa més tard (una vegada)** obre **Executa més tard**: introdueix un **Nom** i tria la data i l'hora a **Executa el**, i després selecciona
  **Programa la tasca**.

El nom ha de ser únic entre totes les programacions. La programació conserva el nom del formulari i una còpia de les extravars que ha produït el formulari
en aquell moment, escrites en YAML; cada execució fa servir aquesta còpia, així que edita-la a la pàgina de la programació per canviar el que rep la tasca. Per
temporitzar-la amb una rrule, o donar-li un final, obre la seva pàgina i canvia la seva pestanya **Programació**.

![Programacions](../assets/screenshots/schedules.jpg)

---

## La llista de programacions

**Tasques > Programats** mostra totes les programacions i necessita `allowScheduledJobs`; una fila obre la pàgina pròpia de la programació.

| Columna | Mostra |
|---|---|
| **Activat** | Si la programació s'executa segons la seva pròpia temporització |
| **Nom** i **Formulari** | La programació, i el formulari que executa |
| **Programació** | La seva temporització en llenguatge planer, com ara *At 02:00 AM*; passa-hi el ratolí per sobre per veure el cron o la regla mateixa |
| **Darrera execució** | Quan es va executar per última vegada |
| **Propera execució** | Quan s'executarà la propera vegada, un guió quan no té cap execució per davant |
| **Estat** | El seu últim llançament: si ha iniciat una tasca, o **Iniciant…** mentre n'inicia una |

La columna **Programació** mostra una programació d'una sola vegada com a **Execució única**. Una rrule que el llenguatge planer no pot
descriure es mostra tal com és. El menú de cada fila ofereix:

| Acció | Què fa |
|---|---|
| **Edita** | Obre la pàgina de la programació |
| **Executa ara** | Executa la programació ara, sense esperar la seva temporització |
| **Activa** o **Desactiva** | Activa o desactiva la programació, segons correspongui, tal com mostra la seva columna **Activat** |
| **Suprimeix** | Elimina la programació; deixa d'executar-se immediatament |

**Nou element: programació** en crea una des de zero, en tres passos: **Detalls** (el seu **Nom**, **Descripció** i **Formulari**),
**Programació** (la seva temporització i el seu final) i **Extra vars**. **Extra vars** és YAML sense cap formulari que l'ompli, així que afegeix-hi
tu mateix els valors que necessita el playbook, com a diccionari (parelles clau: valor).

---

## La pàgina d'una programació

La pàgina d'una programació conté els passos del seu diàleg com a pestanyes, amb **Executa ara**, **Suprimeix** i **Desa** a dalt a la dreta.

| Pestanya | Què conté |
|---|---|
| **Detalls** | El seu origen, **Nom**, **Descripció**, **Formulari**, després **Últim llançament**, **Tasca iniciada**, **Darrera execució**, **Propera execució** i **Activat** |
| **Programació** | Com es temporitza (vegeu [Temporitzar una programació](#timing-a-schedule)) i com acaba (vegeu [El final d'una programació](#the-end-of-a-schedule)) |
| **Extra vars** | El YAML que rep la tasca; per a una programació guardada a git, també els prompts del seu fitxer |
| **Execucions** | Les tasques que ha iniciat, la més recent primer; una fila obre la tasca |

**Últim llançament** diu com ha anat el seu últim llançament, com a estat: un de fallit diu per què quan s'hi passa el ratolí per sobre. **Tasca iniciada**
enllaça a la tasca que ha iniciat, perquè la puguis obrir i veure com ha acabat. La pestanya **Execucions** mostra les tasques que pots veure, amb l'usuari
amb què s'han executat, el seu inici, final, durada i estat; el seu nombre és al títol de la pestanya.

L'interruptor **Activat** posa en pausa una programació sense suprimir-la, i es desa amb **Desa**, com tots els camps de la pàgina. Una
programació desactivada es queda a la llista amb la seva configuració, però no s'executa sola: una de recurrent se salta les seves execucions, i una
d'única espera passat el seu moment fins que es torna a activar. **Executa ara** encara l'executa a demanda. Una programació nova està activada.

---

## Temporitzar una programació

Una programació es temporitza d'una de tres maneres, triada a **Programació** a la seva pestanya **Programació**; la rrule és nova a la 7.8.0.

| Temporització | S'executa | Vegeu |
|---|---|---|
| **Cron** | De manera recurrent, segons una expressió cron a la zona horària del servidor | [Expressions cron i zona horària](#cron-expressions-and-time-zone) |
| **Regla de recurrència (rrule)** | De manera recurrent, segons una regla iCal a la seva pròpia zona horària | [Regles de recurrència](#recurrence-rules) |
| **Execució única** | Una vegada, en una data i hora | [Com s'executa una programació](#how-a-schedule-runs) |

Amb un cron o una rrule, l'editor mostra les tres properes execucions, i les atura al final de la programació. Canviar la temporització
només conserva la triada: una programació que passa d'un cron a una rrule perd el seu cron.

---

## Expressions cron i zona horària

Una programació recurrent pot fer servir una expressió cron estàndard de 5 camps: minut, hora, dia del mes, mes i dia de la setmana.

| Expressió | S'executa |
|---|---|
| `*/15 * * * *` | Cada 15 minuts |
| `0 2 * * *` | Cada dia a les 02:00 |
| `30 7 * * 1-5` | De dilluns a divendres a les 07:30 |
| `0 0 1 * *` | A mitjanit del primer dia de cada mes |

L'editor de cron descriu l'expressió amb paraules, ofereix valors predefinits i previsualitza les properes execucions. El servidor rebutja una
expressió que no pot executar, o una que no es pot produir mai. Trobaràs més exemples, i les funcions de cron que l'editor no accepta, a les PMF,
a [Quines expressions cron puc fer servir?](../faq.html#which-cron-expressions-can-i-use).

{: .note }
> Les programacions cron s'executen a la zona horària del servidor, definida amb [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) (per defecte `UTC`),
> no a la zona horària del teu perfil ni del teu navegador. L'editor de cron previsualitza les properes execucions en aquesta mateixa zona.

---

## Regles de recurrència

A partir de la 7.8.0, una programació recurrent pot fer servir en canvi una regla de recurrència iCal (rrule), que s'executa en una zona horària pròpia.

```text
DTSTART;TZID=Europe/Brussels:20261020T020000 RRULE:FREQ=DAILY;INTERVAL=1
DTSTART:20261019T060000Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO
DTSTART;TZID=America/New_York:20261101T073000 RRULE:FREQ=MONTHLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1
```

La primera s'executa cada dia a les 02:00 a Brussel·les, la segona cada dilluns a les 06:00 UTC, la tercera l'últim dia feiner de
cada mes a les 07:30 a Nova York. Una regla és una sola línia, amb les seves parts separades per espais:

| Part | Què diu |
|---|---|
| `DTSTART` | La primera execució, amb un `TZID` (una zona IANA com ara `Europe/Brussels`, o un desplaçament com ara `UTC+5` o `GMT-3`), o en UTC acabada en `Z` |
| `RRULE` | Quan es repeteix: `FREQ` amb un `INTERVAL` d'almenys 1, i `BYDAY`, `BYHOUR`, `BYMONTHDAY`, `COUNT`, `UNTIL` … segons calgui; una o més |
| `EXRULE` | Opcional: una regla d'execucions que s'ometen |

El servidor rebutja una regla que no pot executar, i diu per què:

- cap `DTSTART`, més d'un, o un sense zona horària, i `EXDATE` o `RDATE`;
- una regla sense `INTERVAL`, `FREQ=SECONDLY`, `BYDAY` amb un número (`5MO`), o `COUNT` juntament amb `UNTIL`;
- `COUNT` per sobre de 999, un número `BYxxx` fora del seu interval (`BYHOUR` de 0 a 23, `BYSETPOS` d'1 a 366 o de -366 a -1 …), un `WKST`
  que no és cap dia de la setmana, un `DTSTART` o `UNTIL` que no és cap data real (`20300230`), o una part que apareix dues vegades en una regla;
- una regla que no s'activa mai: cap execució en els 50 anys posteriors al seu `DTSTART`, com ara `FREQ=HOURLY;INTERVAL=2;BYHOUR=1` des de
  mitjanit, que només coincideix amb hores parelles.

L'editor és un quadre de text: una rrule nova comença com a cada dia a mitjanit a la zona horària del teu navegador. Diu de seguida per què una regla
es rebutjaria, i si no, mostra les seves tres properes execucions a la zona horària pròpia de la regla, o **Aquesta rrule no té cap execució per davant.** quan el seu
`UNTIL` o `COUNT` ja ha passat. Una hora que un canvi d'horari d'estiu se salta s'executa quan el rellotge hi arriba (les 02:30 s'executen a les 03:30 la
nit que el rellotge passa de les 02:00 a les 03:00), com fa un cron; una hora que el rellotge mostra dues vegades s'executa una vegada, la primera.

---

## El final d'una programació

A partir de la 7.8.0, una programació temporitzada per un cron o una rrule pot acabar; a **Acaba**, a la seva pestanya **Programació**, tria una opció.

| Acaba | La programació acaba |
|---|---|
| **Mai** | Mai: el valor per defecte, i totes les programacions d'abans de la 7.8.0 |
| **En una data** | A la data i l'hora triades: cap execució després |
| **Després de** … **execucions** | Quan ha iniciat aquest nombre de tasques en total, les que mostra la seva pestanya **Execucions**; el camp diu quantes fins ara |

**En acabar**, es desactiva (**Desactivar-la**, el valor per defecte) o se suprimeix (**Eliminar-la**). La tasca del sistema **Fi de les programacions**
aplica els finals cada minut, i una programació que arriba al seu nombre d'execucions acaba just després de l'última. El `UNTIL` o el `COUNT`
propis d'una rrule continuen aplicant-se; el final s'hi afegeix.

Una programació d'una sola vegada no té final: acaba amb la seva execució. El seu interruptor **Eliminar després d'executar-se**, activat per defecte, la
suprimeix després de la seva execució; desactivat, la programació es desactiva després de la seva execució i es conserva amb el seu resultat.

---

## Com s'executa una programació

Quan arriba l'hora d'una programació, es posa a la cua, i el servidor inicia les programacions de la cua d'una en una, comprovant la cua cada 10 segons.

- Les programacions **recurrents** se salten una execució mentre l'execució anterior encara és a la cua o en execució, de manera que les execucions no se superposen mai.
- Les programacions **úniques** s'executen durant el minut següent al seu moment, i després se suprimeixen (o es conserven, desactivades, quan
  **Eliminar després d'executar-se** està desactivat), també quan s'inicien amb **Executa ara**.
- L'**Estat** és `success` quan s'ha iniciat la tasca i `failed` quan no s'ha pogut iniciar. Un `success` només diu que la tasca s'ha
  llançat: obre la tasca per veure com ha acabat.

Una programació creada amb `allowScheduledJobs` s'executa com l'usuari integrat `Schedule Service` (tipus `schedule`) amb el
rol `admin`. Pot executar qualsevol formulari, sigui quin sigui l'accés de la persona que ha creat la programació, i `ansibleforms_user` a
les seves extravars descriu aquest usuari. Una [execució planificada](#planned-runs), en canvi, s'executa com l'usuari que l'ha planificada.

La tasca també rep un objecte `schedule`, de manera que un playbook sap que l'ha iniciat una programació:

```yaml
schedule:
  id: 3
  name: Nightly cleanup
  description: ''
  form: Cleanup servers
  one_time_run: null
```

El seu `one_time_run` és el moment de l'execució d'una programació d'una sola vegada, `null` per a una de recurrent. També porta la resta de
la configuració de la programació, com ara `enabled` i `repository`, i `run_at`: el mateix moment amb el seu nom d'abans de la 7.8.0 (obsolet, s'elimina a la 8).

---

## Execucions planificades

**Executa més tard (una vegada)** per part d'un usuari sense `allowScheduledJobs` crea una execució planificada: una programació única lligada a aquest usuari.

- **Quan es planifica**, el servidor comprova que l'usuari pugui executar el formulari (els seus `roles`), i el mode detallat necessita
  `allowVerboseMode`. Una execució planificada és sempre única; una expressió cron o una rrule es rebutja.
- **Amb la validació del llançament a `enforce`**, els valors dels camps es comproven en planificar-la, de manera que una execució que es rebutjaria es
  rebutja mentre l'usuari encara hi és al davant.
- **Quan s'executa**, la tasca s'executa com a aquest usuari, i és seva, amb les mateixes comprovacions que un llançament des del navegador: els
  rols del formulari tal com són en aquell moment, les extravars reservades eliminades i la validació del llançament. `ansibleforms_user` el descriu.

Qui la planifica no veu **Tasques > Programats**, que necessita `allowScheduledJobs`; la tasca apareix al seu propi historial de tasques. Una
execució planificada sempre se suprimeix després de la seva execució.

---

## Quan el formulari canvia

Una programació fa referència al seu formulari pel nom i l'executa tal com està definit en el moment de cada execució.

- **El formulari s'edita**: la següent execució fa servir la nova definició (playbook, plantilla, inventari) amb les extravars desades a
  la programació. El formulari no es renderitza, així que no es recalcula cap camp; edita les extra vars de la programació perquè hi coincideixin.
- **El formulari es reanomena o s'elimina**: l'execució falla, l'**Estat** passa a `failed` i l'**Últim llançament**, quan s'hi passa el ratolí per sobre, diu
  `Failed to launch : No such form '<name>'`. Edita la programació i tria el formulari correcte, o suprimeix-la.

---

## Tasques programades a l'historial de tasques

Cada execució d'una programació crea una tasca normal, que apareix a la pàgina [Tasques](./) amb `Schedule Service` com a usuari o,
per a una execució planificada, amb l'usuari que l'ha planificada.

Una tasca de `Schedule Service` no pertany a la persona que ha creat la programació, de manera que només la veuen els administradors i els usuaris
amb `showAllJobLogs`; la tasca d'una execució planificada també la veu el seu usuari. La pestanya **Execucions** de la programació mostra les tasques
que ha iniciat, i la seva **Tasca iniciada** enllaça a l'última.

---

## Programacions en un repositori git

A partir de la 7.8.0, les programacions també es poden guardar en un repositori git, com a entrades d'una llista `controller_schedules:` als seus fitxers YAML.

Com a màxim un repositori té l'ús **Programacions**: les seves entrades es llegeixen a **Tasques > Programats** a cada pull, temporitzades per un
`cron`, una `rrule` o un `one_time_run`, i una programació creada o canviada a l'aplicació s'escriu de nou al seu fitxer, a l'espera del
push del repositori. Una programació així mostra el seu fitxer a la seva pàgina, i el seu final només la desactiva. Vegeu
[Repositoris Git](../repositories/).

---

## A l'API

A partir de la 7.8.0, una programació de l'API té tres camps de temporització, dels quals exactament un té valor: `cron`, `rrule` o `one_time_run`.

| Camp | Conté |
|---|---|
| `cron` | Una expressió cron |
| `rrule` | Una regla de recurrència, en una sola línia |
| `one_time_run` | El moment de la seva única execució, una hora ISO 8601 amb el seu desplaçament o `Z` (`2026-11-15T22:00:00+01:00`) |
| `ends`, `end_at`, `end_count`, `end_action` | El seu final: `never`, `date` o `count`, la seva data, el seu nombre d'execucions, i `disable` o `remove` |
| `remove_after_run` | Una programació d'una sola vegada: `false` la conserva, desactivada, després de la seva execució |

{: .warning }
> El parell que acceptava l'API abans de la 7.8.0, `one_time_run: true` amb `run_at`, és obsolet des de la 7.8.0 i s'elimina a la 8. Encara
> es llegeix com a `one_time_run` en aquell moment, amb un avís al registre del servidor; `one_time_run: false` amb un cron es llegeix com a
> aquest cron.
