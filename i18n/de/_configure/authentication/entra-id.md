---
layout: default
title: Entra ID
parent: Authentifizierung
nav_order: 3
translated_from: c5dad595f7df36cfd31a902ad0a44c7b5bb02f4e
---

# Entra ID
{: .no_toc }

Single Sign-on mit Microsoft Entra ID (Azure AD), mit Rollen aus den Entra ID-Gruppen des Benutzers
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Funktionsweise

Ist ein Entra ID-Anbieter aktiviert, zeigt die Anmeldeseite unter **Anmelden** eine Entra ID-Schaltfläche. Eine Anmeldung läuft dann so ab:

1. Die Schaltfläche schickt den Browser zu `/api/v2/auth/entraid`, das ihn zu Microsoft weiterleitet.
2. Der Benutzer meldet sich bei Microsoft an, das mit einem Autorisierungscode zur **Umleitungs-URL** zurückleitet. Der Server
   tauscht diesen Code bei Microsoft gegen das ID-Token und ein Zugriffstoken für Microsoft Graph.
3. Der Server liest die Gruppen des Benutzers aus Microsoft Graph (`/v1.0/me/transitiveMemberOf`), sodass auch verschachtelte Gruppen zählen.
4. Die Gruppen werden mit dem **Gruppenfilter** nach ihrem Anzeigenamen gefiltert, und jede verbleibende Gruppe wird zweimal gespeichert,
   als `azuread/<object id>` und als `azuread/<display name>`.

Der Benutzername ist der Claim `upn` des Tokens, z. B. `jdoe@example.com`, oder der Claim `preferred_username`, wenn das Token
kein `upn` hat; bei einem Geschäftskonto enthalten beide denselben Wert.

---

## Die Anwendung registrieren

AnsibleForms braucht eine App-Registrierung im Entra Admin Center, unter **App registrations > New registration**:

1. Geben Sie ihr einen Namen, wählen Sie **Accounts in this organizational directory only** als unterstützte Kontotypen und fügen Sie einen
   Redirect URI vom Typ **Web** hinzu: `https://af.example.com/api/v2/auth/entraid/callback`.
2. Erstellen Sie unter **Certificates & secrets** ein Client-Secret und kopieren Sie seinen Wert; er wird nur einmal angezeigt.
3. Fügen Sie unter **API permissions** die **delegierten** Microsoft Graph-Berechtigungen `User.Read` und `GroupMember.Read.All` hinzu
   und erteilen Sie dafür die Administratorzustimmung.
4. Notieren Sie auf der Seite **Overview** die **Application (client) ID** und die **Directory (tenant) ID**.

Der Redirect URI ist die Adresse, unter der Benutzer AnsibleForms erreichen, gefolgt von `/api/v2/auth/entraid/callback`.
Mit [`BASE_URL`](../customization/server.html#env_BASE_URL) `/forms` wird daraus
`https://af.example.com/forms/api/v2/auth/entraid/callback`. Er muss exakt mit der **Umleitungs-URI** der
Anmeldedaten des Anbieters übereinstimmen.

Bis 7.2.0 lautete der Pfad `/api/v2/auth/azureadoauth2/callback`. Er funktioniert ab 7.3.0 weiterhin, sodass eine bestehende Registrierung
nicht geändert werden muss; Anmeldedaten mit leerer **Umleitungs-URI** verwenden den neuen Pfad, fügen Sie ihn dann also der Registrierung hinzu.

AnsibleForms liest die Gruppen aus Graph und verwendet keinen Gruppen-Claim im Token, daher muss in der Registrierung kein Gruppen-Claim
konfiguriert werden.

---

## Den Anbieter hinzufügen

Fügen Sie den Anbieter unter **Zugriff > SSO** hinzu: Ein Assistent fragt seine Felder in vier Schritten ab, mit **Microsoft Entra ID** im Schritt **Typ**:

| Schritt | Feld | Bedeutung |
|---|---|---|
| Details | Name, Beschreibung | Ein eindeutiger Name für den Anbieter und eine optionale Beschreibung |
| Typ | Anbieter | **Microsoft Entra ID**; beim Anlegen festgelegt, bleibt er so |
| Anmeldedaten | Anmeldedaten-Eintrag | Ein **Microsoft Entra ID**-Eintrag aus [Verbindungen > Anmeldedaten](../credentials.html), siehe unten |
| Gruppen | Gruppenfilter | Regulärer Ausdruck; nur die Gruppen, deren Anzeigename passt, bleiben erhalten. Leer behält jede Gruppe |

Die Anmeldedaten enthalten die App-Registrierung, daher kann nur ein Admin sie hinzufügen oder ändern:

| Feld | Bedeutung |
|---|---|
| Tenant-ID | Erforderlich. Die Directory (tenant) ID, eine GUID, oder eine der Domänen des Tenants. Nur Benutzer dieses Tenants können sich anmelden |
| Client-ID | Die Application (client) ID |
| Client-Secret | Der Wert des Client-Secrets, verschlüsselt gespeichert oder aus einem [Secret Store](../secret-stores/) gelesen |
| Umleitungs-URI | Wie registriert, z. B. `https://af.example.com/api/v2/auth/entraid/callback`. Leer: die URL der App und der Callback-Pfad |

Anmeldedaten mit leerer Tenant-ID werden beim Speichern abgewiesen. Die Multi-Tenant-Endpunkte `common`, `organizations`
und `consumers` werden abgewiesen, wenn der Anbieter gespeichert wird, der diese Anmeldedaten verwendet, da sie Benutzern jedes
Microsoft-Tenants die Anmeldung erlauben würden. Bei der Anmeldung prüft der Server außerdem, dass das Token vom konfigurierten Tenant stammt. Ein Anbieter,
der früher ohne Tenant-ID gespeichert wurde, meldet niemanden an: Bis die Tenant-ID eingetragen ist, protokolliert der Server
`Could not enable Microsoft Entra ID: set the tenant id to your tenant ('' would let any Microsoft tenant log in)`.

Bis 7.2.0 waren Tenant, Client-ID, Secret und Umleitungs-URL Felder des Anbieters. Das Upgrade auf 7.3.0 verschiebt sie in
Anmeldedaten namens `<provider>-sso`, siehe [Adressen in Anmeldedaten](../credentials/types.html#addresses-in-credentials).
Wählen Sie für jeden neuen Anbieter Anmeldedaten: Der Server akzeptiert weiterhin einen Anbieter mit eigener Client-ID und eigenem Secret aus der Zeit
vor 7.3.0, der sich damit anmeldet, bis Anmeldedaten gewählt sind.

Es ist jeweils ein Entra ID-Anbieter aktiviert, der, mit dem sich die Entra ID-Schaltfläche anmeldet. **Aktivieren** im Menü der Zeile eines anderen
oder sein Schalter **Aktiviert** schaltet die anderen seines Typs aus; die Spalte **Aktiviert** der Liste zeigt, welcher verwendet wird. Ein Anbieter
kann auch die Anmeldeseite überspringen, siehe [Single Sign-on umschalten](./#switching-single-sign-on). Das Speichern wendet ihn sofort an, ohne Neustart.

---

## Zuordnung zu Rollen

In config.yaml ist eine Entra ID-Gruppe `entraid/<object id>` oder `entraid/<display name>`, und ein Benutzer ist `entraid/<upn>`.
Die Objekt-ID ist im Tenant eindeutig und daher die sicherere Wahl; ein Anzeigename ist leichter zu lesen:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - entraid/0b6c8e1a-2f4d-4c7e-9a3b-5d1e7f2a4c6b
  - name: operator
    groups:
      - entraid/AF-Operators
    users:
      - entraid/jdoe@example.com
```

Bis 7.2.0 war das Präfix `azuread/`. In einer Rolle passt es ab 7.3.0 weiterhin zu denselben Mitgliedern und wird in 8.0 entfernt; der
Rolleneditor schreibt `entraid/`. Nur die Rollen akzeptieren `entraid/`: Die Gruppen des Benutzers werden als `azuread/<object id>` und
`azuread/<display name>` gespeichert, und die Profilseite und die Extravar `ansibleforms_user` zeigen sie so. Ein **Gruppenfilter** wie `^AF-` behält nur die Gruppen, die Ihre Rollen verwenden; siehe [Rollen](../config/roles.html). Ab 7.1.0
enthält das Anmeldetoken die Gruppen nicht mehr, sodass seine Größe nicht mehr mit ihnen wächst. Der Filter ist trotzdem wichtig für
Benutzer in vielen Gruppen: Bei jeder Anmeldung werden weniger Gruppen mit den Rollen abgeglichen, und der
[Verzeichniseintrag](../users-and-groups/directory.html) des Benutzers listet nur die Gruppen auf, die zählen. Vor 7.1.0
braucht ein Benutzer in hundert oder mehr Gruppen ihn, um überhaupt Formulare zu sehen, siehe
[Leere Formulare und Jobs nach einem Single Sign-on](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).

---

## Endpunkt von Microsoft Graph

Der Server meldet Benutzer standardmäßig bei `https://login.microsoftonline.com` an und ruft Microsoft Graph unter `https://graph.microsoft.com` auf:

| Variable | Was sie ändert |
|---|---|
| [`ENTRA_AUTHORITY_URI`](../customization/security.html#env_ENTRA_AUTHORITY_URI) | Die Anmeldeautorität, für eine nationale Cloud wie `https://login.microsoftonline.us` |
| [`ENTRA_GRAPH_URI`](../customization/security.html#env_ENTRA_GRAPH_URI) | Der Graph-Endpunkt, aus dem die Gruppen gelesen werden, etwa `https://graph.microsoft.us` |

Beide nehmen eine Basis-URI ohne abschließenden Schrägstrich und sind neu in 7.3.0. `AZURE_AUTHORITY_URI` und `AZURE_GRAPH_URI` werden weiterhin gelesen,
wenn sie nicht gesetzt sind, mit einer Warnung im Protokoll, und werden in 8.0 entfernt. Der Server muss Graph erreichen: Eine Anmeldung schlägt fehl, wenn die Gruppen nicht gelesen werden können.

---

## Einschränkungen

Entra ID-Benutzer melden sich bei Microsoft an, daher funktionieren einige Dinge anders als bei lokalen und LDAP-Konten:

- Sie haben kein Passwort in AnsibleForms und können es dort daher nicht ändern; ein [API-Token](../profile/api-token.html) wird aus ihrer Sitzung erstellt.
- Anzeigenamen sind in Entra ID nicht eindeutig: Zwei Gruppen mit demselben Namen werden derselben Rolle zugeordnet. Benennen Sie die Gruppe in der Rolle über ihre
  Objekt-ID, `entraid/<object id>`, damit nur diese Gruppe passt.
