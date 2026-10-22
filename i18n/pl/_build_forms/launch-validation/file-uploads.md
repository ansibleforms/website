---
layout: default
title: Przesyłanie plików
parent: Weryfikacja uruchomienia
nav_order: 4
translated_from: 5756d90b62ddac51996f0bdb05befd6bf5589e0d
---

# Przesyłanie plików
{: .no_toc }

Jak weryfikowane są pola plików
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pole pliku nigdy nie ufa temu, co żądanie uruchomienia mówi o pliku. Weryfikacja uruchomienia sprawdza sam plik, na
dysku serwera.

---

## Jak przesłany plik trafia do zadania

Plik jest przesyłany przed uruchomieniem formularza, w dwóch krokach:

1. Przeglądarka przesyła plik przez `POST /api/v2/job/upload`. Serwer zapisuje go w `UPLOAD_PATH`.
2. Żądanie uruchomienia opisuje ten przesłany plik w swojej części `files`.

Weryfikacja uruchomienia porównuje następnie opis z dyskiem:

* Plik musi istnieć wewnątrz `UPLOAD_PATH`.
* Jego ścieżka i rozmiar są odczytywane z dysku, nigdy z żądania.

---

## Co jest akceptowane

Pole pliku otrzymuje wartość tylko ze zweryfikowanego przesłania. Wszystko inne jest odrzucane:

* Ścieżka, którą wywołujący wpisze do `rawFormData` lub `extravars`, jest ignorowana.
* Wymagane pole pliku bez faktycznego przesłania jest zgłaszane jako `missing`.

---

## Reguły plików

Reguły pola pliku są sprawdzane względem faktycznie przesłanego pliku, z rozmiarami w bajtach:

```yaml
- name: firmware
  type: file
  required: true
  maxSize: 104857600        # 100 MB
  regex:
    expression: '\.bin$'
    description: Upload a .bin firmware image
```

`minSize` i `maxSize` porównują rzeczywisty rozmiar pliku, a `regex` jego nazwę. Niezależnie od formularza
`UPLOAD_MAX_GB` ogranicza rozmiar pojedynczego przesłania (domyślnie 10 GB).
