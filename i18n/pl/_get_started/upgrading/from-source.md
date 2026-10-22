---
layout: default
title: Ze źródeł
parent: Aktualizacja
nav_order: 3
translated_from: f01384ded41bf8e1913196bb78e7ea1a6532989c
---

# Ze źródeł
{: .no_toc }

Aktualizacja instalacji zbudowanej ze źródeł
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Instalację zbudowaną ze źródeł aktualizuje się, przełączając się na nowe wydanie, budując je ponownie i uruchamiając ponownie
aplikację. Twoje ustawienia, formularze, playbooki, certyfikaty i dzienniki są przechowywane w `server/persistent`, którego Git ani
budowanie nie modyfikują.

---

## Przed aktualizacją

Przygotuj aktualizację tak, aby można było wrócić, jeśli coś pójdzie nie tak:

* **Wykonaj kopię zapasową** w **Ustawienia → Kopie zapasowe**. Nowe wydanie aktualizuje schemat bazy danych przy pierwszym uruchomieniu.
* **Przeczytaj [dziennik zmian](../changelog)** dla wydań między Twoją wersją a nową.
* **Przechodzisz na nową wersję główną?** Najpierw postępuj zgodnie z [Aktualizacja do v7](../upgrade-7.html).
* **Sprawdź wersję Node.js** wymaganą przez nowe wydanie, w dzienniku zmian.

---

## 1. Pobierz nowe wydanie

Pobierz tagi wydań i przełącz się na wybrane wydanie. Tagi wydań zawierają numer wersji, a `git tag` je
wyświetla; gałąź `main` może zawierać zmiany, które nie zostały jeszcze wydane:

```bash
cd /srv/apps/ansibleforms
git fetch --tags
git checkout <version>
```

---

## 2. Zbuduj ponownie

Zbuduj ponownie w tych samych trzech krokach co przy instalacji. Najpierw zbuduj ponownie klienta:

```bash
cd client
npm ci
npm run build
```

Następnie zaktualizuj zależności serwera:

```bash
cd ../server
npm ci --omit=dev
```

Na koniec ponownie skopiuj przebudowanego klienta do folderu `views` serwera:

```bash
rm -rf views
mkdir views
cp -r ../client/dist/. views/
```

Porównaj `.env.example`, w katalogu głównym repozytorium, ze swoim `persistent/.env`, aby uwzględnić ustawienia dodane w wydaniu.

---

## 3. Uruchom ponownie

Uruchom ponownie aplikację i jej RTE, aby wczytać nowy kod. Schemat bazy danych jest aktualizowany przy pierwszym uruchomieniu:

```bash
pm2 restart ansibleforms ansibleforms-rte
```

Przy przejściu z 7.2 RTE działało w trybie bazy danych, z ustawieniami bazy danych i `RTE_URL`, przestarzałym w 7.3.0 i usuniętym w 8.0.0.
Uruchom je ponownie w trybie inbound i zadeklaruj jego runner z poświadczeniem RTE w seedzie lub w **Połączenia → Runnery**, tak jak
pokazuje [instalacja](../installation/from-source.html#run): `pm2 delete ansibleforms-rte`, a potem jego polecenie `pm2 start`.

Jeśli uruchamiasz aplikację bez PM2, zatrzymaj `npm run start` i uruchom go ponownie.

---

## 4. Sprawdź aktualizację

Śledź dziennik aplikacji podczas uruchamiania:

```bash
pm2 logs ansibleforms
```

W AnsibleForms **Pomoc → O programie** pokazuje działającą wersję, a **Ustawienia → Stan** pokazuje kondycję
bazy danych, schematu i innych systemów, od których zależy AnsibleForms.

---

## Wycofanie aktualizacji

Aby wrócić do wydania, którego używałeś wcześniej, czyli wersji, którą **Pomoc → O programie** pokazywało przed aktualizacją, przełącz się na jej tag poleceniem
`git checkout <version>`, a potem zbuduj ponownie i uruchom ponownie jak w krokach 2 i 3. Jeśli to wydanie nie uruchamia się na zaktualizowanej bazie danych, przywróć kopię zapasową wykonaną w
**Ustawienia → Kopie zapasowe**.
