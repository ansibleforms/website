---
layout: default
title: Obrazy
parent: RTE
nav_order: 1
translated_from: 793f1c4efa7fb085bdd4b1551161e3b57b52ff12
---

# Obrazy RTE
{: .no_toc }

Trzy publikowane obrazy RTE i własne RTE z kolekcjami i bibliotekami, których używają Twoje playbooki
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Obrazy RTE

RTE jest publikowane w trzech warstwach, z których każda jest zbudowana na poprzedniej, z tymi samymi tagami co kontroler (zobacz [Tagi obrazów](../installation/#image-tags)):

| Obraz | Co zawiera | Kiedy go używać |
|---|---|---|
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Node.js i serwer AnsibleForms, git, ssh i sshpass. Bez pythona i ansible, więc sam nie uruchamia żadnego playbooka | Do zbudowania RTE z własnymi wersjami pythona i ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | Warstwa bazowa plus python 3.14, ansible-core i kilka popularnych bibliotek (`jmespath`, `netaddr`, `requests`, `paramiko`). Bez kolekcji | Do zbudowania mniejszego RTE tylko z kolekcjami i bibliotekami, których używają Twoje playbooki |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | Warstwa core plus pakiet `ansible` na tym samym ansible-core i to, co miał obraz AnsibleForms 6.5: kolekcje NetApp, AWS i community, `pandas`, `pyvmomi`, `boto3`, klient mariadb, ytt i kilka narzędzi systemowych | **Domyślny.** Uruchamiaj go bez zmian: playbooki z 6.5 znajdą to, czego używały |

Tak jak obraz kontrolera, każda warstwa działa jako użytkownik `node` (uid 1000) i playbooki też działają jako ten użytkownik.

Od wersji 7.6.0 każda warstwa jest publikowana dla `linux/amd64` i `linux/arm64` pod tym samym tagiem. Własne RTE jest budowane dla
architektury maszyny, która je buduje: dla hostów arm64 zbuduj je na takim hoście albo przez `docker buildx build --platform linux/arm64`.

---

## Zbuduj własne RTE

Buduj na `ansibleforms-rte-core` i dodaj kolekcje i biblioteki pythona, których używają Twoje playbooki. Ten przykład dla NetApp to jeden z
plików Dockerfile w [ansibleforms/rte](https://github.com/ansibleforms/rte/tree/main/examples):

```dockerfile
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
RUN ansible-galaxy collection install netapp.ontap -p /usr/share/ansible/collections \
 && pip install --no-cache-dir netapp-lib netapp-ontap
```

Środowisko pythona i folder kolekcji należą do `node`, więc te instalacje nie wymagają roota. Warstwa, która instaluje pakiety
systemowe, przełącza się na nie na `USER root`, a na końcu z powrotem na `USER node`. Aby użyć własnego pythona i ansible, buduj na
`ansibleforms-rte-base` (`Dockerfile.own-ansible` w tym samym folderze).

Trzymaj obraz na wydaniu kontrolera: `:7` podąża za `:7` kontrolera. Kolekcje i role można też montować zamiast wbudowywać, w
`/etc/ansible/collections` i `/etc/ansible/roles`. Wtedy żadna zmiana nie wymaga przebudowy, ale to, co działa, zależy od tego wolumenu;
biblioteki pythona zawsze trafiają do obrazu. Wbudowanie wszystkiego jest powtarzalne i szybko startuje, dlatego to właściwa droga dla produkcji.

---

## Zbuduj je w Projektancie

Od 7.9.0 opisujesz środowisko uruchomieniowe w Projektancie; [builder](builder.html) buduje jego obraz, wypycha go i podpisuje.

1. Nadaj repozytorium użycie **Środowiska uruchomieniowe** (Ustawienia > Repozytoria); przechowuje ono definicje.
2. W Projektancie otwórz **Środowiska uruchomieniowe** i kliknij **Nowe**: wypełnij je na karcie **Wizualny** albo napisz na karcie **YAML**.
3. **Zapisz**, potem **Push**, aby zatwierdzić je w repozytorium, i **Zbuduj**: budowanie jest zadaniem na stronie **Zadania**, z logiem na żywo.

Każde środowisko uruchomieniowe to osobny folder w repozytorium, nazwany jak ono, który zawiera tylko jego definicję:

```text
rte-netapp/
  rte.yaml
```

Dockerfile, `ansible.cfg` i pliki wymagań są zapisywane od nowa przy każdym budowaniu, z definicji i wydania aplikacji, więc nigdy
nie dezaktualizują się w repozytorium. Karta **Pliki** pokazuje je tak, jak otrzymuje je builder.

```yaml
runner_rte:
  - name: rte-netapp
    description: NetApp playbooks of the storage team
    arch: all
    python: "3.15"
    ansible_core: "2.22"
    ansible_collections:
      - name: netapp.ontap
        version: 23.1.0
    python_packages:
      - netapp-lib
    os_packages:
      - sshpass
    registry:
      credential: ghcr
      path: af/rte-netapp
      tag: app
    sbom: true
    sign:
      credential: cosign-key
```

Każdy klucz poza nazwą można pominąć; pasek narzędzi karty **YAML** ustawia każdą część w oknie dialogowym.

| Klucz | Co to jest |
|---|---|
| `name` | Nazwa środowiska uruchomieniowego, jego folderu i obrazu: małe litery, cyfry, kropki, myślniki i podkreślenia |
| `arch` | `all`, jeden obraz dla amd64 i arm64 jak opublikowane, albo tylko `amd64` lub `arm64`; `all`, gdy pominięty. Architektura inna niż hosta buildera wymaga [QEMU na tym hoście](builder.html#amd64-and-arm64) |
| `python` | Python obrazu, od 3.11 do 3.15; 3.15, gdy pominięty |
| `ansible_core` | Wydanie ansible-core (`2.22`) lub wersja (`2.22.0`) działająca na tym pythonie; najnowsze pasujące, gdy pominięty |
| `ansible_collections` | Kolekcje, każda ze swoim `name` (namespace.name) i opcjonalną `version`; najnowsza, gdy pominięta. To, czego każda kolekcja potrzebuje, jej `requirements.txt` i `bindep.txt` (lub jej `meta/execution-environment.yml`), jest instalowane razem z nią, jak robi to ansible-builder |
| `python_packages` | Pakiety pythona, jako wiersze pliku `requirements.txt` |
| `os_packages` | Pakiety Debiana 13 (trixie) |
| `registry` | `credential`: poświadczenie typu **Rejestr kontenerów** z adresem rejestru i loginem; `path`: ścieżka obrazu w nim, jego nazwa, gdy pominięta; `tag`: `app`, wydanie aplikacji (`7.9.0`), aby ponowne budowanie podążało za każdą aktualizacją, albo własny tag |
| `sbom` | `true` dołącza do obrazu wykaz składników oprogramowania (SBOM) |
| `sign` | `credential`: poświadczenie typu **Klucz podpisu**, którym builder podpisuje obraz za pomocą cosign 3; sprawdź go poleceniem `cosign verify --key <klucz publiczny>` z cosign 3 (cosign 2 nie czyta jego podpisów) |

Każde środowisko uruchomieniowe jest budowane z `ansibleforms-rte-base` wydania aplikacji, więc takie z tagiem `app`, którego obraz zbudowano
dla starszego wydania, jest oznaczone na stronie **Środowiska uruchomieniowe**, z przyciskiem **Przebuduj je**.

---

## Kontrakt

To, co kontroler i RTE muszą mieć wspólne, to ich kontrakt, liczba, którą oba raportują. RTE ze starszego wydania nadal działa z nowszym
kontrolerem, dopóki oba mówią tym samym kontraktem; gdy wydanie go zmienia, jego informacje o wydaniu mówią, że RTE trzeba zaktualizować. Każdy tryb
ma własny:

| Tryb | Kontrakt | Przy niezgodności |
|---|---|---|
| Wychodzący, przychodzący | 3, nowość w 7.3.0 | Kontroler zamyka gniazdo RTE kodem `4409` i zapisuje w dzienniku *RTE '&lt;name&gt;' speaks contract &lt;n&gt;, this app (&lt;release&gt;) contract 3: refused*. RTE w trybie wychodzącym zapisuje *the controller speaks another contract (an upgrade in progress?): dialing again in 60 seconds*. Zadanie wysłane z innym kontraktem jest odrzucane |
| Baza danych (przestarzały) | 2, od 7.0.0 | RTE odrzuca zadania kontrolera |

**Testuj połączenie** na runnerze mówi, którym kontraktem mówi RTE, a którego potrzebuje kontroler (zobacz
[Testuj połączenie](../runners/runner-page.html#test-connection)), a wiersz **Runnery** na stronie **Stan** wykonuje to samo sprawdzenie.
