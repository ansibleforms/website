---
layout: default
title: Role
parent: config.yaml
nav_order: 2
translated_from: c23a8fb9203e85e81cd128d2c129228c0a207f6c
---

# Role
{: .no_toc }

Mapuj użytkowników i grupy na role i ustalaj, co każda rola może robić.
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Atrybut roles

Lista `roles` najwyższego poziomu w config.yaml:

{% include config_attribute.html name="roles" %}

---

## Rola default

Każdy zalogowany użytkownik ma rolę `default`, więc formularz z `roles: [default]` jest dostępny dla każdego, kto może się zalogować. Nie
ma dostępu anonimowego: nikt nie dostaje tej roli bez zalogowania.

Rola nie zawiera grup ani użytkowników, bo i tak obowiązuje wszystkich. Jej `options` są wartościami domyślnymi dla wszystkich, jak
opisano niżej w [Opcje ról](#role-options). `config.yaml` musi mieć rolę `admin` i rolę `default`, a
strona ról pokazuje obie jako **Wymagane**.

Przed wersją 7.0.0 `default` nazywała się `public`, a stara nazwa nadal działa:

- **W formularzu** `roles: [public]` nadal pasuje do każdego użytkownika, więc formularze w Twoich repozytoriach nie wymagają zmian.
- **W `config.yaml`** rola o nazwie `public` jest przy wczytywaniu konfiguracji przemianowywana w pliku na `default`. Zmienia się tylko
  nazwa, najpierw tworzona jest kopia zapasowa konfiguracji, a konfiguracja trzymana w repozytorium ma potem zmianę do wypchnięcia.
- **W szablonie ytt** szablon nie jest przepisywany: przemianowywana jest konfiguracja, którą generuje, a ostrzeżenie w dzienniku prosi
  o zmianę nazwy roli także w szablonie. Wersja 8 odrzuci tam rolę `public`.

Konfiguracja z rolą `default` i rolą `public` jednocześnie jest odrzucana, bo to ta sama rola.

---

## Obiekt Role

Każdy wpis listy `roles`:

{% include config_object.html name="Role" %}

---

## Opcje ról

`options` roli włączają lub wyłączają funkcje dla jej członków. Od wersji 7.3.0 strona roli pokazuje je w czterech grupach,
każdą opcję z (i), które mówi, co daje, tym samym tekstem, który pokazuje widok **Uprawnienia** w profilu:

| Opcja | Pozwala użytkownikowi | Domyślnie |
|---|---|---|
| **Ustawienia** | | |
| `showSettings` | Widzieć i zmieniać każdą stronę ustawień; dziennik serwera i kopie zapasowe mają własne opcje | Tylko admini |
| `showAppearanceSettings` | Zmieniać ustawienia wyglądu, bez pozostałych ustawień (od 7.3.0) | Wyłączona |
| `showConnectionsSettings` | Zarządzać ustawieniami połączeń (poświadczenia, runnery i inne), bez pozostałych ustawień (od 7.3.0) | Wyłączona |
| `showLogs` | Widzieć dziennik serwera | Tylko admini |
| `showAuditLog` | Widzieć dziennik audytu, bez pozostałych ustawień (od 7.3.0) | Tylko admini |
| `allowBackupOps` | Tworzyć kopię zapasową bazy danych i ją przywracać | Tylko admini |
| **Projektant** | | |
| `showDesigner` | Widzieć projektanta i z niego korzystać | Tylko admini |
| `allowFormDesign` | Edytować konfigurację formularzy w projektancie: kategorie, stałe i formularze. Bez niej tylko do odczytu (od 7.3.0) | Włączona |
| `allowPlaybookDesign` | Edytować playbooki w projektancie: zapisywać, tworzyć, usuwać i wypychać je. Bez niej tylko do odczytu | Włączona |
| `allowWorkflowDesign` | Edytować workflowy w projektancie: zapisywać, tworzyć, usuwać i wypychać je. Bez niej tylko do odczytu | Włączona |
| `allowInventoryDesign` | Edytować inwentarze w projektancie: zapisywać, tworzyć, usuwać i wypychać je. Bez niej tylko do odczytu | Włączona |
| `allowVarsFileDesign` | Edytować pliki zmiennych w projektancie: zapisywać, tworzyć, usuwać i wypychać je. Bez niej tylko do odczytu | Włączona |
| **Zadania** | | |
| `showJobs` | Widzieć stronę zadań | Włączona |
| `showAllJobLogs` | Widzieć zadania każdego użytkownika, nie tylko własne | Tylko admini |
| `manageAllJobs` | Przerywać, usuwać i ponownie uruchamiać zadania każdego użytkownika; usuwanie i ponowne uruchamianie wymagają też dwóch opcji poniżej (od 7.3.0) | Tylko admini |
| `showExtravars` | Widzieć extravars formularza i zadania | Włączona |
| `showDebugButtons` | Widzieć przyciski debugowania w formularzu | Włączona |
| `showArtifacts` | Widzieć artefakty zadania: to, co zwraca zadanie AWX, lub to, co playbook zebrał przez `set_stats` | Włączona |
| `allowVerboseMode` | Uruchamiać zadania w trybie verbose | Włączona |
| `allowJobRelaunch` | Ponownie uruchamiać zadanie z danymi formularza z wcześniejszego uruchomienia | Tylko admini |
| `allowJobDeletion` | Usuwać zadania: własne albo, z `manageAllJobs`, każdego użytkownika. Bez niej historia zadań pozostaje kompletna (od 7.3.0) | Włączona |
| `allowScheduledJobs` | Tworzyć harmonogramy cykliczne i jednorazowe oraz nimi zarządzać na stronie **Harmonogramy** (zobacz ostrzeżenie poniżej) | Tylko admini |
| `allowPlannedJobs` | Zaplanować jednorazowe uruchomienie zadania o ustalonej porze (**Uruchom później**) | Włączona |
| `allowStoredJobs` | Zapisywać dane formularza i wczytywać je później | Włączona |
| **Dostęp i integracje** | | |
| `allowLogin` | Logować się do AnsibleForms | Włączona |
| `allowChat` | Używać [asystenta czatu](../chat/), gdy jest włączony | Włączona |
| `allowMcp` | Używać [serwera MCP](../mcp/) z agenta AI, gdy jest włączony | `allowChat` danej roli |
| `allowFileUploads` | Przesyłać pliki przez pola plików formularza (od 7.3.0) | Włączona |
| `allowApiTokens` | Tworzyć [tokeny API](../profile/api-token.html) dla skryptów, do najdłuższego czasu życia, na jaki pozwala instancja (od 7.3.0) | Wyłączona |
| `extendedTokenExpiration` | Tworzyć też tokeny API, które nigdy nie wygasają; wymaga `allowApiTokens` | Wyłączona |

Niektóre opcje obejmują inne, a strona roli pokazuje te objęte jako włączone i wyszarzone:

- **`showSettings`** daje też `showAppearanceSettings`, `showConnectionsSettings` i `showAuditLog`.
- **`manageAllJobs`** daje też `showAllJobLogs`, bo działanie na zadaniach każdego użytkownika oznacza ich widzenie.
- **Opcje projektowania** mają znaczenie tylko z `showDesigner`, a `extendedTokenExpiration` tylko z `allowApiTokens`.

Do wersji 7.2.0 `showAllJobLogs` pozwalało też przerywać i usuwać wyświetlane zadania; od 7.3.0 wymaga to `manageAllJobs`.
Rola sprzed 7.3.0 z `extendedTokenExpiration` i bez `allowApiTokens` dostaje `allowApiTokens`, więc zachowuje swoje tokeny.

**Tylko admini** oznacza włączoną dla użytkowników z rolą `admin` i wyłączoną dla wszystkich pozostałych. Gdy użytkownik pasuje do kilku ról,
opcje łączą się następująco:

- **Między rolami użytkownika** opcja jest włączona tylko wtedy, gdy zgadza się każda rola, która ją ustawia: jawne `false` wygrywa.
- **Rola `default`** uzupełnia opcje, których nie ustawia żadna inna rola użytkownika, więc może zawierać wartości domyślne dla wszystkich.
- **Opcje nigdzie nieustawione** przyjmują wartość domyślną z tabeli.

`showExtraVars`, z wielkim V, jest akceptowane jako inna pisownia `showExtravars`; gdy którakolwiek pisownia ma wartość `false`,
opcja jest wyłączona.

{: .warning }
> Traktuj `allowScheduledJobs` jak opcję na poziomie admina. Harmonogramy nie należą do użytkownika, który je utworzył: każdy użytkownik z
> tą opcją widzi i może zmieniać wszystkie harmonogramy. Harmonogram działa też z uprawnieniami admina, dla dowolnego formularza, niezależnie od
> uprawnień twórcy. Nadawaj ją tylko rolom, którym ufasz jak adminom.

{: .warning }
> `allowLogin: false` w roli `default` blokuje każdego użytkownika, którego pozostałe role nie ustawiają `allowLogin: true`, łącznie
> z adminami. Przed zapisem przywróć ją w rolach, które muszą się logować.
