---
layout: default
title: Pobieranie zmian
parent: Repozytoria git
nav_order: 3
translated_from: 1246850e9b868af155c96ce8f3f5d55f0464fb6e
---

# Pobieranie zmian
{: .no_toc }

Pull zaplanowany, ręczny i przez API oraz zmiany lokalne
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Pobieranie zmian

Pull repozytorium jest wykonywany według jego harmonogramu, przy starcie, ze strony lub przez API; nie ma punktu końcowego webhooka.

| Wyzwalacz | Jak |
|---|---|
| Harmonogram | **Włącz zaplanowany pull** i **Harmonogram pull**, na przykład `0 * * * *` co godzinę |
| Start | **Pull przy starcie aplikacji** klonuje repozytorium lub wykonuje jego pull, gdy jest już sklonowane |
| Strona ustawień | **Pull** w menu wiersza lub **Pull wszystkich** nad listą |
| Projektant | **Wczytaj (repozytorium)**, które wykonuje pull repozytoriów formularzy i przeładowuje projektant; przejęcie blokady projektanta również najpierw wykonuje pull każdego repozytorium formularzy |
| API | `POST /api/v2/repository/<name>/pull` (`showSettings` lub `showConnectionsSettings`) lub `POST /api/v2/forms-repos/pull/<name>` (zobacz niżej) |

### Pull z potoku lub webhooka

AnsibleForms nie ma dedykowanego odbiornika webhooków, ale zadanie CI lub webhook serwera git może wywołać punkt końcowy pull.

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/repository/forms/pull
```

Utwórz token zgodnie z opisem w [Tokeny API](../profile/api-token.html), dla użytkownika, którego rola ma `showSettings` lub
`showConnectionsSettings`. `/api/v2/forms-repos/pull/<name>` wymaga zamiast tego `showDesigner` i `allowFormDesign`, przy włączonym
projektancie ([`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER)). `GET /api/v2/repository/<name>` zwraca
`head`, `status` i `output`, więc potok może sprawdzić, na którym commicie działa instancja po pull.

### Zmiany lokalne

Pull nigdy nie nadpisuje pracy, która nie została jeszcze wypchnięta, więc zaplanowany pull sprawdza kopię roboczą przed uruchomieniem.

Zaplanowany pull jest pomijany, gdy kopia robocza ma niezatwierdzone zmiany lub niewypchnięte commity, oraz gdy projektant
trzyma blokadę projektanta. Ręczny pull kopii roboczej ze zmianami powodującymi konflikt kończy się błędem:

```
Repository '<name>' has local changes that block the pull. Use 'Save (repository)' to push them first, or discard them.
```

Wypchnij zmiany lub odrzuć je przez **Resetuj** w menu wiersza, co usuwa kopię roboczą i klonuje ją ponownie.
