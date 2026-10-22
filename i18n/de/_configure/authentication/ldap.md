---
layout: default
title: LDAP
parent: Authentifizierung
nav_order: 2
translated_from: a4089d681ad976e31e7ddefb29588bd3ca334dab
---

# LDAP
{: .no_toc }

Lassen Sie Verzeichnisbenutzer sich mit ihrem eigenen Passwort anmelden, und geben Sie ihnen Rollen über ihre Verzeichnisgruppen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Funktionsweise

AnsibleForms verbindet sich mit einem Bind-Konto mit dem Verzeichnis, sucht den Benutzer und bindet sich dann als dieser Benutzer, um
das Passwort zu prüfen:

1. Der Benutzer meldet sich mit Benutzername und Passwort an. Hat kein **lokaler** Benutzer diesen Namen, wird LDAP versucht.
2. AnsibleForms bindet sich mit dem Bind-Konto aus den Anmeldedaten des Verzeichnisses und durchsucht **Search Base** nach einem Eintrag, dessen
   **Benutzername-Attribut** dem Benutzernamen entspricht.
3. Es bindet sich als der gefundene Eintrag, mit dem eingegebenen Passwort.
4. Die Gruppen werden aus dem Eintrag (oder aus einer Gruppensuche) gelesen, gefiltert und mit dem Präfix `ldap/` versehen.

Ein Benutzername in UPN-Form (`jdoe@example.com`), der keinen Benutzer findet, wird einmal mit dem Teil vor dem `@` erneut versucht, sodass sich Benutzer
in beiden Formen anmelden können, auch wenn das Benutzername-Attribut den Kurznamen enthält. Ein falsches Passwort wird nie erneut versucht.

Ein und dieselbe Gruppe von Einstellungen dient Active Directory, OpenLDAP und anderen; ab 7.3.0 kann es [mehrere Verzeichnisse](#several-directories) geben.

---

## Einstellungen

Ab 7.3.0 gelten die Einstellungen pro Verzeichnis. **Zugriff > LDAP** listet die Verzeichnisse auf, in der Reihenfolge, in der ein einfacher Benutzername gesucht wird:

![Zugriff > LDAP](../assets/screenshots/ldap.jpg)

| Menü der Zeile | Was es tut |
|---|---|
| Bearbeiten | Öffnet die Seite des Verzeichnisses |
| Verbindung testen | Versucht eine Anmeldung mit einem Test-Benutzernamen und -Passwort, siehe [Die Verbindung testen](#testing-the-connection) |
| Aktivieren, Deaktivieren | Schaltet das Verzeichnis ein oder aus; `main` wird ausgeschaltet statt gelöscht |
| Nach oben, Nach unten | Ändert seine Stelle in der Suchreihenfolge |
| Löschen | Entfernt das Verzeichnis; bei `main` angezeigt, aber deaktiviert |

Beim Hinzufügen eines Verzeichnisses werden seine Felder in vier Schritten abgefragt, den Tabs seiner Seite. **Details** enthält **Aktiviert**, den **Namen** und eine **Beschreibung**:

| Tab | Einstellung | Bedeutung |
|---|---|---|
| Anmeldedaten | Anmeldedaten-Eintrag | Erforderlich. Ein `ldap`-Eintrag aus [Verbindungen > Anmeldedaten](../credentials.html), der die Verbindung enthält, siehe unten |
| Benutzer | Search Base | DN, ab dem die Benutzersuche beginnt, z. B. `OU=Users,DC=example,DC=com`. Unterbäume werden mit durchsucht |
| Benutzer | Benutzername-Attribut | Attribut, das mit dem Anmeldenamen abgeglichen wird: `sAMAccountName` in AD (der Standard), `uid` in OpenLDAP |
| Benutzer | Mail-Attribut | Attribut mit der E-Mail-Adresse, meist `mail` |
| Benutzer | Anmeldedomänen | Domänen, deren Anmeldungen als `user@domain` direkt zu diesem Verzeichnis gehen, siehe [Mehrere Verzeichnisse](#several-directories) |
| Gruppen | Gruppen-Attribut | Attribut des Benutzereintrags, das die Gruppen enthält (`memberOf`, der Standard), oder `groups` mit einer Gruppensuche |
| Gruppen | Gruppen-Search-Base | DN, ab dem die Gruppensuche beginnt |
| Gruppen | Gruppenklasse | objectClass der Gruppen, z. B. `group`, `groupOfNames` oder `posixGroup` |
| Gruppen | Gruppenmitglied-Attribut | Attribut einer Gruppe, das ihre Mitglieder auflistet, z. B. `member`, `uniqueMember` oder `memberUid`; Standard `member` |
| Gruppen | Benutzerattribut für Gruppenmitglied | Attribut des Benutzers, das diese Mitgliedswerte enthalten, z. B. `dn` oder `uid`; Standard `dn` |
| Gruppen | Gruppenfilter | Regulärer Ausdruck; nur die Gruppen, deren Name passt, bleiben erhalten. Leer behält jede Gruppe |

Die Standardwerte der letzten drei Gruppenfelder gelten nur, wenn die Gruppensuche verwendet wird, siehe den nächsten Abschnitt.

Die `ldap`-Anmeldedaten enthalten, wie das Verzeichnis erreicht wird und als wer es durchsucht wird:

| Feld | Bedeutung |
|---|---|
| Server | Einer pro Feld, als `host`, `host:port` oder `ldaps://host:port`, in dieser Reihenfolge versucht: Ist einer nicht erreichbar, wird der nächste versucht |
| Port | `389` für einfaches LDAP, `636` für LDAPS |
| TLS aktivieren | Mit LDAPS (`ldaps://`) verbinden. StartTLS auf Port 389 wird nicht unterstützt |
| Zertifikate ignorieren | Die Prüfung des Serverzertifikats überspringen. Nur mit **TLS aktivieren** angezeigt |
| Zertifikat | Das Client-Zertifikat, das AnsibleForms den Servern vorlegt, in PEM, wenn die Zertifikate geprüft werden |
| CA-Bundle | Das oder die CA-Zertifikate, die das Serverzertifikat signiert haben, in PEM, wenn die Zertifikate geprüft werden |
| Bind-User-DN | Der DN des Dienstkontos, das das Verzeichnis durchsucht |
| Bind-User-Passwort | Sein Passwort, verschlüsselt gespeichert oder aus einem [Secret Store](../secret-stores/) gelesen |

Nur ein Admin kann `ldap`-Anmeldedaten hinzufügen oder ändern, siehe [Wer Anmeldedaten ändern darf](../credentials.html#who-may-change-a-credential).
Bis 7.2.0 waren die Server, TLS und das Bind-Konto Felder der LDAP-Einstellungen. Das Upgrade auf 7.3.0 verschiebt sie in einen Anmeldedaten-Eintrag,
siehe [Adressen in Anmeldedaten](../credentials/types.html#addresses-in-credentials):

| Das Verzeichnis vor dem Upgrade | Wohin seine Server gehen |
|---|---|
| Eigener Bind-DN und eigenes Passwort, keine Anmeldedaten | Ein neuer `ldap`-Eintrag namens `<directory>-ldap`, etwa `main-ldap` |
| Anmeldedaten ohne Server | In diese Anmeldedaten |
| Anmeldedaten, die bereits andere Server enthalten | Eine Kopie der Anmeldedaten namens `<credential>-<directory>`, die das Verzeichnis dann verwendet |

Ein bereits vergebener Name erhält `-2`, `-3` und so weiter. Ein Verzeichnis aus dem Config-Seed bleibt, wie es ist: Der Seed verwaltet es.

---

## Gruppen

Die Gruppen kommen aus einer von zwei Quellen, und das **Gruppen-Attribut** entscheidet, welche verwendet wird:

- **Ein Attribut des Benutzereintrags**, meist `memberOf`. Das ist die übliche Einrichtung für Active Directory und für
  OpenLDAP mit dem Overlay `memberof`.
- **Eine Gruppensuche**, für Verzeichnisse ohne `memberOf`. Sie läuft nur, wenn **Gruppen-Search-Base** und **Gruppenklasse**
  beide gesetzt sind: AnsibleForms sucht dann nach Gruppen dieser Klasse, deren **Gruppenmitglied-Attribut** das
  **Benutzerattribut für Gruppenmitglied** des Benutzers enthält, und speichert das Ergebnis im Attribut `groups`. Setzen Sie **Gruppen-Attribut** auf `groups`,
  um es zu verwenden.

{: .note }
> Mit dem **Gruppen-Attribut** `memberOf` läuft eine konfigurierte Gruppensuche zwar, ihr Ergebnis wird aber nicht für die Rollen verwendet.

Jede Gruppe ist ein DN, und AnsibleForms behält ihren ersten CN: Aus `CN=AF-Admins,OU=Groups,DC=example,DC=com` wird `AF-Admins`.
Auf diesen Namen wird dann der **Gruppenfilter** angewendet, und die verbleibenden Gruppen erhalten das Präfix `ldap/`: `ldap/AF-Admins`.

In großen Verzeichnissen hält der Filter Token und Jobs klein; ein ungültiger regulärer Ausdruck behält alle Gruppen und wird protokolliert.

---

## Zuordnung zu Rollen

In config.yaml ist eine LDAP-Gruppe `ldap/<group CN>` und ein LDAP-Benutzer `ldap/<username>`, beide mit Beachtung der Groß- und Kleinschreibung:

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

Der Benutzername ist der Wert des **Benutzername-Attributs**, wie das Verzeichnis ihn zurückgibt, nicht wie der Benutzer ihn eingegeben hat.
Siehe [Rollen](../config/roles.html) für die Rollenoptionen.

---

## Mehrere Verzeichnisse

Ab 7.3.0 kann es mehrere Verzeichnisse geben, jedes mit eigenen Servern, Benutzern und Gruppen. Ihre Namen unterscheiden ihre Mitglieder:

| Verzeichnis | Benutzername | Gruppen | In einer Rolle |
|---|---|---|---|
| `main` | `jdoe` | `ldap/AF-Admins` | `ldap/jdoe`, `ldap/AF-Admins` |
| Jedes andere, etwa `corp` | `corp/jdoe` | `ldap/corp/AF-Admins` | `ldap/corp/jdoe`, `ldap/corp/AF-Admins` |

Ein Benutzer nennt das Verzeichnis bei der Anmeldung als `corp\jdoe` oder `corp/jdoe`, oder er meldet sich mit einer Adresse einer Domäne an, die dem Verzeichnis
gehört. Ein einfacher Benutzername wird in jedem aktivierten Verzeichnis versucht, in ihrer Reihenfolge, und ebenso ein Name wie `other\jdoe`, wenn kein
Verzeichnis `other` heißt: Er wird dann so gesucht, wie er eingegeben wurde.

Das erste Verzeichnis, das den Benutzer kennt, entscheidet: Ein falsches Passwort dort ist die Antwort, und das nächste Verzeichnis wird nicht
versucht, da es jemand anderen mit diesem Namen enthalten könnte. Ein nicht erreichbares Verzeichnis wird übersprungen.

Das Verzeichnis, das bis 7.2.0 `default` hieß, heißt ab 7.3.0 `main`: Das Upgrade benennt es um, und eine neue Installation beginnt
mit `main`. Seine Mitglieder behalten ihre Kurznamen, sodass die Rollen, die sie nennen, nicht geändert werden müssen. Das Verzeichnis `main` lässt sich nicht
umbenennen, und ein Verzeichnisname enthält nur Buchstaben, Ziffern, `-` und `_`.

---

## Die Verbindung testen

**Verbindung testen** fragt nach einem Test-Benutzernamen und -Passwort und versucht eine Anmeldung mit den Einstellungen auf dem Bildschirm, gespeichert oder nicht.
Bei Erfolg zeigt es den Verzeichniseintrag des Benutzers, der Ihnen die genauen Attributnamen und Gruppen-DNs nennt, die Sie verwenden müssen.

Ein Testbenutzer, der nicht existiert, meldet trotzdem Erfolg: Die Verbindung und das Bind-Konto funktionieren, nur der Benutzer wird nicht
gefunden. Typische Fehler:

| Meldung | Ursache |
|---|---|
| `Bad server or port (connection failed)` | Der Hostname lässt sich nicht auflösen oder der Port ist nicht erreichbar. |
| `Wrong binding credentials` | Bind-DN oder Passwort in den Anmeldedaten des Verzeichnisses sind falsch. |
| `Unable to verify the certificate` | Das Serverzertifikat ist nicht vom CA-Bundle der Anmeldedaten signiert. |
| `Certificate is not valid` | Zertifikat oder CA-Bundle der Anmeldedaten enthalten kein gültiges PEM-Zertifikat. |

---

## Beispiel für Active Directory

Dieses Beispiel verbindet sich über LDAPS mit zwei Domänencontrollern und behält nur die Gruppen, deren Name mit `AF-` beginnt:

| Einstellung | Wert |
|---|---|
| Anmeldedaten > Server | `dc01.example.com`, dann `dc02.example.com` |
| Anmeldedaten > Port | `636` |
| Anmeldedaten > TLS aktivieren | ein |
| Anmeldedaten > Zertifikate ignorieren | aus, mit einem Client-Zertifikat und der CA-Kette der Unternehmens-CA |
| Anmeldedaten > Bind-User-DN | `CN=svc-ansibleforms,OU=Service Accounts,DC=example,DC=com` |
| Search Base | `OU=Users,DC=example,DC=com` |
| Mail-Attribut | `mail` |
| Benutzername-Attribut | `sAMAccountName` |
| Gruppen-Attribut | `memberOf` |
| Gruppenfilter | `^AF-` |

Mitglieder von `CN=AF-Operators,…` passen zu Rollen mit `ldap/AF-Operators` und melden sich als `jdoe` oder `jdoe@example.com` an.

---

## Beispiel für OpenLDAP

Dieses Beispiel verwendet eine Gruppensuche auf Einträgen vom Typ `groupOfNames` und funktioniert daher ohne das Overlay `memberof`:

| Einstellung | Wert |
|---|---|
| Anmeldedaten > Server | `ldap.example.com` |
| Anmeldedaten > Port | `636` |
| Anmeldedaten > TLS aktivieren | ein |
| Anmeldedaten > Bind-User-DN | `cn=readonly,dc=example,dc=com` |
| Search Base | `ou=people,dc=example,dc=com` |
| Mail-Attribut | `mail` |
| Benutzername-Attribut | `uid` |
| Gruppen-Attribut | `groups` |
| Gruppen-Search-Base | `ou=groups,dc=example,dc=com` |
| Gruppenklasse | `groupOfNames` |
| Gruppenmitglied-Attribut | `member` |
| Benutzerattribut für Gruppenmitglied | `dn` |

Ein Benutzer, der in `cn=af-admins,ou=groups,dc=example,dc=com` aufgeführt ist, erhält die Gruppe `ldap/af-admins`. Für Gruppen vom Typ `posixGroup`
verwenden Sie das **Gruppenmitglied-Attribut** `memberUid` und das **Benutzerattribut für Gruppenmitglied** `uid`.

Mit dem Overlay `memberof` lassen Sie die Felder der Gruppensuche leer und setzen das **Gruppen-Attribut** auf `memberOf`.

---

## Häufige Fallstricke

Die meisten LDAP-Probleme lassen sich auf eine dieser Ursachen zurückführen:

- **Ein lokaler Benutzer mit demselben Namen.** Lokale Benutzer werden zuerst geprüft, daher wird das Verzeichnis für diesen Namen nie gefragt.
- **Keine Gruppen oder die falschen.** Das Gruppen-Attribut muss existieren (`groups` mit einer Gruppensuche); `memberOf` überspringt Verschachtelungen.
- **Gruppennamen, die nicht passen.** Verwenden Sie `ldap/<CN>` in derselben Schreibweise, und prüfen Sie, dass der Gruppenfilter die Gruppe behält.
- **Gruppen-DNs, die nicht mit einem CN beginnen.** Nur der erste Wert `CN=` wird als Gruppenname verwendet, daher muss jeder Gruppen-DN
  mit `CN=` (oder `cn=`) beginnen.
- **Zertifikate.** TLS braucht beide Zertifikatsfelder der Anmeldedaten und einen passenden Servernamen; Zertifikate ignorieren ist nur zum Testen gedacht.
- **Einstellungen, die sich nicht speichern lassen.** Stammt ein Verzeichnis aus dem [Config-Seed](../seed/managed-objects.html), ist seine Seite
  schreibgeschützt: Ändern Sie stattdessen die Seed-Datei.

Eine fehlgeschlagene Anmeldung zeigt eine allgemeine Meldung. Der Grund wird vom Server protokolliert und im Audit-Protokoll festgehalten, und bei Active
Directory wird er aus dem Code des Verzeichnisses übersetzt, z. B. `Wrong password`, `Account locked` oder `Password expired`.
