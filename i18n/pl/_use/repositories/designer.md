---
layout: default
title: Projektant i push
parent: Repozytoria git
nav_order: 4
translated_from: 9f1f2463b8bc0fb3c8b5b934435c305fef1f7f20
---

# Projektant i push
{: .no_toc }

Edycja formularzy w projektancie i wypychanie ich do repozytorium
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Edycja i push z projektanta

Przy repozytorium używanym do formularzy projektant edytuje pliki w jego kopii roboczej i wypycha je z powrotem do repozytorium zdalnego.

| Przycisk | Co robi |
|---|---|
| **Zapisz (lokalnie)** | Zapisuje formularze i `config.yaml` w kopiach roboczych, bez commitowania |
| **Zapisz (repozytorium)** | Commituje i wypycha zapisane zmiany; aktywny, gdy są niewypchnięte zmiany |
| **Wczytaj (repozytorium)** | Wykonuje pull repozytoriów formularzy i przeładowuje projektant, po potwierdzeniu, jeśli są niezapisane zmiany |

Formularze pozostają w swoim repozytorium; nowe czekają, już gotowe do użycia, w [`FORMS_STAGING_PATH`](../customization/paths.html#env_FORMS_STAGING_PATH), aż wykonasz push.
Formularz zapisany w podfolderze zachowuje swoją ścieżkę względną: `team/deploy.yaml` jest wypychany do `team/deploy.yaml` w folderze formularzy
repozytorium. Nowy formularz, którego ścieżka już tam istnieje, nie jest nadpisywany; pozostaje w folderze przejściowym, więc zmień jego nazwę.
Przy kilku repozytoriach formularzy **Zapisz (repozytorium)** i **Wczytaj (repozytorium)** pytają, którego użyć, domyślnie tego z `config.yaml`.

Push dodaje wszystkie zmiany do stage, commituje je jako `AnsibleForms` z komunikatem `Forms sync by <user>`, a następnie wykonuje fetch, rebase na
repozytorium zdalnym i push, ponawiając do pięciu razy. Konflikt rebase jest przerywany, a pliki z konfliktem są wymieniane;
napraw je w repozytorium zdalnym lub użyj **Resetuj** na stronie Repozytoria. **Push** na stronie Repozytoria robi to samo.

Gdy jedyne repozytorium formularzy zostanie sklonowane jako puste, AnsibleForms kopiuje lokalny `config.yaml` i formularze do jego kopii
roboczej, więc push (**Zapisz (repozytorium)** lub **Push** na stronie Repozytoria) je publikuje. Więcej o projektancie w [Projektant i git](../gui/designer-and-git.html).
