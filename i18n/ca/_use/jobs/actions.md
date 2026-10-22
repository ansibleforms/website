---
layout: default
title: Accions sobre les tasques
parent: Tasques
nav_order: 3
translated_from: 6014f8e14db84fca0d144f1d64232e50aa6cbec9
---

# Accions sobre les tasques
{: .no_toc }

Llança, avorta, rellança, aprova o rebutja, i suprimeix una tasca
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Llançar una tasca

Cada tasca comença amb un formulari. Obre'l des de la pàgina **Formularis**, omple els camps i prem **Envia**:

1. El formulari es valida al navegador, i els valors dels camps s'envien al servidor.
2. El servidor crea la tasca i en retorna el número; s'executen les accions [`onSubmit`](../forms/job-status-action.html) del formulari.
3. La sortida de la tasca apareix sota el formulari i s'actualitza cada dos segons fins que la tasca acaba.

La tasca també apareix a la pàgina **Tasques**, on la pots seguir més tard.

### Qui pot llançar un formulari

Un formulari es mostra, i es pot llançar, als usuaris que tenen un dels [rols](../config/roles.html) de la seva llista `roles`.
El rol `default`, que tenen tots els usuaris, fa que un formulari estigui disponible per a tothom qui pot iniciar la sessió.

### Abans d'enviar

La barra que hi ha a sobre dels camps ofereix unes quantes eines, cadascuna visible només quan el teu rol ho permet:

| Botó | Què fa | Opció de rol |
|---|---|---|
| **Mostra les extravars** | Previsualitza les extravars que rebrà la tasca, a mesura que omples els camps | `showExtraVars` |
| **verbose** | Executa la tasca en mode detallat | `allowVerboseMode` |
| **Carrega des de les desades** | Omple els camps a partir d'una [tasca desada](stored-jobs.html) | `allowStoredJobs` |
| **Torna a carregar aquest formulari** | Torna a carregar el formulari, amb els seus valors per defecte | cap |

### Opcions en el moment del llançament

Un formulari pot permetre que els seus usuaris triïn algunes opcions d'Ansible quan el llancen, declarant un camp amb un nom reservat. Llavors
el valor del camp té prioritat sobre la configuració pròpia del formulari:

| Nom del camp | Té prioritat sobre | Tipus de camp habitual |
|---|---|---|
| `__check__` | El mode check, una simulació que no canvia res | `checkbox` |
| `__diff__` | El mode diff, que mostra què canviaria | `checkbox` |
| `__limit__` | Els hosts on s'executa el playbook | `text` o `enum` |
| `__tags__` | Les etiquetes que s'executen | `text` o `enum` |
| `__inventory__` | L'inventari | `enum` |
| `__playbook__`, `__template__` | El playbook, o la plantilla d'AWX / AAP | `enum` |

Per exemple, un formulari que ofereix una simulació i un límit d'hosts:

```yaml
fields:
  - name: __check__
    type: checkbox
    label: Dry run (check mode)
  - name: __limit__
    type: text
    label: Limit to these hosts
```

El servidor només accepta aquests noms d'un formulari que els declara com a camps, de manera que un llançament des de l'API no els pot afegir
pel seu compte. Les propietats que sobreescriuen es descriuen a [Formularis d'Ansible](../forms/ansible.html) i [Formularis d'AWX](../forms/awx.html).

### Què pot aturar un llançament

Un llançament no sempre es converteix directament en una tasca en execució:

* **Camps no vàlids**: el formulari no s'envia, i cada camp que no passa la validació en mostra el motiu.
* **Validació del llançament**: amb la [validació del llançament](../launch-validation/) definida a `enforce`, el servidor torna a comprovar els valors
  i rebutja un llançament que incompleix les regles del formulari.
* **Aprovació**: un formulari amb un [punt d'aprovació](../forms/approval.html) crea la tasca, que llavors espera amb l'estat
  `approve`; vegeu [Aprovar o rebutjar una tasca](#approve-or-reject-a-job).

Quan la tasca acaba, les [notificacions](../forms/notifications.html) del formulari envien els seus correus i missatges als canals, i s'executen les seves accions
segons l'estat de la tasca.

### Altres maneres d'iniciar una tasca

Un formulari també pot iniciar una tasca sense que cap persona premi **Envia**:

| Iniciada per | Com | Pàgina |
|---|---|---|
| Executar més tard o una programació cron | **Executa més tard (una vegada)** o **Programa (recurrent)** al costat d'**Envia** | [Programacions](schedules.html) |
| Un script o un pipeline | `POST /api/v2/job` amb un token d'API | [Tasques de l'API REST](../api/jobs.html) |
| Un agent d'IA | L'eina `launch_job` del servidor MCP | [Eines MCP](../mcp/tools.html) |
| Una conversa | L'assistent de xat omple el formulari i el llança | [Assistent de xat](../chat/) |
| Una tasca anterior | **Rellança**, més avall | [Rellançar una tasca](#relaunch-a-job) |

---

## Avortar una tasca

**Avorta** al menú de la fila (⋮) de la llista, o **Avorta la tasca** a la pàgina de la tasca, atura una tasca amb l'estat `running`. Després que ho confirmis,
AnsibleForms marca la tasca perquè s'avorti:

* **`ansible`**: l'RTE atura el procés del playbook (amb tots els seus workers), i la tasca acaba com a `aborted` amb
  `... was aborted by the operator`. Una tasca que encara espera un RTE lliure s'avorta abans de començar.
* **Una tasca de plantilla** (AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins): AnsibleForms demana al runner que cancel·li o aturi
  el job, i la tasca acaba com a `aborted`. Quan el runner s'hi nega, la sortida mostra `Abort request denied`, seguit de
  `reverting abort request`, i la tasca continua executant-se. Un build de Jenkins que encara és a la cua se'n treu.
* **`workflow`**: les tasques dels nodes en curs s'avorten i no comença res més (vegeu
  [Executar un workflow](../workflows/running.html#abort)).
* **`multistep`**: els passos que encara no han començat s'ometen (`skipping: [Abort is requested]`), i la tasca principal
  acaba com a `aborted`. Un pas que ja s'està executant és una tasca pròpia: obre-la i avorta-la per aturar-la també.

Pots avortar les teves pròpies tasques; un administrador, o a partir de la 7.3.0 un usuari el rol del qual defineix `manageAllJobs`, pot avortar qualsevol tasca. `showAllJobLogs` permet a un
usuari veure les tasques d'altres usuaris, no avortar-les.

---

## Rellançar una tasca

**Rellança** al menú de la fila (⋮) de la llista, o **Rellança la tasca** a la pàgina de la tasca, inicia una tasca nova a partir d'una d'acabada. S'ofereix en qualsevol
tasca que no estigui en `running` ni esperant aprovació, als usuaris el rol dels quals defineix l'opció de rol `allowJobRelaunch`.

El diàleg ofereix:

* **Rellança**: torna a executar la tasca amb els valors amb què es va executar, com una tasca nova al teu nom.
* **Mode detallat**: rellança en mode detallat; es mostra amb l'opció de rol `allowVerboseMode`.
* **Edita els valors abans de rellançar**, i després **Edita i rellança**: obre el formulari emplenat amb els valors de la tasca, perquè
  els puguis canviar abans d'enviar.

Un rellançament també requereix que el formulari ho permeti (`allowRelaunch`, true per defecte) i que la tasca sigui **teva**, tret que
siguis administrador o, a partir de la 7.3.0, tinguis `manageAllJobs`; `showAllJobLogs`, que fins a la 7.2 permetia rellançar qualsevol tasca, ja no ho permet. Com es comprova un rellançament amb les regles del formulari, i per què un formulari amb un
camp de contrasenya el pot rebutjar, es descriu a [Rellançament](../launch-validation/relaunching.html).

### Rellançar amb dades emplenades

**Edita i rellança** obre el formulari amb el paràmetre d'URL `prefillJobId`, que també pots fer servir en un enllaç propi:

```text
https://af.example.com/form?form=New%20Virtual%20Machine&prefillJobId=61
```

El formulari carrega els valors dels camps desats amb la tasca `61` i mostra `Formulari emplenat amb les dades de la tasca anterior #61`.
En enviar-lo s'inicia una tasca nova, comprovada com qualsevol altre llançament. L'emplenament segueix les mateixes regles que un rellançament:

* **Els camps de contrasenya no es desen mai**, de manera que no s'emplenen mai: torna'ls a introduir. Les constants tampoc no es desen.
* Cal l'opció de rol `allowJobRelaunch`, i la tasca ha de ser teva (o has de ser administrador o tenir `manageAllJobs`).
* Un formulari amb `allowRelaunch: false` no es pot rellançar ni emplenar:

```yaml
- name: New Virtual Machine
  type: ansible
  playbook: create-vm.yaml
  allowRelaunch: false
```

Una tasca d'abans que es desessin els valors dels camps no es pot emplenar, i el formulari mostra un error:

```text
No saved form data found for job <id>. This job may have been created before the relaunch feature was enabled.
```

---

## Aprovar o rebutjar una tasca

Una tasca amb un [punt d'aprovació](../forms/approval.html) s'atura amb l'estat `approve` i espera. Apareix a la pàgina Tasques dels seus
aprovadors, els usuaris amb un dels rols de l'aprovació, perquè la puguin trobar; a partir de la 7.3.0, els altres usuaris ja no la veuen.

**Revisar l'aprovació** s'ofereix als administradors i als usuaris que tenen un dels rols de l'aprovació: un clic a la fila de la tasca,
**Revisar l'aprovació** al menú de la fila, o el botó **Revisar l'aprovació** a la pàgina de la tasca. El diàleg mostra el missatge de
l'aprovació, amb els valors de la tasca inserits (o una línia genèrica si no en té), i el formulari, l'id de la tasca, qui l'ha llançada i
quan, amb un enllaç a la tasca; **Rebutja** i **Aprova** hi responen:

* **Aprova**: la tasca continua i el seu estat torna a `running`.
* **Rebutja**: la tasca acaba com a `rejected`, i la seva sortida registra `rejected by <username>`.

Una tasca que espera aprovació no es pot rellançar ni suprimir des de la pàgina Tasques; primer aprova-la o rebutja-la.

A partir de la 7.3.0, l'usuari que ha llançat una tasca no la pot aprovar, de manera que sempre la mira una segona persona, tot i que encara la pot rebutjar per
retirar-la. Un administrador sempre pot aprovar, també les seves pròpies tasques. Un formulari el punt d'aprovació del qual defineix
[`allowSelf: true`](../forms/approval.html#approving-your-own-job) permet que qui el llança també aprovi la seva pròpia tasca.

---

## Suprimir una tasca

**Suprimeix** al menú de la fila (⋮) de la llista, o **Suprimeix la tasca** a la pàgina de la tasca, suprimeix una tasca amb la seva sortida després que ho confirmis.
Suprimir una tasca multipas també en suprimeix els passos. Per suprimir diverses tasques alhora, marca-les a la primera columna de la llista i
fes clic a **Suprimeix (n)** a sobre.

Pots suprimir les teves pròpies tasques. Els administradors i, a partir de la 7.3.0, els usuaris amb l'opció de rol `manageAllJobs` poden suprimir qualsevol tasca; `showAllJobLogs`
ja no ho permet. Un rol que defineix `allowJobDeletion: false` no suprimeix cap tasca, ni tan sols les pròpies, de manera que l'historial de tasques queda sencer. A la pàgina
de la tasca, el botó està amagat mentre la tasca s'executa o s'està avortant (excepte per als administradors i `manageAllJobs`) i mentre espera aprovació; a la llista, l'entrada
del menú i la casella de selecció apareixen en gris per a una tasca que no pots suprimir.
