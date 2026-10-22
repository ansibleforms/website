---
layout: default
title: PMF de l'avaluació
nav_order: 6
translated_from: 731a656c844e6262715e5c8d0a7a291e3b6321f2
---

# PMF de l'avaluació
{: .no_toc }

Respostes breus a les preguntes que més fan els qüestionaris de seguretat
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Dades i allotjament

On són les dades, i qui hi pot accedir:

| Pregunta | Resposta |
|---|---|
| On es desen les nostres dades? | A la base de dades MySQL o MariaDB que gestiones tu, i a la carpeta persistent de la teva instància. AnsibleForms és autoallotjat, sense cap servei al núvol al darrere. |
| Envia dades als seus creadors? | No. No hi ha telemetria, ni informes d'ús, ni comprovació d'actualitzacions. |
| A què es connecta? | Només als sistemes que configura un administrador: vegeu [Connexions sortints](measures.html#outbound-connections). |
| Fa servir IA o envia dades a un proveïdor de models? | Només amb l'[assistent de xat](../chat/) activat, que per defecte està desactivat. Llavors envia les definicions dels formularis i els valors que s'estan omplint al proveïdor que configuris. |
| Pot funcionar sense accés a internet? | Sí. L'aplicació no necessita accés a internet; els playbooks necessiten el que facin servir les seves tasques. |

---

## Xifratge

Què es xifra, i amb quines claus:

| Pregunta | Resposta |
|---|---|
| Les dades es xifren en trànsit? | Amb [HTTPS](../security/https.html), servit per l'aplicació o pel teu proxy invers, i amb `wss://` entre l'aplicació i els seus entorns d'execució. |
| Les dades es xifren en repòs? | L'aplicació xifra tots els secrets desats amb AES-256. Les tasques i la seva sortida es desen tal com són: fes servir el xifratge en repòs de la mateixa base de dades. Vegeu [Secrets desats](measures.html#stored-secrets). |
| Qui té les claus? | Tu: el [`ENCRYPTION_SECRET`](../security/secrets.html) el defineixes tu, es manté fora de les còpies de seguretat i es pot rotar. |
| Els secrets es poden quedar al nostre vault? | Sí: [HashiCorp Vault i CyberArk](../secret-stores/) es llegeixen quan una tasca els necessita. |

---

## Accés i traçabilitat

Qui pot iniciar la sessió, què pot fer i què queda registrat:

| Pregunta | Resposta |
|---|---|
| Admet l'inici de sessió únic? | Sí: LDAP / Active Directory, OpenID Connect i Entra ID. Vegeu [Autenticació](../authentication/). |
| Admet l'autenticació multifactor? | A través de l'inici de sessió únic: s'aplica l'MFA del teu proveïdor d'identitat. Els comptes locals no en tenen de pròpia. |
| Com es gestionen els permisos? | Amb rols assignats a grups, que el servidor comprova a cada petició. Vegeu [Permisos](measures.html#permissions). |
| Hi ha un registre d'auditoria? | Sí: cada canvi i cada intent rebutjat, conservats 365 dies per defecte i reenviables a syslog. Vegeu [Registre d'auditoria](measures.html#audit-trail). |
| Hi ha una contrasenya per defecte? | El primer compte d'administrador té una contrasenya per defecte pública, que s'ha de canviar al primer inici de sessió. Vegeu [El compte d'administrador](../security/hardening.html#the-admin-account). |

---

## Vulnerabilitats i actualitzacions

Com es troben, es corregeixen i s'anuncien els problemes:

| Pregunta | Resposta |
|---|---|
| S'hi han trobat vulnerabilitats? | Sí. Totes les publicades apareixen a [Avisos de seguretat](advisories.html), amb la versió que les va corregir. |
| Com en comuniquem una? | En privat, a través de GitHub: vegeu [Comunicar una vulnerabilitat](reporting.html). |
| Com es comprova el codi? | Anàlisi estàtica amb CodeQL i revisió de dependències a cada pull request, proves automatitzades i actualitzacions de Dependabot. Vegeu [Desenvolupament segur](development.html). |
| Quines versions reben correccions de seguretat? | 7.x i 6.5.x. Vegeu [Versions amb suport](development.html#supported-versions). |
| Com ens assabentem d'un avís nou? | Seguint les alertes de seguretat del repositori a GitHub. Vegeu [Rebre avís dels nous avisos](advisories.html#being-told-of-new-advisories). |
| S'hi ha fet una prova de penetració? | No hi ha publicat cap informe de prova de penetració de tercers. El codi és públic, de manera que el teu propi equip o auditor el pot avaluar, i les troballes es comuniquen com s'ha dit més amunt. |

---

## Imatges i cadena de subministrament

D'on surten les imatges, i com comprovar-les:

| Pregunta | Resposta |
|---|---|
| On es publiquen les imatges? | Al GitHub Container Registry, `ghcr.io/ansibleforms/ansibleforms`, construïdes per workflows públics de GitHub Actions. Vegeu [Versions i imatges](development.html#releases-and-images). |
| Els contenidors s'executen com a root? | No: com l'usuari sense privilegis `node`. |
| Les imatges estan signades? | Encara no. Descarrega-les per digest (`@sha256:...`) per assegurar-te que executes la imatge que has revisat. |
| Hi ha un SBOM? | Encara no se'n publica cap amb les imatges. Un escàner com Trivy o Syft en construeix un a partir de la imatge. |
| Les imatges s'analitzen per detectar vulnerabilitats? | No al pipeline de publicació. Les seves imatges base estan fixades per digest i Dependabot les manté al dia; analitza les imatges al teu propi registre per aplicar la teva pròpia política. |
| Amb quina llicència es distribueix? | GPL-3.0, codi obert, sense garantia. |
