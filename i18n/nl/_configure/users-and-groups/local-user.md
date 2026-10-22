---
layout: default
title: Een lokale gebruiker
parent: Gebruikers en groepen
nav_order: 1
translated_from: 9b36582b1f0f8b333a6e9dbb4524eb10723af183
---

# Een lokale gebruiker
{: .no_toc }

Een lokale gebruiker toevoegen, en de tabbladen van zijn pagina
{: .fs-6 .fw-300 }

**Gebruiker toevoegen** opent een wizard in drie stappen: **Gebruiker** (gebruikersnaam, beschrijving, e-mail), **Wachtwoord** en **Groep**.

De pagina van een gebruiker, `/settings/users/<id>`, heeft deze tabbladen:

| Tabblad | Wat het toont |
|---|---|
| **Details** | De schakelaar **Aanmelden toestaan**, de gebruikersnaam, de beschrijving, het e-mailadres en, vanaf 7.3.0, **Laatst aangemeld** |
| **Groepen** | De groepen waartoe de gebruiker behoort |
| **Rollen** | De rollen die de gebruiker heeft, en waar elke rol vandaan komt: **Direct**, **Via** een groep, of **Iedereen** |
| **Formulieren** | De formulieren die die rollen openen |
| **Jobs** | De jobs die de gebruiker heeft gestart, de nieuwste eerst |
| **Opgeslagen invoer** | De formulierwaarden die de gebruiker heeft opgeslagen om opnieuw uit te voeren |
| **Planners** | De jobs die de gebruiker met Later uitvoeren heeft gepland |
| **Activiteit** | Wat het auditlogboek de gebruiker heeft zien doen |
| **API-tokens** | De API-tokens van de gebruiker, met wanneer elk is aangemaakt, verloopt en voor het laatst is gebruikt; **Intrekken** beëindigt er een meteen |

Vanaf 7.3.0 worden de aanmeldingen van een lokale gebruiker vastgelegd, zoals dat bij een LDAP- of SSO-gebruiker al gebeurde: **Laatst aangemeld** toont de laatste, en
de gebruikerslijst heeft voor elke bron een sorteerbare kolom **Laatst aangemeld**, zodat een account dat niemand gebruikt opvalt. Een geweigerde aanmelding wordt niet
vastgelegd, en een lokale gebruiker die zich sinds de upgrade niet heeft aangemeld, toont `–`.

**Wachtwoord wijzigen** en **Verwijderen** staan rechtsboven. De gebruiker `admin` kan nooit worden verwijderd of hernoemd.
