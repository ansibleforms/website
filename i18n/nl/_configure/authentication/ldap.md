---
layout: default
title: LDAP
parent: Authenticatie
nav_order: 2
translated_from: a4089d681ad976e31e7ddefb29588bd3ca334dab
---

# LDAP
{: .no_toc }

Laat directorygebruikers zich aanmelden met hun eigen wachtwoord, en geef ze rollen via hun directorygroepen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Hoe het werkt

AnsibleForms maakt verbinding met de directory via een bindaccount, zoekt de gebruiker op en bindt daarna als die gebruiker om
het wachtwoord te controleren:

1. De gebruiker meldt zich aan met gebruikersnaam en wachtwoord. Als geen enkele **lokale** gebruiker die naam heeft, wordt LDAP geprobeerd.
2. AnsibleForms bindt met het bindaccount van de referentie van de directory, en doorzoekt de **Zoekbasis** naar een item waarvan het
   **Gebruikersnaam attribuut** gelijk is aan de gebruikersnaam.
3. Het bindt als het gevonden item, met het getypte wachtwoord.
4. De groepen worden uit het item gelezen (of uit een groepszoekopdracht), gefilterd, en krijgen het voorvoegsel `ldap/`.

Een gebruikersnaam in UPN-vorm (`jdoe@example.com`) die geen gebruiker vindt, wordt één keer opnieuw geprobeerd met het deel vóór de `@`, zodat gebruikers
zich met beide vormen kunnen aanmelden, ook als het Gebruikersnaam attribuut de korte naam bevat. Een verkeerd wachtwoord wordt nooit opnieuw geprobeerd.

Eén set instellingen dient voor Active Directory, OpenLDAP en andere; vanaf 7.3.0 kunnen er [meerdere directory's](#several-directories) zijn.

---

## Instellingen

Vanaf 7.3.0 gelden de instellingen per directory. **Toegang > LDAP** toont de directory's, in de volgorde waarin een kale gebruikersnaam wordt opgezocht:

![Toegang > LDAP](../assets/screenshots/ldap.jpg)

| Rijmenu | Wat het doet |
|---|---|
| Bewerken | Opent de pagina van de directory |
| Verbinding testen | Probeert een aanmelding met een testgebruikersnaam en -wachtwoord, zie [De verbinding testen](#testing-the-connection) |
| Inschakelen, Uitschakelen | Schakelt de directory in of uit; `main` wordt uitgeschakeld in plaats van verwijderd |
| Omhoog, Omlaag | Wijzigt de plaats in de opzoekvolgorde |
| Verwijderen | Verwijdert de directory; bij `main` getoond maar uitgeschakeld |

Het toevoegen van een directory vraagt de velden in vier stappen, de tabbladen van de pagina. **Details** bevat **Ingeschakeld**, de **Naam** en een **Beschrijving**:

| Tabblad | Instelling | Betekenis |
|---|---|---|
| Referenties | Referentie | Verplicht. Een `ldap`-referentie uit [Verbindingen > Inloggegevens](../credentials.html), die de verbinding bevat, zie hieronder |
| Gebruikers | Zoekbasis | DN waar het zoeken naar gebruikers begint, bijv. `OU=Users,DC=example,DC=com`. Subbomen worden ook doorzocht |
| Gebruikers | Gebruikersnaam attribuut | Attribuut dat met de aanmeldnaam wordt vergeleken: `sAMAccountName` in AD (de standaard), `uid` in OpenLDAP |
| Gebruikers | Mail attribuut | Attribuut met het e-mailadres, meestal `mail` |
| Gebruikers | Aanmelddomeinen | Domeinen waarvan aanmeldingen als `user@domain` rechtstreeks naar deze directory gaan, zie [Meerdere directory's](#several-directories) |
| Groepen | Groepen attribuut | Attribuut van het gebruikersitem dat de groepen bevat (`memberOf`, de standaard), of `groups` met een groepszoekopdracht |
| Groepen | Groepen zoekbasis | DN waar het zoeken naar groepen begint |
| Groepen | Groep klasse | objectClass van de groepen, bijv. `group`, `groupOfNames` of `posixGroup` |
| Groepen | Groepslid attribuut | Attribuut van een groep dat de leden opsomt, bijv. `member`, `uniqueMember` of `memberUid`; standaard `member` |
| Groepen | Groepslid gebruiker attribuut | Attribuut van de gebruiker dat in die lidwaarden staat, bijv. `dn` of `uid`; standaard `dn` |
| Groepen | Groepfilter | Reguliere expressie; alleen de groepen waarvan de naam overeenkomt blijven over. Leeg houdt elke groep |

De standaardwaarden van de laatste drie groepsvelden gelden alleen als de groepszoekopdracht wordt gebruikt, zie de volgende sectie.

De `ldap`-referentie bepaalt hoe de directory wordt bereikt en als wie er wordt gezocht:

| Veld | Betekenis |
|---|---|
| Servers | Eén per veld, als `host`, `host:port` of `ldaps://host:port`, in deze volgorde geprobeerd: als er een onbereikbaar is, wordt de volgende geprobeerd |
| Poort | `389` voor gewone LDAP, `636` voor LDAPS |
| TLS inschakelen | Verbinden met LDAPS (`ldaps://`). StartTLS op poort 389 wordt niet ondersteund |
| Certificaten negeren | De validatie van het servercertificaat overslaan. Alleen getoond met **TLS inschakelen** |
| Certificaat | Het clientcertificaat dat AnsibleForms aan de servers presenteert, in PEM, wanneer de certificaten worden gecontroleerd |
| CA-bundel | Het CA-certificaat of de CA-certificaten die het servercertificaat hebben ondertekend, in PEM, wanneer de certificaten worden gecontroleerd |
| Bind gebruiker DN | De DN van het serviceaccount dat de directory doorzoekt |
| Bind gebruiker wachtwoord | Het wachtwoord ervan, versleuteld opgeslagen of gelezen uit een [secret store](../secret-stores/) |

Alleen een admin kan een `ldap`-referentie toevoegen of wijzigen, zie [Wie een referentie mag wijzigen](../credentials.html#who-may-change-a-credential).
Tot en met 7.2.0 waren de servers, TLS en het bindaccount velden van de LDAP-instellingen. De upgrade naar 7.3.0 verplaatst ze naar een referentie,
zie [Adressen in referenties](../credentials/types.html#addresses-in-credentials):

| De directory vóór de upgrade | Waar de servers naartoe gaan |
|---|---|
| Een eigen bind-DN en wachtwoord, geen referentie | Een nieuwe `ldap`-referentie met de naam `<directory>-ldap`, zoals `main-ldap` |
| Een referentie zonder servers | Naar die referentie |
| Een referentie die al andere servers bevat | Een kopie van de referentie met de naam `<credential>-<directory>`, die de directory dan noemt |

Een naam die al bezet is, krijgt `-2`, `-3` enzovoort. Een directory uit de configuratie-seed blijft zoals hij is: de seed is er eigenaar van.

---

## Groepen

De groepen komen van een van twee plaatsen, en het **Groepen attribuut** bepaalt welke wordt gebruikt:

- **Een attribuut van het gebruikersitem**, meestal `memberOf`. Dit is de gebruikelijke opzet voor Active Directory, en voor
  OpenLDAP met de overlay `memberof`.
- **Een groepszoekopdracht**, voor directory's zonder `memberOf`. Die draait alleen als **Groepen zoekbasis** en **Groep klasse**
  allebei zijn ingesteld: AnsibleForms zoekt dan naar groepen van die klasse waarvan het **Groepslid attribuut** het
  **Groepslid gebruiker attribuut** van de gebruiker bevat, en slaat het resultaat op in het attribuut `groups`. Zet **Groepen attribuut** op `groups`
  om het te gebruiken.

{: .note }
> Met **Groepen attribuut** `memberOf` draait een geconfigureerde groepszoekopdracht wel, maar wordt het resultaat niet voor de rollen gebruikt.

Elke groep is een DN, en AnsibleForms houdt de eerste CN: `CN=AF-Admins,OU=Groups,DC=example,DC=com` wordt `AF-Admins`.
Het **Groepfilter** wordt dan op die naam toegepast, en de overgebleven groepen krijgen het voorvoegsel `ldap/`: `ldap/AF-Admins`.

In grote directory's houdt het filter tokens en jobs klein; een ongeldige reguliere expressie houdt alle groepen en wordt gelogd.

---

## Koppelen aan rollen

In config.yaml is een LDAP-groep `ldap/<group CN>` en een LDAP-gebruiker `ldap/<username>`, beide hoofdlettergevoelig:

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

De gebruikersnaam is de waarde van het **Gebruikersnaam attribuut** zoals de directory die teruggeeft, niet zoals de gebruiker hem typte.
Zie [Rollen](../config/roles.html) voor de rolinstellingen.

---

## Meerdere directory's

Vanaf 7.3.0 kunnen er meerdere directory's zijn, elk met eigen servers, gebruikers en groepen. Hun namen houden hun leden uit elkaar:

| Directory | Gebruikersnaam | Groepen | In een rol |
|---|---|---|---|
| `main` | `jdoe` | `ldap/AF-Admins` | `ldap/jdoe`, `ldap/AF-Admins` |
| Elke andere, zoals `corp` | `corp/jdoe` | `ldap/corp/AF-Admins` | `ldap/corp/jdoe`, `ldap/corp/AF-Admins` |

Een gebruiker noemt de directory bij het aanmelden als `corp\jdoe` of `corp/jdoe`, of meldt zich aan met een adres van een domein dat de directory
bezit. Een kale gebruikersnaam wordt in elke ingeschakelde directory geprobeerd, in hun volgorde, en dat geldt ook voor een naam zoals `other\jdoe` als er geen
directory `other` heet: die wordt dan opgezocht zoals getypt.

De eerste directory die de gebruiker kent, beslist: een verkeerd wachtwoord daar is het antwoord, en de volgende directory wordt niet
geprobeerd, omdat die iemand anders met dezelfde naam kan bevatten. Een directory die onbereikbaar is, wordt overgeslagen.

De directory die tot en met 7.2.0 `default` heette, heet vanaf 7.3.0 `main`: de upgrade hernoemt hem, en een nieuwe installatie begint
met `main`. De leden behouden hun korte namen, dus de rollen die ze noemen hoeven niet te worden gewijzigd. De directory `main` kan niet
worden hernoemd, en een directorynaam bevat alleen letters, cijfers, `-` en `_`.

---

## De verbinding testen

**Verbinding testen** vraagt om een testgebruikersnaam en -wachtwoord, en probeert een aanmelding met de instellingen op het scherm, opgeslagen of niet.
Bij succes toont het het directory-item van de gebruiker, dat je de exacte attribuutnamen en groeps-DN's laat zien die je moet gebruiken.

Een testgebruiker die niet bestaat, meldt toch succes: de verbinding en het bindaccount werken, alleen de gebruiker wordt niet
gevonden. Typische fouten:

| Bericht | Oorzaak |
|---|---|
| `Bad server or port (connection failed)` | De hostnaam wordt niet opgelost of de poort is niet bereikbaar. |
| `Wrong binding credentials` | De bind-DN of het wachtwoord van de referentie van de directory is onjuist. |
| `Unable to verify the certificate` | Het servercertificaat is niet ondertekend door de CA-bundel van de referentie. |
| `Certificate is not valid` | Het Certificaat of de CA-bundel van de referentie bevat geen geldig PEM-certificaat. |

---

## Voorbeeld voor Active Directory

Dit voorbeeld maakt via LDAPS verbinding met twee domeincontrollers en houdt alleen de groepen waarvan de naam met `AF-` begint:

| Instelling | Waarde |
|---|---|
| Referentie > Servers | `dc01.example.com`, daarna `dc02.example.com` |
| Referentie > Poort | `636` |
| Referentie > TLS inschakelen | aan |
| Referentie > Certificaten negeren | uit, met een clientcertificaat en de CA-keten van de enterprise-CA |
| Referentie > Bind gebruiker DN | `CN=svc-ansibleforms,OU=Service Accounts,DC=example,DC=com` |
| Zoekbasis | `OU=Users,DC=example,DC=com` |
| Mail attribuut | `mail` |
| Gebruikersnaam attribuut | `sAMAccountName` |
| Groepen attribuut | `memberOf` |
| Groepfilter | `^AF-` |

Leden van `CN=AF-Operators,…` matchen rollen met `ldap/AF-Operators`, en melden zich aan als `jdoe` of `jdoe@example.com`.

---

## Voorbeeld voor OpenLDAP

Dit voorbeeld gebruikt een groepszoekopdracht op items van het type `groupOfNames`, zodat het zonder de overlay `memberof` werkt:

| Instelling | Waarde |
|---|---|
| Referentie > Servers | `ldap.example.com` |
| Referentie > Poort | `636` |
| Referentie > TLS inschakelen | aan |
| Referentie > Bind gebruiker DN | `cn=readonly,dc=example,dc=com` |
| Zoekbasis | `ou=people,dc=example,dc=com` |
| Mail attribuut | `mail` |
| Gebruikersnaam attribuut | `uid` |
| Groepen attribuut | `groups` |
| Groepen zoekbasis | `ou=groups,dc=example,dc=com` |
| Groep klasse | `groupOfNames` |
| Groepslid attribuut | `member` |
| Groepslid gebruiker attribuut | `dn` |

Een gebruiker die in `cn=af-admins,ou=groups,dc=example,dc=com` staat, krijgt de groep `ldap/af-admins`. Gebruik voor groepen van het type `posixGroup`
**Groepslid attribuut** `memberUid` en **Groepslid gebruiker attribuut** `uid`.

Laat met de overlay `memberof` de velden van de groepszoekopdracht leeg en zet **Groepen attribuut** op `memberOf`.

---

## Veelvoorkomende valkuilen

De meeste LDAP-problemen komen neer op een van deze:

- **Een lokale gebruiker met dezelfde naam.** Lokale gebruikers worden eerst gecontroleerd, dus de directory wordt nooit naar die naam gevraagd.
- **Geen groepen, of de verkeerde.** Het Groepen attribuut moet bestaan (`groups` met een groepszoekopdracht); `memberOf` slaat nesting over.
- **Groepsnamen die niet overeenkomen.** Gebruik `ldap/<CN>` met dezelfde hoofdletters, en controleer of het Groepfilter de groep behoudt.
- **Groeps-DN's die niet met een CN beginnen.** Alleen de eerste waarde `CN=` wordt als groepsnaam gebruikt, dus elke groeps-DN
  moet met `CN=` (of `cn=`) beginnen.
- **Certificaten.** TLS heeft beide certificaatvelden van de referentie nodig en een overeenkomende servernaam; Certificaten negeren is alleen om te testen.
- **Instellingen die niet kunnen worden opgeslagen.** Als een directory uit de [configuratie-seed](../seed/managed-objects.html) komt, is de pagina ervan
  alleen-lezen: wijzig dan het seedbestand.

Een mislukte aanmelding toont een algemeen bericht. De reden wordt door de server gelogd en in het auditlogboek bewaard, en voor Active
Directory wordt ze vertaald vanuit de code van de directory, bijv. `Wrong password`, `Account locked` of `Password expired`.
