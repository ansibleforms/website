---
layout: default
title: Afegir un repositori
parent: Repositoris Git
nav_order: 1
translated_from: 910365ea3ea4dec644e621ff8570917205671a76
---

# Afegir un repositori
{: .no_toc }

La pàgina Repositoris, cada camp d'un repositori i com declarar-ne un al config seed
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La pàgina Repositoris

Els repositoris es gestionen a **Configuració > Connexions > Repositoris**, que necessita l'[opció de rol](../config/roles.html#role-options) `showSettings` o, a partir de la 7.3.0,
`showConnectionsSettings`. Alguns canvis només els pot fer un administrador, vegeu [més avall](#who-may-change-a-repository).

![Repositoris](../assets/screenshots/git.jpg)

La llista mostra el **Nom**, la **Descripció**, la **Branca**, el **Head** (el hash curt del commit que hi ha descarregat), **Pull** i
**Push**. La pestanya **Detalls** d'un repositori mostra les mateixes insígnies de Pull i Push a sobre del seu head:

| Columna | Què indica |
|---|---|
| **Pull** | L'últim clonatge, pull o restabliment: **En execució** mentre git treballa, i després **Correcte** o **Fallit**; un guió abans del primer |
| **Push** | **Fallit** quan l'últim push ha fallat; **Canvis pendents** quan hi ha canvis desats aquí, pel dissenyador, que encara no s'han enviat al remot; **Correcte** quan no hi ha res pendent; un guió abans del primer push |

**Correcte** a la columna Push només vol dir que no hi ha res pendent d'enviar: el remot encara pot tenir commits més nous que un
pull portarà. El menú de cada fila conté aquestes accions:

| Acció | Què fa |
|---|---|
| **Edita** | Canvia els camps de més avall |
| **Pull** | Clona el repositori, o en fa pull quan la còpia de treball ja existeix |
| **Push** | Fa commit i push de la còpia de treball; només en els repositoris que es fan servir per a formularis, configuració, playbooks, workflows o inventaris, i només està activat quan hi ha canvis que encara no s'han enviat |
| **Restableix** | Esborra la còpia de treball i la torna a clonar, cosa que descarta els canvis locals |
| **Canvia les credencials** | Obre la pestanya **Credencials** del repositori, per triar la credencial que fa servir git |
| **Mostra la sortida de l'últim pull** | Mostra la sortida de git de l'últim clonatge, pull o restabliment, amb la contrasenya emmascarada |
| **Mostra la sortida de l'últim push** | Mostra la sortida de git de l'últim push, amb la contrasenya emmascarada |
| **Suprimeix** | Elimina el registre i la seva còpia de treball dins de `REPO_PATH`; només un administrador |

**Pull de tots**, a sobre de la llista, fa pull de tots els repositoris alhora.

En un repositori només s'executa una operació git alhora. Una segona es rebutja amb
`Repository '<name>' not found or already running, try again later`.

---

## Afegir un repositori

Fes clic a **Afegeix repositori**: un assistent demana els camps en quatre passos (**Repositori**, **Credencials**, **Ús**, **Programació
del pull**), i AnsibleForms comença el clonatge en segon pla tan bon punt deses.

![Edita el repositori](../assets/screenshots/git-edit.jpg)

| Camp | Obligatori | Significat |
|---|---|---|
| **Nom** | sí | El nom de la carpeta dins de `REPO_PATH`; lletres, dígits, guió, guió baix i punt |
| **Branca** | sí | La branca que es clona, de la qual es fa pull i a la qual es fa push, per exemple `main`; obligatòria a partir de la 7.3.0. Només un repositori del config seed la pot ometre, per clonar la branca per defecte del remot |
| **Credencial** | no | Una credencial de [Connexions > Credencials](../credentials.html) amb l'usuari i la contrasenya o el token que fa servir git; **Afegeix una credencial** en crea una |
| **URI** | sí | El remot, `https://...` o SSH (`git@git.example.com:team/forms.git`, `ssh://...`) |
| **Activa el pull programat** | no | Fa pull del repositori segons una programació |
| **Programació del pull** | no | Quan es fa el pull, com a expressió cron; es mostra un cop activat el pull programat |
| **Descripció** | sí | Una descripció en text lliure |
| **Utilitzar per a la configuració ?** ... **Fer servir per a inventaris?** | no | Què conté el repositori, vegeu [més amunt](./#what-a-repository-is-for) |
| **Fes pull en iniciar l'aplicació** | no | Clona el repositori, o en fa pull, cada vegada que s'inicia AnsibleForms |

Reanomenar un repositori mou la seva còpia de treball a la carpeta nova i també hi mou la seva programació de pull. Un repositori d'abans
de la 7 que encara té el seu propi usuari ho indica a la seva pestanya **Credencials**: tria una credencial per substituir-lo.

---

## Qui pot canviar un repositori

El contingut d'un repositori es converteix en el que AnsibleForms carrega i executa, així que a partir de la 7.3.0 un usuari sense el rol `admin` ja no pot:

- afegir o suprimir un repositori;
- canviar-ne l'**URI** o la **Branca**;
- activar o desactivar cap dels seus indicadors **Utilitzar per a**.

Encara en pot canviar la descripció, la programació del pull i la credencial, i en pot fer pull, push o restablir-lo. Una credencial que fa servir un runner,
una connexió o un inici de sessió no la pot triar; el rebuig l'anomena, i no diu res del que conté.

---

## Declarar repositoris al config seed

Els repositoris també es poden declarar al [config seed](../seed/), de manera que una instància nova els clona en la seva primera arrencada.

```yaml
repositories:
  items:
    - name: forms
      description: Forms and configuration
      uri: https://git.example.com/team/forms.git
      branch: main
      credential: git-bot
      use_for_forms: true
      use_for_config: true
      rebase_on_start: true
      cron: "*/15 * * * *"
```

Els camps són els de la pàgina, inclosos `credential` (una credencial del seed o de l'aplicació), `rebase_on_start` (**Fes pull en iniciar
l'aplicació**) i `cron` (la programació del pull); `user` i `password` encara s'accepten en lloc d'una credencial. Un
repositori del seed és de només lectura a la interfície, i es torna a clonar en arrencar quan falta la seva còpia de treball; vegeu
[Objectes gestionats](../seed/managed-objects.html).
