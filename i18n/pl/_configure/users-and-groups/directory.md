---
layout: default
title: Użytkownicy i grupy z katalogu
parent: Użytkownicy i grupy
nav_order: 4
translated_from: 4798556ab97e1c3567a81681919e13c57d7a5b4f
---

# Użytkownicy i grupy z katalogu
{: .no_toc }

Użytkownicy i grupy LDAP, Entra ID i OIDC, w postaci z ostatniego logowania
{: .fs-6 .fw-300 }

Użytkownik LDAP, Entra ID lub OIDC ma swoją stronę pod `/settings/users/<source>/<name>`, ze źródłem `ldap`, `azuread` lub `oidc`,
np. `/settings/users/ldap/jdoe`. Pokazuje ona, tylko do odczytu, to, co zapisano przy ostatnim logowaniu użytkownika,
bo to katalog lub dostawca tożsamości decyduje, kim jest użytkownik i jakie ma grupy.

Jej karty są takie jak u użytkownika lokalnego. **Szczegóły** zawierają przełącznik **Zezwól na logowanie**, nazwę użytkownika, źródło, imię i nazwisko,
e-mail, czas, kiedy użytkownik został pierwszy raz zauważony, i jego ostatnie logowanie. **Grupy** wyświetlają grupy z ostatniego logowania.
**Tokeny API** wyświetlają tokeny API użytkownika, a **Unieważnij** od razu kończy jeden z nich.

W prawym górnym rogu **Zakończ sesje** od razu wylogowuje użytkownika wszędzie. **Zapomnij** usuwa rekord, który wraca
przy jego następnym logowaniu; jego zadania, zapisane zadania i harmonogramy zostają. Zablokowanego użytkownika nie można zapomnieć, bo
pozwoliłoby mu to znów się zalogować: serwer odpowiada `409`, więc najpierw zezwól mu na logowanie.

Grupy tego rekordu to też grupy, z którymi działa sesja użytkownika, odczytywane na bieżąco. Zapomnienie zalogowanego użytkownika
zostawia go bez grup i bez ról, które te grupy dają, dopóki nie zaloguje się ponownie.

Grupa z katalogu ma swoją stronę pod `/settings/groups/<source>/<name>`, tylko do odczytu, z kartami **Szczegóły**,
**Użytkownicy** (użytkownicy zauważeni w niej przy ich ostatnim logowaniu), **Role** i **Formularze**.
