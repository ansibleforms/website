---
layout: default
title: Fehlerbehebung
nav_order: 4
translated_from: b7b3f3dfe9b603afe24b167dcc2fc117601638d5
---

# Fehlerbehebung
{: .no_toc }

Fehlermeldungen und Symptome, warum sie auftreten und wie Sie sie beheben
{: .fs-6 .fw-300 }

---

Jedes der folgenden Probleme ist mit der Meldung oder dem Symptom überschrieben, das Sie sehen, gefolgt von der Ursache und der Lösung. Meldungen sind
genau so zitiert, wie AnsibleForms sie schreibt; `<name>` steht für einen Wert, der sich von Fall zu Fall unterscheidet. Die meisten landen im
Serverprotokoll, das Sie unter [Serverprotokoll](gui/administration.html#server-log) oder mit `docker logs` lesen können.

**Datenbank und Start**

* [Mysql not ready yet](#mysql-not-ready-yet)
* [Schema is not ready, skipping group and user initialization](#schema-is-not-ready-skipping-group-and-user-initialization)
* [Schema creation is disabled](#schema-creation-is-disabled)
* [Config seed failed, refusing to start](#config-seed-failed-refusing-to-start)
* [ENCRYPTION_SECRET is not set](#encryption_secret-is-not-set)

**Konfiguration und Formulare**

* [Could not load the forms](#could-not-load-the-forms)
* [Die Basiskonfiguration hat einen Abschnitt forms](#the-base-config-has-a-forms-section)
* [Ein Formular fehlt im Dashboard](#a-form-is-missing-from-the-dashboard)
* [Could not save the forms](#could-not-save-the-forms)
* [The editor is read-only](#the-editor-is-read-only)
* [Abuse attempt of eval function](#abuse-attempt-of-eval-function)
* [Destination is not in REST_ALLOWED_HOSTS](#destination-is-not-in-rest_allowed_hosts)

**Anmeldung**

* [Authentication failed: Invalid credentials](#authentication-failed-invalid-credentials)
* [LDAP check failed](#ldap-check-failed)
* [Die Authentifizierung über Azure AD oder OIDC schlägt fehl](#azure-ad-or-oidc-authentication-failed)
* [Not authenticated, login is not enabled for this user](#not-authenticated-login-is-not-enabled-for-this-user)
* [Abgemeldet nach einem Neustart oder nach einem Tag](#logged-out-after-a-restart-or-after-a-day)
* [Leere Formulare und Jobs nach einem Single Sign-On (HTTP 431)](#empty-forms-and-jobs-after-a-single-sign-on-http-431)

**Jobs**

* [Playbook failed with status](#playbook-failed-with-status)
* [Playbook was aborted by the main process](#playbook-was-aborted-by-the-main-process)
* [Failed to launch awx template](#failed-to-launch-awx-template)
* [Ein Job zeigt den Status abandoned](#a-job-shows-the-status-abandoned)
* [Eine RTE verbindet sich nicht](#an-rte-does-not-connect)
* [The form data is not valid](#the-form-data-is-not-valid)

**Git-Repositories und Backups**

* [Klonen oder Pull eines Repositorys schlägt fehl](#a-repository-clone-or-pull-failed)
* [Das Formular-Repository ist noch nicht geklont](#the-forms-repository-is-not-cloned-yet)
* [Ein Backup schlägt fehl](#a-backup-failed)

Die [FAQ](faq.html) behandelt zwei verwandte Probleme ausführlich: ein
[verlorenes Admin-Passwort](faq.html#recovering-a-lost-admin-password) und das
[Einschränken der Ziele von REST-Hilfsfunktionen](faq.html#restricting-rest-helper-destinations-allowdeny-lists).

---

## Mysql not ready yet

AnsibleForms startet nicht, und das Protokoll wiederholt diese Zeilen alle 5 Sekunden:

```
Waiting for mysql to start
[ansibleforms] Query error : Error: <reason>
Mysql not ready yet
```

**Warum das passiert**

Beim Start wartet AnsibleForms, bis die Datenbank eine Abfrage beantwortet, und wartet so lange weiter, wie sie das nicht tut.
`<reason>` ist die eigene Meldung des Datenbanktreibers: eine abgelehnte oder abgelaufene Verbindung deutet auf den Host oder den Port,
eine Meldung über verweigerten Zugriff auf den Benutzernamen oder das Passwort.

**Wie Sie es beheben**

Prüfen Sie [`DB_HOST`](customization/server.html#env_DB_HOST), [`DB_PORT`](customization/server.html#env_DB_PORT),
[`DB_USER`](customization/server.html#env_DB_USER) und [`DB_PASSWORD`](customization/server.html#env_DB_PASSWORD).
Innerhalb eines Containers ist `localhost` der Container selbst, nicht der Host, auf dem MySQL läuft. Stellen Sie sicher, dass MySQL
auf einer Netzwerkadresse lauscht und dass sich der Benutzer vom AnsibleForms-Host aus verbinden darf. AnsibleForms macht von selbst weiter, sobald
die Datenbank antwortet; ein Neustart ist nicht nötig.

---

## Schema is not ready, skipping group and user initialization

Der Browser öffnet statt der Anmeldeseite eine Datenbankseite, und das Protokoll zeigt:

```
Schema is not ready, skipping group and user initialization
Please create the schema via the /schema endpoint
```

**Warum das passiert**

Das Schema `AnsibleForms` fehlt oder ist unvollständig. Eine *leere* Datenbank wird beim Start automatisch eingerichtet, sofern
[`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) nicht `0` ist. Scheitert das, zum Beispiel weil
der Datenbankbenutzer kein Schema anlegen darf, meldet das Protokoll `Failed to create the schema automatically : <reason>`. Ein Schema,
das existiert, aber dem Tabellen fehlen (`Table '<name>' is not present`), wird nie automatisch neu angelegt, denn das Anlegen des
Schemas löscht zuerst jede Tabelle. Die Datenbankseite sagt dann *It appears that you have an unuseable schema*.

**Wie Sie es beheben**

Geben Sie bei einer Neuinstallation dem Datenbankbenutzer das Recht, das Schema `AnsibleForms` anzulegen, und starten Sie neu, oder drücken Sie
**Erstellen** auf der Datenbankseite. Bei einem nur teilweise vorhandenen Schema stellen Sie ein Backup wieder her oder entfernen das unvollständige Schema
`AnsibleForms`, damit AnsibleForms es neu anlegen kann. Das Protokoll listet auf, welche Tabellen und Patches fehlgeschlagen sind.

---

## Schema creation is disabled

Das Anlegen des Schemas, über die Datenbankseite oder mit `POST /api/v2/schema`, schlägt fehl mit:

```
Schema creation is disabled
```

**Warum das passiert**

[`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) ist `0`, was sowohl das automatische
Anlegen beim Start als auch den Endpunkt abschaltet. Auf einer Datenbank, die bereits Benutzer hat, lehnt der Endpunkt außerdem Aufrufer ab, die nicht
als Administrator angemeldet sind, mit `Schema creation requires an authenticated administrator`.

**Wie Sie es beheben**

Legen Sie das Schema einmal mit `ALLOW_SCHEMA_CREATION=1` an (das ist der Standard) oder stellen Sie es aus einem Backup wieder her, und setzen Sie die
Variable dann wieder auf `0`. Melden Sie sich auf einer eingerichteten Datenbank als Administrator an, bevor Sie das Schema neu anlegen, und denken Sie daran,
dass dabei jede Tabelle gelöscht und neu angelegt wird.

---

## Config seed failed, refusing to start

Der Container beendet sich direkt nach dem Start, und seine Ausgabe endet mit:

```
Config seed failed, refusing to start : <reason>
```

**Warum das passiert**

Die Datei in [`CONFIG_SEED_PATH`](customization/configuration.html#env_CONFIG_SEED_PATH) ließ sich nicht anwenden: sie ist zum Beispiel kein gültiges
YAML oder verletzt das Seed-Schema; `<reason>` sagt, was schiefgelaufen ist. AnsibleForms verweigert lieber den Start, als
mit der Hälfte seiner deklarierten Objekte zu laufen. Der Grund wird auch auf die Standardfehlerausgabe geschrieben, daher zeigen ihn `docker logs` und `kubectl logs`.

**Wie Sie es beheben**

Korrigieren Sie, was `<reason>` nennt, und starten Sie erneut. Siehe [Neu laden und Start](seed/reloading.html) dazu, wie der Seed
angewendet wird, und [Beispiel](seed/example.html) für eine gültige Datei.

---

## ENCRYPTION_SECRET is not set

Jeder Start protokolliert diese Warnung:

```
[SECURITY] ENCRYPTION_SECRET is not set. Stored passwords are encrypted with the default key, which is public in the source code. Set ENCRYPTION_SECRET: the stored ones are re-encrypted with it on the next start.
```

Oder der Worker verweigert den Start mit:

```
[SECURITY] The stored secrets were encrypted with a key that is not ENCRYPTION_SECRET: set ENCRYPTION_SECRET_PREVIOUS to the key they were encrypted with, and they are re-encrypted with ENCRYPTION_SECRET on the next start. Nothing was changed.
```

**Warum das passiert**

Gespeicherte Secrets werden mit [`ENCRYPTION_SECRET`](customization/security.html#env_ENCRYPTION_SECRET) verschlüsselt: seit 7.3.0 liegen sie in
Anmeldedaten (unter anderem die Passwörter und Tokens von LDAP-Verzeichnissen, SSO-Anbietern, Runnern und Secret Stores), neben den Adressen der Slack-
und Teams-Webhooks. Ohne es wird ein Schlüssel verwendet, der im Quellcode öffentlich ist. Seit 7.3.0 verschlüsselt ein Start mit einem neuen
`ENCRYPTION_SECRET` jedes gespeicherte Secret damit neu, in einer Transaktion: vom Standardschlüssel, wenn es zum ersten Mal gesetzt wird,
oder von [`ENCRYPTION_SECRET_PREVIOUS`](customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS), wenn es sich ändert. Wenn die
gespeicherten Secrets mit keinem von beiden verschlüsselt wurden, wird nichts geändert, und AnsibleForms startet nicht.

**Wie Sie es beheben**

Setzen Sie `ENCRYPTION_SECRET` und bewahren Sie es bei Ihren anderen Secrets auf: Backups enthalten es nie. Der nächste Start protokolliert
`[SECURITY] Re-encrypted <n> stored secrets from the default key with ENCRYPTION_SECRET`. Um es später zu ändern, setzen Sie für einen Start den neuen Wert in
`ENCRYPTION_SECRET` und den alten in `ENCRYPTION_SECRET_PREVIOUS` und entfernen Sie dann `ENCRYPTION_SECRET_PREVIOUS`. Wenn der
Worker den Start verweigert, setzen Sie `ENCRYPTION_SECRET_PREVIOUS` auf den Schlüssel, mit dem die Secrets verschlüsselt wurden, oder setzen Sie den alten Wert zurück.

---

## Could not load the forms

Das Dashboard zeigt keine Formulare und meldet:

```
Could not load the forms.

Failed to get forms list

<reason>
```

**Warum das passiert**

Die Basiskonfiguration (`config.yaml`) ließ sich nicht lesen oder ist nicht gültig. `<reason>` sagt, was davon:

| Grund | Ursache |
|--------|-------|
| `Error parsing the base config, it's not valid yaml. : <error>` | Ein YAML-Syntaxfehler |
| `The base config has no content. It must be a yaml mapping holding at least 'categories' and 'roles'.` | Eine leere Datei oder eine mit nur Kommentaren |
| `Duplicate role name(s) : <names>. Each role must appear once.` | Dieselbe Rolle ist zweimal definiert |
| `There is no config.yaml nor could one be created from template.` | `config.yaml` fehlt, und ihr Ordner ist nicht beschreibbar |
| `There is no forms directory nor could there be one created from template.` | Der Formularordner fehlt und lässt sich nicht anlegen |
| Jede andere Zeile | Die Konfiguration verletzt das Schema, zum Beispiel eine Rolle ohne `groups` |

**Wie Sie es beheben**

Korrigieren Sie die Datei, die [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) nennt, oder die `config.yaml` im
Repository, das für die Konfiguration verwendet wird. Wenn Dateien fehlen, lassen Sie [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) und
[`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) auf einen beschreibbaren, persistenten Ort zeigen. Siehe
[config.yaml](config/) für die Struktur.

---

## Die Basiskonfiguration hat einen Abschnitt forms

Nach einer Aktualisierung von 6.x ist das Dashboard leer, und der Warnungsbereich zeigt:

```
The base config has a 'forms' section. Since 7.0.0 forms are no longer read from the base config - move each form to its own file in the forms folder (FORMS_FOLDER_PATH).
```

**Warum das passiert**

Seit 7.0.0 liegt jedes Formular in einer eigenen Datei im Formularordner. Formulare, die noch in `config.yaml` aufgeführt sind, werden
ignoriert.

**Wie Sie es beheben**

Verschieben Sie jedes Formular in eine eigene Datei in [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH). Siehe
[Auf 7.x aktualisieren](upgrade-7.html).

---

## Ein Formular fehlt im Dashboard

Eine Formulardatei existiert, aber ein Benutzer sieht das Formular nicht im Dashboard.

**Warum das passiert**

Ein Benutzer sieht ein Formular nur, wenn eine der `roles` des Formulars eine seiner Rollen ist; Admins sehen jedes Formular. Jeder Benutzer hat
die Rolle `default`, daher ist ein Formular mit `roles: [default]` für alle sichtbar. Die Rollen eines Benutzers kommen aus den Gruppen und Benutzern,
die unter `roles` in `config.yaml` aufgeführt sind. Ein Formular ohne `categories` erscheint unter **Default**, fehlt also in den
anderen Kategorien, ist aber weiterhin unter **Alle Formulare** aufgeführt. Schließlich wird ein Formular, das die Validierung nicht besteht, übersprungen. Das
Dashboard zeigt dann eine Schaltfläche **Diese Konfiguration hat Warnungen oder Fehler**, die Meldungen wie diese öffnet:

```
Failed to validate form '<name>'.
skipping duplicate form <name>
Form found with no name.
```

**Wie Sie es beheben**

Öffnen Sie den Warnungsbereich und korrigieren Sie, was er auflistet. Prüfen Sie die Rollen des Benutzers unter
[Berechtigungen](profile/permissions.html) im Profil sowie die `roles` und `categories` des Formulars. Siehe
[Rollen](config/roles.html) und [Kategorien](config/categories.html). Wenn zwei Dateien denselben Formularnamen definieren,
gewinnt die zuerst geladene.

---

## Could not save the forms

Das Speichern im Designer schlägt fehl mit:

```
Could not save the forms.

Failed to save forms

<messages>
```

**Warum das passiert**

Der Designer validiert jedes Formular gegen das Schema, bevor er irgendetwas schreibt. Jede Zeile von `<messages>` nennt das
Formular und das Feld, die eine Regel verletzen. Für in 7.0.0 entfernte Optionen gibt es eine eigene Meldung, zum Beispiel
`Field '<name>' : the table field was removed in 7.0.0, see https://ansibleforms.com/upgrade-7 - use a list field with a subform`.

**Wie Sie es beheben**

Korrigieren Sie die Felder, die die Meldungen nennen. Für Optionen, die 7.0.0 entfernt hat, folgen Sie [Auf 7.x aktualisieren](upgrade-7.html).
Um Formulardateien zu validieren, bevor sie AnsibleForms erreichen, siehe
[VS-Code-Validierung für Formulardateien](faq.html#vs-code-validation-for-form-files) in der FAQ.

---

## The editor is read-only

Der Designer zeigt **Gesperrt** mit dem Namen eines anderen Benutzers, und das Speichern schlägt fehl mit:

```
The editor is read-only
```

**Warum das passiert**

Nur eine Person gleichzeitig kann die Formulare bearbeiten. Die Sperre wird gesetzt, wenn jemand den Designer startet, und bleibt bestehen, bis
er ihn stoppt, auch wenn er den Browser geschlossen hat, ohne ihn zu stoppen. Die API lehnt ein Speichern durch jemand anderen mit
`Designer is locked by <username>` ab.

**Wie Sie es beheben**

Bitten Sie `<username>`, den Designer zu stoppen. Wenn das nicht möglich ist, verwenden Sie **Force Unlock** im Designer. Wer die
Sperre hält, verliert die Änderungen, die er noch nicht gespeichert hat.

---

## Abuse attempt of eval function

Ein Ausdrucksfeld zeigt einen Fehler, und das Protokoll hat eine Zeile wie:

```
Error in expression : Error: Abuse attempt of eval function, using custom functions, try runLocal
```

**Warum das passiert**

Serverseitige Ausdrücke werden geprüft, bevor sie laufen. Sie dürfen nur `fn.`- und `fnc.`-Funktionen aufrufen; mehrere Anweisungen,
mehrere Zeilen, Template-Literale, `process.env` und Wörter wie `require` oder `constructor` werden abgelehnt. Die Meldung
sagt, welche Regel verletzt wurde. Mit [`EXPRESSION_SANITIZER`](customization/security.html#env_EXPRESSION_SANITIZER) auf
`off` schlägt jeder Server-Ausdruck fehl mit
`Server expressions are disabled (EXPRESSION_SANITIZER=off), use runLocal`.

**Wie Sie es beheben**

Schreiben Sie den Ausdruck als einen einzigen `fn.`-Aufruf oder eine einfache Operation um, oder führen Sie ihn mit `runLocal: true` im Browser aus. Siehe
[Ausdrücke](expressions/) und [Lokale Ausdrücke](expressions/local.html).

---

## Destination is not in REST_ALLOWED_HOSTS

Ein Feld, das eine REST-API aufruft, bleibt leer, und das Protokoll zeigt:

```
Error in expression : Error: [hostfilter] destination <host> (<addresses>) is not in REST_ALLOWED_HOSTS
```

**Warum das passiert**

[`REST_ALLOWED_HOSTS`](customization/security.html#env_REST_ALLOWED_HOSTS) ist gesetzt, und der Host der URL steht nicht darin.
Ein Host, der zu [`REST_DENIED_HOSTS`](customization/security.html#env_REST_DENIED_HOSTS) passt, wird mit
`blocked by REST_DENIED_HOSTS entry "<entry>"` abgelehnt, und ein Host, der sich nicht auflösen lässt, mit `cannot resolve <host>`.

**Wie Sie es beheben**

Fügen Sie den Hostnamen oder ein CIDR, das seine Adressen abdeckt, zu `REST_ALLOWED_HOSTS` hinzu, oder entfernen Sie den Eintrag, der ihn sperrt, aus
`REST_DENIED_HOSTS`. Siehe [Ziele der REST-Hilfsfunktionen einschränken](faq.html#restricting-rest-helper-destinations-allowdeny-lists).

---

## Authentication failed: Invalid credentials

Die Anmeldeseite lehnt einen Benutzernamen und ein Passwort ab mit:

```
Authentication failed: Invalid credentials
```

**Warum das passiert**

Die Anmeldeseite gibt bei jedem Fehlschlag dieselbe Antwort, damit sie nicht verrät, ob ein Benutzer existiert. AnsibleForms
versucht zuerst die lokalen Benutzer und danach LDAP: bei mehreren Verzeichnissen wird ein Benutzername in deren Reihenfolge unter **Zugriff > LDAP** gesucht,
sofern er kein Verzeichnis (`corp\jane`) oder eine seiner Anmeldedomänen (`jane@corp.example`) nennt. Der echte Grund geht ins Protokoll. LDAP-
Fehlschläge werden als `Error connecting to ldap: <reason>` protokolliert, mit Gründen wie `Wrong binding credentials` oder
`Unable to verify the certificate`; Active-Directory-Codes werden übersetzt in `Wrong password`, `User not found`,
`Account disabled`, `Account locked` oder `Password expired`.

**Wie Sie es beheben**

Lesen Sie den Grund im Protokoll. Für den vollständigen Grund jeder fehlgeschlagenen Anmeldung setzen Sie
[`LOG_LEVEL`](customization/logging.html#env_LOG_LEVEL) auf `debug`, das `Ldap authentication failed: <reason>` protokolliert.
Wenn das lokale Admin-Passwort verloren ist, siehe [Ein verlorenes Admin-Passwort wiederherstellen](faq.html#recovering-a-lost-admin-password).

---

## LDAP check failed

Der Test eines LDAP-Verzeichnisses unter **Zugriff > LDAP** schlägt mit einer dieser Meldungen fehl:

```
LDAP check failed: Error: Wrong binding credentials
LDAP check failed: Error: Bad server or port (connection failed)
LDAP check failed: Error: Unable to verify the certificate
LDAP check failed: Error: Certificate is not valid
```

**Warum das passiert**

Der Bind-Benutzer oder sein Passwort ist falsch, der Server oder Port ist nicht erreichbar, oder, mit TLS, das Zertifikat des Servers lässt sich nicht
gegen das CA-Bundle prüfen. Seit 7.3.0 liegen diese Angaben in den LDAP-Anmeldedaten des Verzeichnisses, unter **Verbindungen > Anmeldedaten**. Ein Testbenutzer, der nicht existiert,
zählt dennoch als erfolgreicher Test, weil Verbindung und Bind funktioniert haben.

**Wie Sie es beheben**

Öffnen Sie die Anmeldedaten, die das Verzeichnis nennt (das Standardverzeichnis ist `main`), unter **Verbindungen > Anmeldedaten** und korrigieren Sie den Bind-
DN und sein Passwort, die Server und den Port (meist 389, oder 636 für LDAPS). Bei TLS-Problemen fügen Sie das CA-Bundle ein, das das Zertifikat des
LDAP-Servers signiert hat; das Überspringen der Zertifikatsprüfung ist nichts für die Produktion. Siehe [LDAP](authentication/ldap.html).

---

## Die Authentifizierung über Azure AD oder OIDC schlägt fehl

Eine Single-Sign-On-Anmeldung kehrt zur Anmeldeseite zurück mit:

```
Azure AD authentication failed: <reason>
OIDC authentication failed: <reason>
```

**Warum das passiert**

Der Identitätsanbieter hat den Benutzer zurückgeschickt, aber AnsibleForms konnte die Anmeldung nicht abschließen. Häufige Gründe sind
`azuread login is not enabled` oder `oidc login is not enabled` (der Anbieter ist ausgeschaltet) und `jwt expired`, weil
die Übergabe vom Anbieter nur 5 Minuten gültig ist. Ein Fehler beim Callback vom Anbieter wird ebenfalls auf der Anmeldeseite
angezeigt und protokolliert.

**Wie Sie es beheben**

Aktivieren Sie den Anbieter unter **Zugriff > SSO** und registrieren Sie die Callback-URL beim Identitätsanbieter genau so, wie
AnsibleForms sie verwendet: `https://<your host>/api/v2/auth/entraid/callback` für Entra ID (ab 7.3.0; `azureadoauth2` funktioniert weiterhin) oder
`https://<your host>/api/v2/auth/oidc/callback` für OIDC. Eine Callback-URL mit `/api/v1/`, aus der Zeit vor 7 oder vor
6.1.5, muss aktualisiert werden: die Anmeldeseite lädt dann neu, ohne anzumelden und ohne Fehler. Versuchen Sie die Anmeldung nach
einer abgelaufenen Übergabe erneut.

---

## Not authenticated, login is not enabled for this user

Ein Benutzer mit gültigem Passwort kann sich nicht anmelden und erhält:

```
Not authenticated, login is not enabled for this user.
```

**Warum das passiert**

Eine der Rollen des Benutzers setzt die Rollenoption `allowLogin` auf `false`. Das Protokoll sagt
`Login is disabled for user '<username>' in the configuration (allowLogin option is set to false), please check your settings`.

**Wie Sie es beheben**

Entfernen Sie `allowLogin: false` aus der Rolle oder nehmen Sie den Benutzer aus dieser Rolle heraus. Siehe [Rollen](config/roles.html).

---

## Abgemeldet nach einem Neustart oder nach einem Tag

Jeder Benutzer wird nach einem Neustart von AnsibleForms oder nach einem Tag Nutzung zur Anmeldeseite zurückgeschickt.

**Warum das passiert**

Wenn [`ACCESS_TOKEN_SECRET`](customization/security.html#env_ACCESS_TOKEN_SECRET) nicht gesetzt ist, erzeugt jeder Start einen
neuen Signaturschlüssel und protokolliert
`[SECURITY] JWT signing secret was auto-generated. All tokens will be invalidated on restart. Set the ACCESS_TOKEN_SECRET environment variable for persistent token signing.`
Tokens aus der Zeit vor dem
Neustart werden dann nicht mehr akzeptiert. Unabhängig davon endet eine Sitzung, wenn ihr Refresh Token abläuft
(`Refresh token is expired`), nach
[`ACCESS_TOKEN_REFRESH_EXPIRATION`](customization/security.html#env_ACCESS_TOKEN_REFRESH_EXPIRATION), standardmäßig 24 Stunden.

**Wie Sie es beheben**

Setzen Sie `ACCESS_TOKEN_SECRET` auf einen festen, geheimen Wert. Erhöhen Sie `ACCESS_TOKEN_REFRESH_EXPIRATION`, wenn ein Tag zu kurz ist. Für
langlebigen API-Zugriff verwenden Sie ein [API-Token](profile/api-token.html).

---

## Leere Formulare und Jobs nach einem Single Sign-On (HTTP 431)

Ein Benutzer meldet sich ohne Fehler mit Entra ID oder OIDC an, aber die Seiten Formulare und Jobs bleiben leer. Der Netzwerk-Tab
des Browsers zeigt die API-Aufrufe beantwortet mit:

```
431 Request Header Fields Too Large
```

Das Serverprotokoll zeigt für diese Aufrufe nichts, und derselbe Benutzer kann mit einem LDAP- oder lokalen Konto problemlos arbeiten.

**Warum das passiert**

Vor 7.1.0 trug das Anmelde-Token jede Gruppe des Benutzers, und Entra-ID-Gruppen standen doppelt darin, mit Objekt-ID
und mit Namen. Der Browser sendet dieses Token im Header `Authorization` jeder Anfrage, daher kommt ein Benutzer in etwa hundert
Gruppen oder mehr auf einen Header von weit über 16 KB. Node.js lehnt Request-Header über 16 KB mit einer 431 ab,
bevor die Anfrage AnsibleForms erreicht, weshalb nichts protokolliert wird. Ein vorgeschalteter Reverse Proxy kann die
Anfrage noch früher ablehnen: Nginx erlaubt standardmäßig 8 KB pro Header-Feld
(`large_client_header_buffers 4 8k`) und antwortet stattdessen mit 400.

**Wie Sie es beheben**

Aktualisieren Sie auf 7.1.0 oder neuer: das Anmelde-Token trägt die Gruppen nicht mehr, daher hängt seine Größe nicht mehr davon ab, in wie vielen
Gruppen ein Benutzer ist, und die Oberfläche sagt es, wenn eine Anfrage mit 431 abgelehnt wird, statt leere Seiten zu zeigen.
Bis Sie aktualisieren können, entweder:

* setzen Sie einen **Gruppenfilter** beim Anbieter unter **Zugriff > SSO**, einen regulären Ausdruck, der nur die Gruppen behält, die Ihre
  Rollen verwenden, siehe [Entra ID](authentication/entra-id.html) oder [OIDC](authentication/oidc.html); der Benutzer meldet sich erneut an,
  um ein kleineres Token zu erhalten
* oder erhöhen Sie die Grenze von Node.js mit der Umgebungsvariable `NODE_OPTIONS=--max-http-header-size=65536` und
  starten Sie AnsibleForms neu

Ab 7.1.0 setzt [`MAX_HTTP_HEADER_SIZE`](customization/server.html#env_MAX_HTTP_HEADER_SIZE) dieselbe Grenze, standardmäßig 16384
Bytes und beim Start gelesen, für andere große Header, etwa große Cookies, die ein vorgeschaltetes Single-Sign-On-Gateway setzt.
Erhöhen Sie auch die Header-Grenzen des Proxys, siehe [Größe der Request-Header](production/reverse-proxy.html#request-header-size).

---

## Playbook failed with status

Ein Ansible-Job endet als fehlgeschlagen, und die letzte Zeile seiner Ausgabe ist:

```
[ERROR]: Playbook failed with status (<code>)
```

**Warum das passiert**

`ansible-playbook` hat sich mit einem Code ungleich null beendet. Die Zeilen darüber enthalten den eigenen Fehler von Ansible: das Playbook wurde nicht
gefunden, ein Host war nicht erreichbar, ein Task ist fehlgeschlagen oder das Inventar ist falsch. Das Playbook wird im Repository mit
eingeschaltetem **Für Playbooks verwenden?** gesucht oder in [`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH); die Protokollzeile
`Running from directory : <path>` zeigt den verwendeten Ordner.

**Wie Sie es beheben**

Lesen Sie die Job-Ausgabe oberhalb der letzten Zeile. Wenn das Playbook nicht gefunden wird, vergleichen Sie das `playbook` des Formulars mit dem
Ordner in `Running from directory`. Siehe [Ansible-Formulare](forms/ansible.html).

---

## Playbook was aborted by the main process

Ein Ansible-Job endet als fehlgeschlagen mit:

```
Playbook was aborted by the main process.  Likely some buffer or memory error occured.  Also check the maxBuffer option.
```

**Warum das passiert**

Der Prozess `ansible-playbook` auf der RTE wurde durch ein Signal beendet, und niemand hat den Job abgebrochen. Seit 7.0.0 führt die Größe der
Ausgabe nicht mehr dazu: jenseits von [`PROCESS_MAX_BUFFER`](customization/server.html#env_PROCESS_MAX_BUFFER) (standardmäßig 50 MB pro Stream)
wird der Rest der Ausgabe nicht gespeichert, der Job zeigt
`[WARNING]: the stdout of this job passed PROCESS_MAX_BUFFER (<bytes> bytes) : the rest is not stored, the playbook goes on`,
und das Playbook läuft bis zu seinem Ende. Die übliche Ursache ist jetzt der Arbeitsspeicher: der RTE-Container hat seine Speichergrenze erreicht, und der
Kernel hat das Playbook beendet, zum Beispiel bei vielen Forks oder großen Facts.

**Wie Sie es beheben**

Prüfen Sie den Arbeitsspeicher des RTE-Containers, während das Playbook läuft (`docker stats`, `kubectl top pod`), und erhöhen Sie seine Grenze, oder senken Sie
den Speicherverbrauch des Playbooks (weniger `forks`, kein unnötiges Sammeln von Facts). Wenn Sie nur die Warnung zu `PROCESS_MAX_BUFFER` sehen und
die ganze Ausgabe brauchen, erhöhen Sie `PROCESS_MAX_BUFFER` in der Umgebung des RTE-Containers; es wird von der RTE gelesen, nicht von der App.
---

## Failed to launch awx template

Ein AWX-Job endet als fehlgeschlagen, mit einer Ausgabe, die beginnt mit:

```
failed to launch awx template <name>
```

**Warum das passiert**

Die nächste Zeile nennt den Grund. `Request failed with status code 401` bedeutet, dass das Token oder Benutzername und Passwort in den
Anmeldedaten des AWX-Runners abgelehnt werden. `could not find job template <name>` bedeutet, dass weder eine Job-Vorlage noch eine Workflow-Job-Vorlage
genau diesen Namen hat, oder dass der Benutzer der Verbindung sie nicht sehen kann. Ein Zertifikatsfehler, etwa
`unable to verify the first certificate`, bedeutet, dass dem AWX-Zertifikat nicht vertraut wird.

**Wie Sie es beheben**

Verwenden Sie **Verbindung testen** beim Runner (**Verbindungen > Runner**), das `Runner connection is OK` antwortet, wenn es funktioniert. Seit
7.3.0 liegen das Token oder Benutzer und Passwort, die Adresse und das **CA-Bundle** in den Anmeldedaten des Runners, unter
**Verbindungen > Anmeldedaten**: erneuern Sie dort das Token oder Passwort, und fügen Sie bei Zertifikatsfehlern die CA in sein **CA-Bundle** ein.
Prüfen Sie den Namen und die Berechtigungen der Vorlage. Geben Sie die Adresse ohne `/api/v2` ein: AnsibleForms fügt
[`AWX_API_PREFIX`](customization/features.html#env_AWX_API_PREFIX) selbst hinzu.
Siehe [AWX-Formulare](forms/awx.html).

---

## Ein Job zeigt den Status abandoned

Ein Job, der lief, ist jetzt als `abandoned` markiert, und das Protokoll eines Knotens oder einer RTE zeigt eine dieser Meldungen:

```
Abandoned <n> jobs this node followed before it restarted
Abandoned <n> jobs this worker followed before it restarted
Abandoned <n> jobs followed by a node that stopped answering
Job <id>: RTE '<name>' came back without it: abandoned
Abandoned <n> jobs
```

Eine RTE im Datenbankmodus, veraltet, protokolliert ihre eigene:

```
RTE: abandoned <n> job(s) left running by a previous start
RTE: stopping with <n> job(s) still running: they end as abandoned
```

**Warum das passiert**

Ein Job gehört zu dem Container, der ihn ausführt oder verfolgt: ein Playbook zu seiner RTE, jeder andere Job (ein AWX-Job, die Schritte eines Multistep-
Formulars) zu dem App-Knoten, der ihn gestartet hat. Wenn dieser Container neu startet, beendet er seine eigenen unfertigen Jobs. Wenn er verschwindet, etwa ein ersetzter
Pod, beendet der Worker seine Jobs, sobald er zwei Minuten lang nicht geantwortet hat. Kommt eine RTE in einem Socket-Modus ohne
einen Job zurück, den sie ausführte, zum Beispiel ein neuer Container ohne seinen Spool, endet dieser Job als abandoned. Eine stoppende RTE wartet
zuerst [`RTE_DRAIN_SECONDS`](customization/server.html#env_RTE_DRAIN_SECONDS) auf ihre Playbooks. Jede Stunde werden außerdem Jobs, die seit mehr
als einem Tag laufen, als abandoned markiert.

Seit 7.3.0 läuft ein Job auf AWX, AAP oder Ascender auf seinem Runner weiter: gleich nachdem ein Neustart ihn aufgegeben hat, verfolgt ein Knoten ihn erneut,
wenn er in den letzten 24 Stunden gestartet wurde, und er endet mit dem, was dort tatsächlich passiert ist. Das Protokoll sagt dann `Following <n> abandoned job(s) again on their runner`.

**Wie Sie es beheben**

Starten Sie einen Playbook-Job erneut. Starten oder aktualisieren Sie RTEs und App-Knoten, während kein Job läuft, und geben Sie einer stoppenden RTE genug Zeit
(siehe [Skalierung](rte/run.html)). Prüfen Sie, ob das Playbook auf den verwalteten Hosts wirklich fertig wurde, bevor Sie es
erneut starten, denn es kann teilweise gelaufen sein.

---

## Eine RTE verbindet sich nicht

**Verbindung testen** bei einem RTE-Runner (**Verbindungen > Runner**) schlägt fehl mit:

```
the RTE '<name>' (outbound) is not connected: it has not dialed the app: check its APP_URL, its token and the network from the RTE to the app
the RTE '<name>' (inbound) is not connected: no app node could dial it at <address>: check its RTE_URL, its token and the network from the app to the RTE
```

**Warum das passiert**

Eine RTE in einem Socket-Modus spricht über einen WebSocket mit der App: ausgehend verbindet sie sich mit der App, eingehend verbindet sich die App mit ihr (siehe
[Modi](rte/modes.html)). Die Protokolle der App und der RTE sagen, warum der Socket nicht offen ist:

| Meldung | Wo | Was sie bedeutet |
|---|---|---|
| `RTE: refused a socket without the right token from <address>` | Die RTE (eingehend) | Das Token der RTE-Anmeldedaten des Runners ist nicht das `RTE_TOKEN` der RTE |
| `Runner '<name>': the RTE at <address> refused the socket (401): check its RTE_TOKEN` | Die App (eingehend) | Dasselbe, von der App aus gesehen |
| `the token of RTE '<name>' is not the one stored for its runner: check its RTE_TOKEN` | Die App und die abgelehnte RTE (`401`) | Die RTE meldet sich mit einem anderen Token an als dem, das die App für ihren Runner aufbewahrt |
| `RTE '<name>': waiting for an admin to approve it under Connections > Runners (fingerprint <fingerprint>)` | Die RTE (ausgehend) | Sie hat um Beitritt gebeten und wartet auf eine Freigabe |
| `RTE '<name>': asked to join as inbound runner '<name>': the app dials it once an admin approves it under Connections > Runners (fingerprint <fingerprint>)` | Die RTE (eingehend, mit `APP_URL`) | Dasselbe, für eine eingehende RTE |
| `runner '<name>' is managed by the config seed in database mode: set rte_mode: outbound for it in the seed (and its credential), then restart this RTE` | Die App und die abgelehnte RTE (`409`) | Der Konfigurations-Seed deklariert den Runner ohne `rte_mode`, also im Datenbankmodus, und der Seed bestimmt seinen Modus. Eine eingehende RTE erhält `rte_mode: inbound` und `(and its credential with the address the app dials, RTE_URL)` |
| `RTE: RTE_MODE=inbound with APP_URL registers with the app, which then dials RTE_URL : set RTE_URL (http://this-host:8000) ; refusing to start` | Die RTE | Eine eingehende RTE, die sich selbst registriert, braucht die Adresse, unter der die App sie erreicht |
| `Runner '<name>': dialing <address>: <reason>` | Die App, auf Stufe `debug` | Die App kann den Socket nicht öffnen, zum Beispiel weil das Zertifikat der RTE nicht das für ihren Runner gepinnte ist |
| `[DEPRECATED] This RTE runs in database mode (RTE_MODE is not set): it holds the database's credentials and reads and writes it itself. Set RTE_MODE=outbound (it dials the app, APP_URL) or RTE_MODE=inbound (the app dials it, RTE_URL), and drop DB_* from its environment. Database mode is removed in 8.0.0.` | Die RTE | Sie läuft im Datenbankmodus und öffnet überhaupt keinen Socket |

**Wie Sie es beheben**

* **Ein abgelehntes Token** : geben Sie der RTE das Token der RTE-Anmeldedaten ihres Runners (**Verbindungen > Anmeldedaten**), oder umgekehrt
* **Wartet auf Freigabe** : geben Sie sie unter **Verbindungen > Runner** frei, nachdem Sie geprüft haben, dass der dort angezeigte Fingerabdruck der in ihrem
  Protokoll ist (siehe [Eine RTE freigeben](runners/registration.html#approving-an-rte))
* **Vom Konfigurations-Seed im Datenbankmodus verwaltet** : setzen Sie `rte_mode` beim Runner im Seed, mit RTE-Anmeldedaten (bei eingehend mit ihrer
  Adresse), und starten Sie dann die RTE neu
* **Eingehend ohne `RTE_URL`** : setzen Sie `RTE_URL` auf die Adresse, unter der die App die RTE erreicht, oder lassen Sie `APP_URL` weg und deklarieren Sie den
  Runner im Seed oder unter **Verbindungen > Runner**
* **Ein Zertifikat, das nicht das gepinnte ist** : eine eingehende RTE über HTTPS sendet ihr Zertifikat, wenn sie sich registriert, und die App verbindet sich
  nur mit diesem. Nach einem neuen Zertifikat sendet die RTE es bei der Registrierung erneut; wurde das CA-Bundle der Anmeldedaten
  von Hand gesetzt, behält die App es und protokolliert
  `Runner '<name>': its ca_bundle was set by hand: the certificate its RTE sent (fingerprint <fingerprint>) is not stored. Empty the ca_bundle to have the RTE's certificate pinned again`
* **Die Warnung [DEPRECATED]** : setzen Sie `RTE_MODE` auf der RTE, entfernen Sie `DB_*` aus ihrer Umgebung und setzen Sie ihren Runner auf diesen Modus (siehe
  [Modi](rte/modes.html))

---

## The form data is not valid

Mit der Startvalidierung auf `enforce` wird ein Start mit `422` abgelehnt und:

```
The form data is not valid
```

**Warum das passiert**

Der Server hat die Feldwerte gegen die Regeln des Formulars geprüft und fehlende oder ungültige Felder gefunden; die Antwort listet
sie unter `details` auf. Ein Start ohne `rawFormData` wird ebenfalls abgelehnt. Ein Formular, das sich noch nicht prüfen lässt, etwa ein Wizard,
wird mit `Form '<name>' cannot be launched with launch validation 'enforce' yet : <reason>` abgelehnt.

**Wie Sie es beheben**

Korrigieren Sie die Felder, die die Details nennen, oder die Regeln des Formulars, wenn sie zu streng sind. Lassen Sie es zuerst unter `log` laufen: das protokolliert
`Launch validation would refuse form '<name>' ...`, ohne etwas abzulehnen. Siehe
[Was enforce tut](launch-validation/log-and-enforce.html#what-enforce-does) und
[Einführung](launch-validation/rolling-it-out.html).

---

## Klonen oder Pull eines Repositorys schlägt fehl

Ein Repository zeigt einen fehlgeschlagenen Status, und seine Ausgabe enthält den Fehler von Git, oder das Protokoll zeigt
`Background clone of '<name>' failed : <reason>`.

**Warum das passiert**

Git konnte das Remote nicht erreichen oder sich dort nicht authentifizieren. Bei SSH-URLs (`git@host:path`) muss das Remote den öffentlichen
Schlüssel von AnsibleForms akzeptieren; bei HTTPS müssen Benutzername und Token gültig sein. Ein Pull wird auch abgelehnt, wenn der Arbeitsbaum
Änderungen hat, mit
`Repository '<name>' has local changes that block the pull. Use 'Save (repository)' to push them first, or discard them.`

**Wie Sie es beheben**

Bei SSH kopieren Sie den öffentlichen Schlüssel aus dem Reiter **Schlüssel** von **Verbindungen > SSH** und fügen ihn als Deploy Key hinzu oder einem Benutzer mit
Zugriff auf das Repository. AnsibleForms fügt den Remote-Host beim Klonen zu den bekannten Hosts hinzu; für andere Hosts verwenden Sie den
Reiter **Bekannte Hosts** derselben Seite. Bei
HTTPS erneuern Sie das Token. Siehe [Git-Repositories](gui/designer-and-git.html#git-repositories) und
[Über Repositories](faq.html#about-repositories).

---

## Das Formular-Repository ist noch nicht geklont

Das Speichern von Formularen im Designer schlägt fehl mit:

```
The forms repository '<name>' is not cloned yet ; clone it from the repositories settings first
```

**Warum das passiert**

Ein Repository mit eingeschaltetem **Für Formulare verwenden?** hat noch keinen Arbeitsbaum, weil das Klonen noch nicht gelaufen oder fehlgeschlagen ist.

**Wie Sie es beheben**

Klonen Sie das Repository in den Repository-Einstellungen. Wenn das Klonen fehlschlägt, siehe
[Klonen oder Pull eines Repositorys schlägt fehl](#a-repository-clone-or-pull-failed).

---

## Ein Backup schlägt fehl

Ein Backup schlägt fehl, und der Liste der Backups wird nichts hinzugefügt. Der Grund ist einer von:

```
'mariadb-dump' was not found on this system. Install the mysql/mariadb client tools, or set MYSQLDUMP_COMMAND to a command that works here.
The database dump is empty, '<file>' was not written
The command timed out
```

**Warum das passiert**

Der Dump-Befehl, [`MYSQLDUMP_COMMAND`](customization/retention.html#env_MYSQLDUMP_COMMAND), ist nicht installiert, konnte sich nicht
verbinden oder hat eine leere Datei erzeugt. Eine große Datenbank kann auch länger brauchen als
[`BACKUP_COMMAND_TIMEOUT_SECONDS`](customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS), standardmäßig eine Stunde.
Ein fehlgeschlagenes Backup hinterlässt keinen Ordner; das Protokoll sagt `Backup failed, removing the incomplete folder '<folder>' : <reason>`.

**Wie Sie es beheben**

Installieren Sie die Client-Werkzeuge von MySQL oder MariaDB, oder setzen Sie `MYSQLDUMP_COMMAND` (und `MYSQL_COMMAND` für Wiederherstellungen) auf einen Befehl,
der auf diesem Host und gegen die Version Ihres Servers funktioniert. Erhöhen Sie `BACKUP_COMMAND_TIMEOUT_SECONDS` für eine große Datenbank.
Siehe [Backups](gui/administration.html#backups).
