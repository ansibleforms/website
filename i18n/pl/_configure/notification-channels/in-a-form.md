---
layout: default
title: Kanały w formularzu
parent: Kanały powiadomień
nav_order: 5
translated_from: ab807b79469429faf3c3838f268af1ba6c29805a
---

# Kanały w formularzu
{: .no_toc }

Wskazywanie kanałów w powiadomieniach i zatwierdzeniach
{: .fs-6 .fw-300 }

Formularze wskazują kanały po nazwie, w `notifications` dla statusu i zdarzeń zadania oraz w `approval`:

```yaml
notifications:
  recipients:
    - ops@example.com
  channels:
    - ops-slack
    - ops-teams
  onStatus:
    - failed

approval:
  title: Remove host $(vm.name) ?
  roles:
    - approvers
  channels:
    - approvers-teams
```

- Kanały czatu i webhooka dostają krótką wiadomość (formularz, zadanie, co się stało) z linkiem do zadania; przy
  zatwierdzeniu to na stronie zadania się je zatwierdza lub odrzuca.
- Kanał **pocztowy** na liście wysyła zwykłą wiadomość do `recipients` (adresów `notifications` zatwierdzenia) przez
  ten serwer zamiast domyślnego.
- Nazwa, która nie istnieje, albo wyłączony kanał czatu lub webhooka jest pomijany, z informacją w dzienniku.
- Wyłączony kanał **pocztowy** nie jest pomijany: wiadomość idzie zamiast niego przez domyślny kanał pocztowy, a
  dziennik to odnotowuje.
