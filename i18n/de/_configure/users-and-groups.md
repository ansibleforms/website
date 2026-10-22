---
layout: default
title: Benutzer und Gruppen
nav_order: 15
has_children: true
has_toc: false
permalink: /users-and-groups.html
translated_from: 8ed4dc089c64e091636c29884af1cd1002eb40aa
---

# Benutzer und Gruppen
{: .no_toc }

Die lokalen Benutzer und Gruppen, die aus LDAP und Single Sign-on daneben und das Sperren einer Anmeldung
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Für Administratoren: Verwalten Sie unter **Einstellungen > Zugriff > Benutzer** und **Gruppen**, wer sich anmelden darf, mit der Rollenoption `showSettings`.

Der integrierte Admin, die Anmeldereihenfolge und die Rollenzuordnung lokaler Konten stehen unter [Lokale Konten](authentication/local.html).

---

## In diesem Abschnitt

| Seite | Inhalt |
|---|---|
| [Ein lokaler Benutzer](users-and-groups/local-user.html) | Einen lokalen Benutzer hinzufügen und die Tabs seiner Seite |
| [Mehrere Gruppen](users-and-groups/several-groups.html) | Ein lokaler Benutzer in mehreren Gruppen und seine Rollen |
| [Eine lokale Gruppe](users-and-groups/local-group.html) | Die Seite einer lokalen Gruppe und ihre Tabs |
| [Verzeichnisbenutzer und -gruppen](users-and-groups/directory.html) | Benutzer und Gruppen aus LDAP, Entra ID und OIDC, wie zuletzt gesehen |
| [Eine Anmeldung sperren](users-and-groups/blocking-a-sign-in.html) | Anmeldung erlauben: einen Benutzer sperren, ohne etwas zu löschen |


---

## Die Listen

Die Listen **Benutzer** und **Gruppen** zeigen die lokalen Benutzer und Gruppen und daneben die aus LDAP und Single Sign-on.

Ein Benutzer oder eine Gruppe aus LDAP, Entra ID oder OIDC wird aufgeführt, sobald er sich angemeldet hat (oder bei einer Anmeldung gesehen wurde) oder sobald eine Rolle ihn nennt.
Die Spalte **Herkunft** sagt, woher jeder stammt: Lokal, LDAP, Microsoft Entra ID oder OIDC. Ab 7.3.0 hat die Liste **Benutzer** außerdem
eine Spalte **Letzte Anmeldung**, die sagt, wann sich jeder Benutzer zuletzt angemeldet hat.

Eine Zeile öffnet die Seite ihres Benutzers oder ihrer Gruppe. **Benutzer hinzufügen** und **Gruppe hinzufügen** legen einen lokalen an.

---

## Konten, die Admin-Rechte gewähren

Die Rolle admin in config.yaml nennt lokale Gruppen und Benutzer, daher darf nur ein Admin die Konten und Gruppen ändern, die sie nennt.

Ein Benutzer mit `showSettings`, aber ohne die Rolle admin kann ein lokales Konto, das die Rolle admin nennt (direkt oder über eine seiner Gruppen), weder ändern noch sperren,
umgruppieren, sein Passwort setzen oder löschen. Ebenso wenig kann er eine Gruppe, die die Rolle admin nennt, anlegen, umbenennen oder löschen
oder einen Benutzer in eine solche aufnehmen. Dasselbe gilt für einen LDAP- oder SSO-Benutzer, der der Rolle admin zugeordnet ist: Ihn zu sperren,
seine Sitzungen zu beenden, ihn zu vergessen und seine API-Token zu widerrufen, ist Sache eines Admins. Der Server beantwortet eine solche Anfrage mit `403`.

