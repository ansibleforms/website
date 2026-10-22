---
layout: default
title: LDAP
parent: Autenticació
nav_order: 2
translated_from: a4089d681ad976e31e7ddefb29588bd3ca334dab
---

# LDAP
{: .no_toc }

Deixa que els usuaris del directori iniciïn sessió amb la seva pròpia contrasenya, i dona'ls rols a través dels seus grups del directori
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Com funciona

AnsibleForms es connecta al directori amb un compte de bind, cerca l'usuari i després fa bind com a aquest usuari per comprovar
la contrasenya:

1. L'usuari inicia sessió amb nom d'usuari i contrasenya. Quan cap usuari **local** no té aquest nom, es prova LDAP.
2. AnsibleForms fa bind amb el compte de bind de la credencial del directori, i cerca a la **Base de cerca** una entrada l'**Atribut del
   nom d'usuari** de la qual sigui igual al nom d'usuari.
3. Fa bind com a l'entrada trobada, amb la contrasenya que s'ha escrit.
4. Els grups es llegeixen de l'entrada (o d'una cerca de grups), es filtren i se'ls afegeix el prefix `ldap/`.

Un nom d'usuari en format UPN (`jdoe@example.com`) que no troba cap usuari es torna a provar una vegada amb la part anterior a l'`@`, de manera que els usuaris
poden iniciar sessió amb qualsevol de les dues formes encara que l'Atribut del nom d'usuari contingui el nom curt. Una contrasenya incorrecta no es torna a provar mai.

Una mateixa configuració serveix per a Active Directory, OpenLDAP i d'altres; des de la 7.3.0 hi pot haver [diversos directoris](#several-directories).

---

## Configuració

Des de la 7.3.0 la configuració és per directori. **Accés > LDAP** llista els directoris, en l'ordre en què es cerca un nom d'usuari sense directori:

![Accés > LDAP](../assets/screenshots/ldap.jpg)

| Menú de fila | Què fa |
|---|---|
| Edita | Obre la pàgina del directori |
| Prova la connexió | Prova un inici de sessió amb un nom d'usuari i una contrasenya de prova, vegeu [Provar la connexió](#testing-the-connection) |
| Activa, Desactiva | Activa o desactiva el directori; `main` es desactiva en lloc de suprimir-se |
| Puja, Baixa | Canvia el seu lloc a l'ordre de cerca |
| Suprimeix | Elimina el directori; es mostra però desactivat a `main` |

Afegir un directori en demana els camps en quatre passos, les pestanyes de la seva pàgina. **Detalls** conté **Activat**, el **Nom** i una **Descripció**:

| Pestanya | Ajust | Significat |
|---|---|---|
| Credencials | Credencial | Obligatori. Una credencial `ldap` de [Connexions > Credencials](../credentials.html), que conté la connexió, vegeu més avall |
| Usuaris | Base de cerca | DN on comença la cerca d'usuaris, p. ex. `OU=Users,DC=example,DC=com`. També es cerquen els subarbres |
| Usuaris | Atribut del nom d'usuari | Atribut que es compara amb el nom d'inici de sessió: `sAMAccountName` a AD (el predeterminat), `uid` a OpenLDAP |
| Usuaris | Atribut de correu | Atribut que conté l'adreça de correu, normalment `mail` |
| Usuaris | Dominis d'inici de sessió | Dominis els inicis de sessió `user@domain` dels quals van directament a aquest directori, vegeu [Diversos directoris](#several-directories) |
| Grups | Atribut de grups | Atribut de l'entrada de l'usuari que conté els grups (`memberOf`, el predeterminat), o `groups` amb una cerca de grups |
| Grups | Base de cerca de grups | DN on comença la cerca de grups |
| Grups | Classe de grup | objectClass dels grups, p. ex. `group`, `groupOfNames` o `posixGroup` |
| Grups | Atribut de membre del grup | Atribut d'un grup que llista els seus membres, p. ex. `member`, `uniqueMember` o `memberUid`; predeterminat `member` |
| Grups | Atribut d'usuari del membre del grup | Atribut de l'usuari que contenen aquests valors de membre, p. ex. `dn` o `uid`; predeterminat `dn` |
| Grups | Filtre de grups | Expressió regular; només es conserven els grups el nom dels quals coincideix. Buit conserva tots els grups |

Els valors predeterminats dels tres últims camps de grup només s'apliquen quan es fa servir la cerca de grups, vegeu la secció següent.

La credencial `ldap` conté com s'arriba al directori i amb quin compte s'hi cerca:

| Camp | Significat |
|---|---|
| Servidors | Un per camp, com a `host`, `host:port` o `ldaps://host:port`, provats en aquest ordre: quan no es pot arribar a un, es prova el següent |
| Port | `389` per a LDAP sense xifrar, `636` per a LDAPS |
| Activa TLS | Connectar amb LDAPS (`ldaps://`). StartTLS al port 389 no és compatible |
| Ignora els certificats | Omet la validació del certificat del servidor. Només es mostra amb **Activa TLS** |
| Certificat | El certificat de client que AnsibleForms presenta als servidors, en PEM, quan es comproven els certificats |
| Paquet de CA | El certificat o els certificats de CA que han signat el certificat del servidor, en PEM, quan es comproven els certificats |
| DN de l'usuari de bind | El DN del compte de servei que cerca al directori |
| Contrasenya de l'usuari de bind | La seva contrasenya, desada xifrada o llegida d'un [magatzem de secrets](../secret-stores/) |

Només un admin pot afegir o canviar una credencial `ldap`, vegeu [Qui pot canviar una credencial](../credentials.html#who-may-change-a-credential).
Fins a la 7.2.0 els servidors, el TLS i el compte de bind eren camps de la configuració LDAP. L'actualització a la 7.3.0 els trasllada a una credencial,
vegeu [Adreces a les credencials](../credentials/types.html#addresses-in-credentials):

| El directori abans de l'actualització | On van els seus servidors |
|---|---|
| El seu propi DN i contrasenya de bind, sense credencial | Una credencial `ldap` nova anomenada `<directory>-ldap`, com ara `main-ldap` |
| Una credencial sense servidors | A aquesta credencial |
| Una credencial que ja conté altres servidors | Una còpia de la credencial anomenada `<credential>-<directory>`, que el directori passa a nomenar |

Un nom que ja està agafat rep `-2`, `-3`, etc. Un directori de la llavor de configuració es deixa tal com està: la llavor n'és la propietària.

---

## Grups

Els grups vénen d'un de dos llocs, i l'**Atribut de grups** decideix quin es fa servir:

- **Un atribut de l'entrada de l'usuari**, normalment `memberOf`. És la configuració habitual per a Active Directory, i per a
  OpenLDAP amb l'overlay `memberof`.
- **Una cerca de grups**, per a directoris sense `memberOf`. Només s'executa quan **Base de cerca de grups** i **Classe de grup**
  estan tots dos definits: AnsibleForms cerca llavors grups d'aquesta classe l'**Atribut de membre del grup** dels quals contingui
  l'**Atribut d'usuari del membre del grup** de l'usuari, i desa el resultat a l'atribut `groups`. Posa **Atribut de grups** a `groups`
  per fer-la servir.

{: .note }
> Amb **Atribut de grups** `memberOf`, una cerca de grups configurada s'executa però el seu resultat no s'utilitza per als rols.

Cada grup és un DN, i AnsibleForms en conserva el primer CN: `CN=AF-Admins,OU=Groups,DC=example,DC=com` passa a ser `AF-Admins`.
Després s'aplica el **Filtre de grups** a aquest nom, i els grups que queden reben el prefix `ldap/`: `ldap/AF-Admins`.

En directoris grans el filtre manté petits els tokens i les tasques; una expressió regular no vàlida conserva tots els grups i es registra.

---

## Assignació a rols

A config.yaml, un grup LDAP és `ldap/<group CN>` i un usuari LDAP és `ldap/<username>`, tots dos distingeixen majúscules i minúscules:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - ldap/AF-Admins
  - name: operator
    groups:
      - ldap/AF-Operators
    users:
      - ldap/jdoe
```

El nom d'usuari és el valor de l'**Atribut del nom d'usuari** tal com el retorna el directori, no tal com l'ha escrit l'usuari.
Vegeu [Rols](../config/roles.html) per a les opcions dels rols.

---

## Diversos directoris

Des de la 7.3.0 hi pot haver diversos directoris, cadascun amb els seus propis servidors, usuaris i grups. Els seus noms distingeixen els seus membres:

| Directori | Nom d'usuari | Grups | En un rol |
|---|---|---|---|
| `main` | `jdoe` | `ldap/AF-Admins` | `ldap/jdoe`, `ldap/AF-Admins` |
| Qualsevol altre, com ara `corp` | `corp/jdoe` | `ldap/corp/AF-Admins` | `ldap/corp/jdoe`, `ldap/corp/AF-Admins` |

Un usuari nomena el directori en iniciar sessió com a `corp\jdoe` o `corp/jdoe`, o inicia sessió amb una adreça d'un domini que és
del directori. Un nom d'usuari sense directori es prova a cada directori activat, en el seu ordre, i també un nom com ara `other\jdoe` quan cap
directori no es diu `other`: llavors es cerca tal com s'ha escrit.

Decideix el primer directori que coneix l'usuari: una contrasenya incorrecta en aquest és la resposta, i el directori següent no es
prova, ja que podria contenir una altra persona amb aquest nom. Un directori al qual no es pot arribar s'omet.

El directori anomenat `default` fins a la 7.2.0 es diu `main` des de la 7.3.0: l'actualització el reanomena, i una instal·lació nova comença
amb `main`. Els seus membres conserven els seus noms curts, així que els rols que els nomenen no necessiten cap canvi. El directori `main` no es pot
reanomenar, i el nom d'un directori només conté lletres, xifres, `-` i `_`.

---

## Provar la connexió

**Prova la connexió** demana un nom d'usuari i una contrasenya de prova, i intenta un inici de sessió amb la configuració de la pantalla, desada o no.
Si funciona, mostra l'entrada de l'usuari al directori, que t'indica els noms exactes dels atributs i els DN dels grups que has de fer servir.

Un usuari de prova que no existeix també informa d'èxit: la connexió i el compte de bind funcionen, només que l'usuari no es
troba. Errors habituals:

| Missatge | Causa |
|---|---|
| `Bad server or port (connection failed)` | El nom de host no es resol o no es pot arribar al port. |
| `Wrong binding credentials` | El DN o la contrasenya de bind de la credencial del directori són incorrectes. |
| `Unable to verify the certificate` | El certificat del servidor no està signat pel Paquet de CA de la credencial. |
| `Certificate is not valid` | El Certificat o el Paquet de CA de la credencial no contenen un certificat PEM vàlid. |

---

## Exemple amb Active Directory

Aquest exemple es connecta a dos controladors de domini per LDAPS i només conserva els grups el nom dels quals comença per `AF-`:

| Ajust | Valor |
|---|---|
| Credencial > Servidors | `dc01.example.com`, i després `dc02.example.com` |
| Credencial > Port | `636` |
| Credencial > Activa TLS | activat |
| Credencial > Ignora els certificats | desactivat, amb un certificat de client i la cadena de CA de la CA de l'empresa |
| Credencial > DN de l'usuari de bind | `CN=svc-ansibleforms,OU=Service Accounts,DC=example,DC=com` |
| Base de cerca | `OU=Users,DC=example,DC=com` |
| Atribut de correu | `mail` |
| Atribut del nom d'usuari | `sAMAccountName` |
| Atribut de grups | `memberOf` |
| Filtre de grups | `^AF-` |

Els membres de `CN=AF-Operators,…` coincideixen amb els rols que fan servir `ldap/AF-Operators`, i inicien sessió com a `jdoe` o `jdoe@example.com`.

---

## Exemple amb OpenLDAP

Aquest exemple fa servir una cerca de grups sobre entrades `groupOfNames`, així que funciona sense l'overlay `memberof`:

| Ajust | Valor |
|---|---|
| Credencial > Servidors | `ldap.example.com` |
| Credencial > Port | `636` |
| Credencial > Activa TLS | activat |
| Credencial > DN de l'usuari de bind | `cn=readonly,dc=example,dc=com` |
| Base de cerca | `ou=people,dc=example,dc=com` |
| Atribut de correu | `mail` |
| Atribut del nom d'usuari | `uid` |
| Atribut de grups | `groups` |
| Base de cerca de grups | `ou=groups,dc=example,dc=com` |
| Classe de grup | `groupOfNames` |
| Atribut de membre del grup | `member` |
| Atribut d'usuari del membre del grup | `dn` |

Un usuari llistat a `cn=af-admins,ou=groups,dc=example,dc=com` rep el grup `ldap/af-admins`. Per a grups `posixGroup`,
fes servir **Atribut de membre del grup** `memberUid` i **Atribut d'usuari del membre del grup** `uid`.

Amb l'overlay `memberof`, deixa buits els camps de cerca de grups i posa **Atribut de grups** a `memberOf`.

---

## Errors habituals

La majoria dels problemes amb LDAP es redueixen a un d'aquests:

- **Un usuari local amb el mateix nom.** Els usuaris locals es comproven primer, així que mai no es consulta el directori per a aquest nom.
- **Cap grup, o grups equivocats.** L'Atribut de grups ha d'existir (`groups` amb una cerca de grups); `memberOf` no segueix els grups niats.
- **Noms de grup que no coincideixen.** Fes servir `ldap/<CN>` amb les mateixes majúscules i minúscules, i comprova que el Filtre de grups conserva el grup.
- **DN de grup que no comencen per un CN.** Només s'utilitza el primer valor `CN=` com a nom del grup, així que tots els DN de grup
  han de començar per `CN=` (o `cn=`).
- **Certificats.** El TLS necessita els dos camps de certificat de la credencial i un nom de servidor que coincideixi; Ignora els certificats és només per a proves.
- **Una configuració que no es pot desar.** Quan un directori ve de la [llavor de configuració](../seed/managed-objects.html), la seva pàgina
  és només de lectura: canvia el fitxer de la llavor.

Un inici de sessió fallit mostra un missatge genèric. El servidor en registra el motiu i el conserva al registre d'auditoria, i per a Active
Directory es tradueix a partir del codi del directori, p. ex. `Wrong password`, `Account locked` o `Password expired`.
