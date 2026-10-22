---
layout: default
title: Lokale accounts
parent: Authenticatie
nav_order: 1
translated_from: 002a371f2b4dbe5cc9c99ee569b8cf17a2a4ac88
---

# Lokale accounts
{: .no_toc }

De ingebouwde admin, en de gebruikers en groepen die in de AnsibleForms-database staan
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## De ingebouwde admin

Bij elke start worden de lokale groep `admins` en de admin-gebruiker aangemaakt als ze ontbreken; drie variabelen sturen de admin:

| Variabele | Standaard | Betekenis |
|---|---|---|
| [`ADMIN_USERNAME`](../customization/server.html#env_ADMIN_USERNAME) | `admin` | Gebruikersnaam van de admin, aangemaakt in de groep `admins` als geen enkele gebruiker die naam heeft. |
| [`ADMIN_PASSWORD`](../customization/server.html#env_ADMIN_PASSWORD) | `AnsibleForms!123` | Wachtwoord dat de admin krijgt wanneer hij wordt aangemaakt (of gereset). |
| [`REINIT_ADMIN`](../customization/server.html#env_REINIT_ADMIN) | `0` | `1` zet het wachtwoord van de admin terug op `ADMIN_PASSWORD` en plaatst hem weer in `admins`. |

`ADMIN_PASSWORD` wordt alleen gebruikt wanneer de gebruiker wordt aangemaakt of gereset: het later wijzigen doet op zichzelf niets.

Een lokale gebruiker die zich aanmeldt met het openbare standaardwachtwoord `AnsibleForms!123` kan het alleen wijzigen. De browser opent een
pagina om het wachtwoord te wijzigen die niet kan worden gesloten, en de server beantwoordt elk ander verzoek met `403` (code
`password_change_required`) totdat het wachtwoord is gewijzigd. Het nieuwe wachtwoord moet verschillen van het standaardwachtwoord; na de
wijziging meldt de gebruiker zich er opnieuw mee aan. Stel `ADMIN_PASSWORD` vóór de eerste start in op je eigen waarde om deze stap over te slaan.

Als je `ADMIN_USERNAME` na de eerste start wijzigt, wordt een tweede admin-gebruiker met die naam aangemaakt; de oude blijft bestaan.

{: .warning }
> `REINIT_ADMIN=1` reset het wachtwoord bij **elke** start zolang het is ingesteld. Gebruik het om een verloren adminwachtwoord te herstellen,
> verwijder het daarna en herstart.

---

## Gebruikers en groepen

Lokale gebruikers en groepen worden beheerd onder **Toegang > Gebruikers** en **Toegang > Groepen**. Een gebruiker heeft deze velden:

| Veld | Betekenis |
|---|---|
| Gebruikersnaam | De aanmeldnaam. Moet uniek zijn. |
| Beschrijving | Optioneel. |
| Wachtwoord | Opgeslagen als hash. Wijzig het later met de actie **Wachtwoord wijzigen**. |
| E-mail | Optioneel. |
| Groep | De eerste lokale groep van de gebruiker. Voeg er meer toe op het tabblad **Groepen** van de pagina van de gebruiker. |

Lokale gebruikers wijzigen hun eigen wachtwoord in hun profiel; andere gebruikers doen dat in hun directory of identity provider.

Een gebruiker kan tot meerdere groepen behoren, en krijgt de rollen van al die groepen. Het tabblad **Groepen** van de pagina van een gebruiker voegt
groepen toe en verwijdert ze, en dat doet ook het tabblad **Gebruikers** van de pagina van een groep. Een gebruiker houdt minstens één groep: de laatste kan niet
worden verwijderd.

Een groep die nog gebruikers heeft, kan niet worden verwijderd: verwijder eerst de gebruikers. De groep `admins` kan nooit worden verwijderd of
hernoemd, en de gebruiker `admin` kan nooit worden verwijderd.

---

## Aanmelden toestaan

Het tabblad **Details** van de pagina van een gebruiker heeft een schakelaar **Aanmelden toestaan**, ook beschikbaar als **Aanmelden blokkeren** en **Aanmelden
toestaan** in het rijmenu van de gebruikerslijst. Hij bestaat voor lokale gebruikers en evengoed voor LDAP- en SSO-gebruikers:

- **Aan**: de gebruiker meldt zich zoals gewoonlijk aan.
- **Uit**: de sessies van de gebruiker eindigen meteen en elke aanmelding wordt geweigerd, totdat een admin hem weer inschakelt. De pagina
  vraagt eerst om bevestiging.

De schakelaar kan niet worden uitgezet voor de gebruiker `admin`, de weg terug naar binnen, en ook niet door een admin voor zijn eigen account. De pagina van
een LDAP- of SSO-gebruiker heeft ook **Sessies beëindigen**, waarmee de gebruiker overal wordt afgemeld zonder hem te blokkeren.

---

## Koppelen aan rollen

Rollen noemen lokale groepen `local/<group>` en gebruikers `local/<user>`; standaard krijgt `admins` de rol `admin`:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
  - name: operator
    groups:
      - local/operators
    users:
      - local/svc-backup
```

Houd `local/admins` in de rol `admin`, zodat de ingebouwde admin zich altijd kan aanmelden, ook als de directory of de
identity provider niet beschikbaar is. Als config.yaml helemaal niet kan worden geladen, krijgen leden van `local/admins` nog steeds de
rol `admin`, zodat je je kunt aanmelden en het kunt herstellen. Zie [Rollen](../config/roles.html) voor de rolinstellingen.

---

## Lokale accounts en LDAP

Een aanmelding met gebruikersnaam en wachtwoord controleert de lokale gebruikers vóór LDAP. Als een lokale gebruiker dezelfde naam heeft als een directorygebruiker,
wint het lokale account altijd en werkt het directorywachtwoord niet voor die naam. Geef lokale accounts namen
die niet kunnen botsen met directoryaccounts, bijvoorbeeld met het voorvoegsel `svc-`.
