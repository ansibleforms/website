---
layout: default
title: Kubernetes
parent: Aktualizacja
nav_order: 4
translated_from: 656ff7668e57ae8b6183a2654c4943f046caba6a
---

# Kubernetes
{: .no_toc }

Aktualizacja instalacji wykonanej chartem Helm
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Każda wersja chartu wdraża jedno wydanie AnsibleForms. Aktualizacja instaluje nowszą wersję chartu z Twoimi istniejącymi wartościami;
dane na wolumenach trwałych zostają zachowane. Aktualizacja, która niczego nie zmienia, nie rusza podów.

---

## Przed aktualizacją

Przygotuj aktualizację tak, aby można było wrócić, jeśli coś pójdzie nie tak:

* **Wykonaj kopię zapasową** w **Ustawienia → Kopie zapasowe**. Nowe wydanie aktualizuje schemat bazy danych przy pierwszym uruchomieniu.
* **Przeczytaj [dziennik zmian](../changelog)** dla wydań między Twoją wersją a nową.
* **Przechodzisz na nową wersję główną?** Najpierw postępuj zgodnie z [Aktualizacja do v7](../upgrade-7.html).
* **Przeczytaj [dziennik zmian](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/CHANGELOG.md) chartu**, aby poznać zmiany w wartościach.
* **Przy generowanych poświadczeniach** (`secrets.generate`) wykonaj kopię zapasową Secretu `<release>-secrets`: `ENCRYPTION_SECRET` nie da się odzyskać.
* **Przechodzisz z 7.2?** RTE w podzie serwera zmienia tryb: zobacz [Z 7.2 do 7.3](#from-72-to-73).

---

## Z 7.2 do 7.3

Chart 7.3.0 przenosi RTE działające obok aplikacji z trybu bazy danych, przestarzałego w 7.3.0 i usuniętego w 8.0.0. Aplikacja łączy się z nim pod
`127.0.0.1` i utrzymuje otwarty jeden WebSocket (`RTE_MODE=inbound`, zobacz [Tryby](../rte/modes.html)):

* Kontener RTE nie dostaje już `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `ENCRYPTION_SECRET` ani `RTE_URL`, a pliki zadania pobiera ze
  współdzielonego wolumenu (`RTE_FILES=local`)
* Config seed chartu deklaruje poświadczenie RTE z tokenem i adresem oraz runner, `rte_mode: inbound`, który się nim
  loguje. Przy seedzie chartu nie trzeba nic robić
* Przy `containers.rte.seedRunner: false` lub własnym config seed (`CONFIG_SEED_PATH`) RTE nie dodaje się już samo jako runner.
  Zadeklaruj go samodzielnie, w swoim seedzie lub w **Połączenia → Runnery**: poświadczenie RTE z `http://127.0.0.1:<port>` i tokenem
  oraz runner typu RTE z `rte_mode: inbound`, który je wskazuje. Uwagi, które Helm wypisuje po aktualizacji, pokazują, jak to zrobić

Od wersji 7.3.0 chart instaluje też samodzielnie Runner, przez `runner.enabled` (zobacz
[Runner na Kubernetes](../installation/kubernetes.html#a-runner-on-kubernetes)).

---

## 1. Znajdź nową wersję chartu

Odśwież repozytorium chartów i wyświetl dostępne wersje chartu:

```bash
helm repo update
helm search repo ansibleforms/ansibleforms --versions
```

---

## 2. Zaktualizuj wydanie

Uruchom to samo polecenie `helm upgrade` co przy instalacji, ze swoim plikiem wartości i nową wersją chartu:

```bash
helm upgrade --install ansibleforms ansibleforms/ansibleforms \
  --namespace ansibleforms \
  --values my_values.yaml \
  --version 7.0.0
```

W przypadku rejestru OCI użyj `oci://ghcr.io/ansibleforms/charts/ansibleforms` jako chartu.

---

## 3. Sprawdź aktualizację

Poczekaj na nowe pody, a potem uruchom test chartu, który sprawdza zarówno serwer webowy, jak i połączenie z bazą danych:

```bash
kubectl -n ansibleforms get pods -w
helm test ansibleforms --namespace ansibleforms --logs
```

W AnsibleForms **Pomoc → O programie** pokazuje działającą wersję, a **Ustawienia → Stan** pokazuje kondycję
bazy danych, schematu i innych systemów, od których zależy AnsibleForms.

---

## Wycofanie aktualizacji

Helm przechowuje historię wydania. Aby wrócić do poprzedniej rewizji:

```bash
helm history ansibleforms --namespace ansibleforms
helm rollback ansibleforms --namespace ansibleforms
```

Jeśli nie uruchamia się na zaktualizowanej bazie danych, przywróć kopię zapasową (zobacz [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) chartu).
