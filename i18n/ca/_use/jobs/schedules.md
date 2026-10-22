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
translated_from: 7ffab643975d7705375fbd02588c9db76e27f74f
---

# Programacions
{: .no_toc }

Executa un formulari més tard o segons una programació cron, i gestiona totes les programacions
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
accions de programació creen una entrada a la pàgina **Programacions**; **Desa** crea una entrada a la pàgina **Tasques desades**. La
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
en aquell moment, escrites en YAML; cada execució fa servir aquesta còpia, així que edita-la a la pàgina **Programacions** per canviar el que rep la tasca.

![Programacions](../assets/screenshots/schedules.jpg)

---

## La pàgina Programacions

La pàgina **Programacions** mostra totes les programacions, amb la seva columna **Activat** a partir de la 7.3.0, i necessita `allowScheduledJobs`. El menú de cada fila ofereix:

| Acció | Què fa |
|---|---|
| **Edita** | Canvia el nom, el tipus, l'expressió cron o l'hora d'execució, el formulari i les extra vars |
| **Executa ara** | Executa la programació ara, sense esperar la seva expressió cron o la seva hora d'execució |
| **Activa** o **Desactiva** | Activa o desactiva la programació, segons correspongui, tal com mostra la seva columna **Activat** (a partir de la 7.3.0) |
| **Suprimeix** | Elimina la programació; deixa d'executar-se immediatament |
| **Darrera sortida** | A la pàgina de la programació, el que ha informat l'última execució, com ara el número de la tasca que ha iniciat |

Aquí també es pot crear una programació des de zero. Tria el **Formulari** i, després, o bé marca **Execució única** i defineix
**Executa el**, o bé deixa-ho sense marcar i defineix una **Programació** cron. **Extra vars** és YAML sense cap formulari que l'ompli, així que afegeix-hi
tu mateix els valors que necessita el playbook, com a diccionari (parelles clau: valor).

El camp de la **Programació** cron és un editor de cron: descriu l'expressió amb paraules, ofereix valors predefinits i previsualitza les properes
execucions. El servidor rebutja una expressió que no pot executar, o una que no es pot produir mai.

A partir de la 7.3.0, cada programació té un interruptor **Activat**, per posar-la en pausa sense suprimir-la. Una programació desactivada es queda a la pàgina
amb la seva configuració, però no s'executa sola: una de recurrent se salta els seus tics de cron, i una d'única espera passat el seu
**Executa el** fins que es torna a activar. **Executa ara** encara l'executa a demanda. Una programació nova està activada, i les programacions
que existien abans de la 7.3.0 queden activades després de l'actualització.

---

## Expressions cron i zona horària

Una programació recurrent admet una expressió cron estàndard de 5 camps: minut, hora, dia del mes, mes i dia de la setmana.

| Expressió | S'executa |
|---|---|
| `*/15 * * * *` | Cada 15 minuts |
| `0 2 * * *` | Cada dia a les 02:00 |
| `30 7 * * 1-5` | De dilluns a divendres a les 07:30 |
| `0 0 1 * *` | A mitjanit del primer dia de cada mes |

Trobaràs més exemples, i les funcions de cron que l'editor no accepta, a les PMF, a
[Quines expressions cron puc fer servir?](../faq.html#which-cron-expressions-can-i-use).

{: .note }
> Les programacions cron s'executen a la zona horària del servidor, definida amb [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) (per defecte `UTC`),
> no a la zona horària del teu perfil ni del teu navegador. L'editor de cron previsualitza les properes execucions en aquesta mateixa zona.

---

## Com s'executa una programació

Quan arriba l'hora d'una programació, es posa a la cua, i el servidor inicia les programacions de la cua d'una en una, comprovant la cua cada 10 segons.

- Les programacions **recurrents** se salten un tic mentre l'execució anterior encara és a la cua o en execució, de manera que les execucions no se superposen mai.
- Les programacions **úniques** s'executen durant el minut següent a **Executa el**, i després se suprimeixen, també quan s'inicien amb **Executa ara**.
- L'**Estat** és `success` quan s'ha iniciat la tasca i `failed` quan no s'ha pogut iniciar. Un `success` només diu que la tasca s'ha
  llançat: obre la tasca per veure com ha acabat.

Una programació creada amb `allowScheduledJobs` s'executa com l'usuari integrat `Schedule Service` (tipus `schedule`) amb el
rol `admin`. Pot executar qualsevol formulari, sigui quin sigui l'accés de la persona que ha creat la programació, i `ansibleforms_user` a
les seves extravars descriu aquest usuari. Una [execució planificada](#planned-runs), en canvi, s'executa com l'usuari que l'ha planificada.

La tasca també rep un objecte `schedule` (amb el seu `id`, `name` i `form`), de manera que un playbook sap que l'ha iniciat una programació:

```yaml
schedule:
  id: 3
  name: Nightly cleanup
  form: Cleanup servers
```

---

## Execucions planificades

**Executa més tard (una vegada)** per part d'un usuari sense `allowScheduledJobs` crea una execució planificada: una programació única lligada a aquest usuari.

- **Quan es planifica**, el servidor comprova que l'usuari pugui executar el formulari (els seus `roles`), i el mode detallat necessita
  `allowVerboseMode`. Una execució planificada és sempre única; una expressió cron es rebutja.
- **Amb la validació del llançament a `enforce`**, els valors dels camps es comproven en planificar-la, de manera que una execució que es rebutjaria es
  rebutja mentre l'usuari encara hi és al davant.
- **Quan s'executa**, la tasca s'executa com a aquest usuari, i és seva, amb les mateixes comprovacions que un llançament des del navegador: els
  rols del formulari tal com són en aquell moment, les extravars reservades eliminades i la validació del llançament. `ansibleforms_user` el descriu.

Qui la planifica no veu la pàgina **Programacions**, que necessita `allowScheduledJobs`; la tasca apareix al seu propi historial de tasques.

---

## Quan el formulari canvia

Una programació fa referència al seu formulari pel nom i l'executa tal com està definit en el moment de cada execució.

- **El formulari s'edita**: la següent execució fa servir la nova definició (playbook, plantilla, inventari) amb les extravars desades a
  la programació. El formulari no es renderitza, així que no es recalcula cap camp; edita les extra vars de la programació perquè hi coincideixin.
- **El formulari es reanomena o s'elimina**: l'execució falla, l'**Estat** passa a `failed` i la **Darrera sortida** diu
  `Failed to launch : No such form '<name>'`. Edita la programació i tria el formulari correcte, o suprimeix-la.

---

## Tasques programades a l'historial de tasques

Cada execució d'una programació crea una tasca normal, que apareix a la pàgina [Tasques](./) amb `Schedule Service` com a usuari o,
per a una execució planificada, amb l'usuari que l'ha planificada.

Una tasca de `Schedule Service` no pertany a la persona que ha creat la programació, de manera que només la veuen els administradors i
els usuaris amb `showAllJobLogs`; la tasca d'una execució planificada també la veu el seu usuari. La **Darrera sortida** de la programació indica la tasca que ha iniciat, perquè la puguis trobar a la llista.
