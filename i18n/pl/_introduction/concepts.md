---
layout: default
title: Pojęcia
nav_order: 4
translated_from: d62ee1e491a725a384186e3909ae1f9cee654bde
---

# Pojęcia
{: .no_toc }

Terminy używane w tej dokumentacji, każdy z linkiem do swojej strony
{: .fs-6 .fw-300 }

---

## Słowniczek

Terminy używane w tej dokumentacji:

| Termin | Znaczenie |
|---|---|
| **[Formularz](forms/)** | Definicja YAML, która zbiera dane wejściowe i uruchamia playbook, szablon lub workflow |
| **[Pole formularza](formfields/)** | Jedno pole wejściowe formularza, na przykład `text`, `enum` lub `checkbox`; jego wartość staje się extravar |
| **[Kategoria](config/categories.html)** | Grupa w drzewie formularzy wyświetlanym na stronie Formularze, zdefiniowana w `config.yaml` |
| **[Rola](config/roles.html)** | Zbiór użytkowników i grup; formularz wymienia role, które mogą go widzieć i uruchamiać, `default` oznacza wszystkich |
| **[Wyrażenie](expressions/)** | JavaScript, który oblicza wartość pola, w przeglądarce (`runLocal: true`) lub na serwerze |
| **[Extravars](formfields/)** | Zmienne wysyłane do playbooka lub szablonu, budowane z wartości pól |
| **[Poświadczenie](expressions/credentials.html)** | Zapisane dane logowania, zaszyfrowane kluczem `ENCRYPTION_SECRET`: użytkownik i hasło (oraz host, port, baza danych), a od wersji 7.3.0 także adres i sekrety katalogu LDAP, dostawcy SSO, runnera lub HashiCorp Vault |
| **[Magazyn sekretów](secret-stores/)** | Połączenie z HashiCorp Vault lub CyberArk, które dostarcza użytkownika i hasło poświadczenia |
| **[Zadanie](gui/forms-and-jobs.html)** | Jedno uruchomienie formularza, z jego stanem, extravars i wynikiem, przechowywane w historii zadań |
| **[Runner](runners.html)** | Miejsce, w którym działa zadanie, dodawane w **Połączenia > Runnery**: `rte` dla playbooków, `awx` (AWX lub odmiana `aap` albo `ascender`), `semaphore`, `rundeck` lub `jenkins` dla szablonów i jobów. Formularz wybiera go przez `runner:` albo działa na domyślnym runnerze `rte` (playbooki) lub `awx` (szablony) |
| **[RTE](rte/)** | Środowisko uruchomieniowe (runtime environment): serwer AnsibleForms uruchomiony z `AF_ROLE=rte` we własnym kontenerze, obok pythona i ansible, który uruchamia playbooki runnera typu `rte` |
| **[Punkt zatwierdzenia](forms/approval.html)** | Wstrzymanie zadania do chwili, gdy użytkownik z rolą zatwierdzającą je zatwierdzi lub odrzuci |
| **[Workflow](workflows/)** | Graf playbooków, zatwierdzeń i innych workflow połączonych przy sukcesie, przy błędzie lub zawsze, w składni AWX |
| **[Formularz wieloetapowy](forms/multistep.html)** | Przestarzały od wersji 7: formularz, który uruchamia kolejno kilka playbooków lub szablonów; zastępuje go workflow |
| **[Kanał powiadomień](notification-channels.html)** | Serwer pocztowy, webhook Slacka lub Teams, czat Telegrama albo webhook, do którego trafiają powiadomienia i prośby o zatwierdzenie |
| **[Projektant](designer/)** | Edytor w przeglądarce dla formularzy, playbooków, inwentarzy i workflow, z którego korzysta jedna osoba naraz |
| **[Podformularz](forms/subform.html)** | Zestaw pól wielokrotnego użytku, który opisuje wiersze pola `list` lub obiekt pola `yaml` |
| **[config.yaml](config/)** | Plik z kategoriami, rolami i stałymi; formularze są we własnych plikach |
| **[Config seed](seed/)** | Plik YAML (`CONFIG_SEED_PATH`), który deklaruje obiekty administracyjne, na przykład runnery i poświadczenia |
| **[Folder trwały](customization/paths.html)** | Folder z plikami, które AnsibleForms musi zachować między restartami i aktualizacjami |
