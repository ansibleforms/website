---
layout: default
title: Mesures de seguretat
nav_order: 2
translated_from: 1ceeb1a74d9235a43a8600d8bf7e0a39015a124a
---

# Mesures de seguretat
{: .no_toc }

Com es protegeixen l'inici de sessió, els permisos, els secrets i les connexions
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## On s'executa

AnsibleForms és autoallotjat, a la teva infraestructura, amb les dades en una base de dades que gestiones tu.

* No hi ha cap servei al núvol d'AnsibleForms ni cap servidor de llicències, ni telemetria ni comprovació d'actualitzacions.
* La interfície la serveix la mateixa aplicació i no carrega res d'un altre lloc.
* L'aplicació només es connecta als sistemes que configura un administrador, que es recullen a [Connexions sortints](#outbound-connections).

Les parts i què conté cadascuna:

| Part | Què fa | Què conté |
|---|---|---|
| Aplicació | La interfície web, l'API REST, el planificador | Cap dada pròpia: tot és a la base de dades |
| MySQL o MariaDB | La base de dades de l'aplicació | Usuaris, grups, credencials (xifrades), tasques amb les seves extravars i la seva sortida, el registre d'auditoria |
| Entorn d'execució (RTE) | Executa els playbooks, en el seu propi contenidor | Els fitxers de les tasques que executa, i els secrets d'una tasca només mentre aquesta s'executa |
| Carpeta persistent | La configuració, els formularis, els playbooks i les pujades | Els fitxers que fan servir els formularis i els playbooks |

Consulta [Com funciona](../how-it-works.html) per veure el conjunt, i [RTE](../rte/) per a l'entorn d'execució.

---

## Inici de sessió

Cada pàgina i cada crida a l'API que llegeix o canvia dades necessita un usuari que hagi iniciat la sessió. Els pocs punts finals oberts sense sessió serveixen
el mateix inici de sessió, la versió, el nom i el logotip de la instància, la documentació de l'API i la configuració de la base de dades d'una primera arrencada,
que [`ALLOW_SCHEMA_CREATION`](../security/hardening.html#the-database)`=0` tanca:

| Mètode | Com funciona |
|---|---|
| Comptes locals | Contrasenyes amb hash bcrypt, una [longitud mínima](../security/hardening.html#sign-in-limits-and-passwords), i la contrasenya per defecte pública de l'administrador s'ha de canviar al primer inici de sessió |
| LDAP / Active Directory | El directori comprova la contrasenya, i els seus grups s'assignen a rols. Vegeu [LDAP](../authentication/ldap.html) |
| OpenID Connect, Entra ID | Inici de sessió únic a través del teu proveïdor d'identitat, que també aporta la seva pròpia autenticació multifactor. Vegeu [Autenticació](../authentication/) |

* Els inicis de sessió fallits [bloquegen el compte](../security/hardening.html#sign-in-limits-and-passwords), i l'inici de sessió té un límit de freqüència.
* Un inici de sessió retorna un token d'accés signat vàlid durant 30 minuts i un token de renovació vàlid durant 24 hores.
* Els tokens es poden invalidar abans que caduquin: tancar la sessió, canviar la contrasenya, bloquejar un usuari i revocar un token d'API els invaliden a
  tots els nodes alhora, vegeu [Tokens](../security/secrets.html#tokens).
* AnsibleForms no té autenticació multifactor pròpia: fes servir l'inici de sessió únic allà on sigui necessària.

---

## Permisos

El que pot fer un usuari surt dels rols dels seus grups, i el servidor ho comprova a cada petició:

* Els rols es defineixen a [config.yaml](../config/roles.html): quins formularis veu un usuari i quines opcions té,
  com ara el dissenyador, les pàgines de configuració o les tasques d'altres usuaris.
* El servidor comprova cada llançament amb les regles del formulari (els seus camps, els seus valors i l'accés de l'usuari), inclosos
  els llançaments a través de l'API REST, vegeu [Validació del llançament](../launch-validation/).
* Per disseny, el rol d'administrador executa qualsevol playbook. Els altres rols només obtenen el que se'ls concedeix: un usuari amb diversos rols obté una
  opció només quan cap d'aquests rols no la denega, de manera que n'hi ha prou amb un rol restrictiu per retirar-la.

---

## Secrets desats

Les contrasenyes, els tokens i les claus es xifren abans d'escriure's a la base de dades:

* Tots els secrets desats (credencials, la contrasenya de vinculació LDAP, els tokens dels runners, els secrets de client de l'inici de sessió únic, les adreces
  dels webhooks i les claus d'API) es xifren amb AES-256 i un vector d'inicialització aleatori per a cada valor, sota el
  [`ENCRYPTION_SECRET`](../security/secrets.html#the-two-master-secrets) que defineixes tu.
* Cap crida a l'API ni cap pàgina de configuració no mostra un secret desat, i les còpies de seguretat ometen els secrets mestres.
* Els secrets es poden quedar al teu vault: [HashiCorp Vault i CyberArk](../secret-stores/) es llegeixen quan una tasca els necessita.
* Els secrets d'una tasca arriben a l'entorn d'execució segellats amb AES-256-GCM, amb una clau derivada del seu token.
* Les extravars el nom de les quals sembla un secret s'emmascaren a la vista de la tasca, i els camps de contrasenya sempre, vegeu [Dades de les tasques](../security/hardening.html#job-data).

La resta de la base de dades (les tasques, les seves extravars i la seva sortida) es desa tal com és: protegeix-la amb el xifratge en repòs
i el control d'accés de la mateixa base de dades, vegeu [La base de dades](../security/hardening.html#the-database).

---

## Registre d'auditoria

Cada canvi, i cada intent que es rebutja, queda registrat:

* Cada creació, canvi i eliminació, a través de la interfície o de l'API, s'escriu al registre d'auditoria amb l'usuari, la seva
  adreça, l'acció, l'objecte i el resultat. També es registren els rebuigs i els inicis de sessió, inclosos els fallits.
* Els valors que semblen secrets s'oculten abans d'escriure's.
* El registre es conserva 365 dies per defecte, i es pot copiar a syslog per UDP, TCP o TLS.

---

## Al navegador

La interfície està protegida contra el codi injectat en una pàgina:

* Una [Content-Security-Policy](../security/hardening.html#the-content-security-policy) només permet els scripts i els frames propis de l'aplicació.
* Cada resposta porta capçaleres de protecció: nosniff, protecció de frames i HSTS sobre HTTPS.
* L'HTML dels formularis, dels textos d'ajuda i de les respostes del xat se saneja, i la sortida de les tasques s'escapa.

---

## Al servidor

El codi que gestiona l'entrada dels usuaris evita les injeccions clàssiques:

* Les consultes a la base de dades passen els valors com a paràmetres, mai com a text enganxat a la consulta.
* Les ordres, git inclòs, s'executen a partir d'una llista d'arguments, mai amb un shell, de manera que els caràcters de shell no fan res.
* Les expressions de servidor passen per un [sanejador d'expressions](../security/hardening.html#expressions-and-outbound-calls), i les seves crides REST, per un filtre d'amfitrions.
* El [servidor MCP](../mcp/), l'[assistent de xat](../chat/) i el punt final de mètriques estan desactivats fins que els activis.

---

## Connexions

El trànsit cap a AnsibleForms i des d'AnsibleForms es pot xifrar d'extrem a extrem:

* L'aplicació serveix [HTTPS](../security/https.html) ella mateixa, o es posa darrere del teu proxy invers.
* Un entorn d'execució parla amb l'aplicació per un WebSocket, `wss://` amb una adreça HTTPS, i l'aplicació
  fixa el certificat d'un d'entrant, vegeu [Modes de l'RTE](../rte/modes.html).
* LDAP, l'inici de sessió únic, els runners, git, els magatzems de secrets i les crides REST de les expressions comproven el certificat del
  servidor al qual es connecten, tret que un administrador desactivi la comprovació per a un servidor amb un certificat autosignat.

### Connexions sortints

AnsibleForms només es connecta al que configura un administrador:

| Connexió | Quan |
|---|---|
| LDAP, OpenID Connect, Entra ID (inici de sessió de Microsoft i Graph) | Quan es configura aquest mètode d'inici de sessió |
| AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins | Quan un formulari s'executa en aquest runner |
| Servidors git | Quan es configura un repositori |
| Servidor de correu, Slack, Teams, Telegram, webhooks | Quan es configura un canal de notificació |
| HashiCorp Vault, CyberArk | Quan es configura un magatzem de secrets |
| Un proveïdor de models (Anthropic, OpenAI i altres) | Només amb l'[assistent de xat](../chat/) activat, que per defecte està desactivat |
| Amfitrions i API indicats als formularis | Quan les expressions d'un formulari o un playbook els criden |
| Servidors syslog | Quan es configura el reenviament de l'auditoria o dels registres |

---

## Els contenidors

Les imatges estan construïdes per funcionar amb els mínims privilegis possibles:

* L'aplicació i l'entorn d'execució s'executen com l'usuari sense privilegis `node`, no com a root.
* Estan construïdes sobre imatges Debian slim fixades per digest, vegeu [Desenvolupament segur](development.html#code-analysis-and-dependencies).
* L'aplicació escolta en un sol port, el 8000.

Per als passos que protegeixen una instància nova, segueix [Enduriment](../security/hardening.html).
