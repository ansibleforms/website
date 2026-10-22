---
layout: default
title: Obrazy
parent: RTE
nav_order: 1
translated_from: cb917c5cb9cbca9d530398171265e91f1ba8e94b
---

# Obrazy RTE
{: .no_toc }

Trzy publikowane obrazy RTE i własne RTE z kolekcjami i bibliotekami, których używają Twoje playbooki
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Obrazy RTE

RTE jest publikowane w trzech warstwach, z których każda jest zbudowana na poprzedniej, z tymi samymi tagami co aplikacja (zobacz [Tagi obrazów](../installation/#image-tags)):

| Obraz | Co zawiera | Kiedy go używać |
|---|---|---|
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Node.js i serwer AnsibleForms, git, ssh i sshpass. Bez pythona i ansible, więc sam nie uruchamia żadnego playbooka | Do zbudowania RTE z własnymi wersjami pythona i ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | Warstwa bazowa plus python 3.14, ansible-core i kilka popularnych bibliotek (`jmespath`, `netaddr`, `requests`, `paramiko`). Bez kolekcji | Do zbudowania mniejszego RTE tylko z kolekcjami i bibliotekami, których używają Twoje playbooki |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | Warstwa core plus pakiet `ansible` na tym samym ansible-core i to, co miał obraz AnsibleForms 6.5: kolekcje NetApp, AWS i community, `pandas`, `pyvmomi`, `boto3`, klient mariadb, ytt i kilka narzędzi systemowych | **Domyślny.** Uruchamiaj go bez zmian: playbooki z 6.5 znajdą to, czego używały |

Tak jak obraz aplikacji, każda warstwa działa jako użytkownik `node` (uid 1000) i playbooki też działają jako ten użytkownik.

---

## Zbuduj własne RTE

Buduj na `ansibleforms-rte-core` i dodaj kolekcje i biblioteki pythona, których używają Twoje playbooki. Ten przykład dla NetApp to jeden z
plików Dockerfile w [examples/rte](https://github.com/ansibleforms/ansibleforms/tree/main/examples/rte):

```dockerfile
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
RUN ansible-galaxy collection install netapp.ontap -p /usr/share/ansible/collections \
 && pip install --no-cache-dir netapp-lib netapp-ontap
```

Środowisko pythona i folder kolekcji należą do `node`, więc te instalacje nie wymagają roota. Warstwa, która instaluje pakiety
systemowe, przełącza się na nie na `USER root`, a na końcu z powrotem na `USER node`. Aby użyć własnego pythona i ansible, buduj na
`ansibleforms-rte-base` (`Dockerfile.own-ansible` w tym samym folderze).

Trzymaj obraz na wydaniu aplikacji: `:7` podąża za `:7` aplikacji. Kolekcje i role można też montować zamiast wbudowywać, w
`/etc/ansible/collections` i `/etc/ansible/roles`. Wtedy żadna zmiana nie wymaga przebudowy, ale to, co działa, zależy od tego wolumenu;
biblioteki pythona zawsze trafiają do obrazu. Wbudowanie wszystkiego jest powtarzalne i szybko startuje, dlatego to właściwa droga dla produkcji.

---

## Kontrakt

To, co aplikacja i RTE muszą mieć wspólne, to ich kontrakt, liczba, którą oba raportują. RTE ze starszego wydania nadal działa z nowszą
aplikacją, dopóki oba mówią tym samym kontraktem; gdy wydanie go zmienia, jego informacje o wydaniu mówią, że RTE trzeba zaktualizować. Każdy tryb
ma własny:

| Tryb | Kontrakt | Przy niezgodności |
|---|---|---|
| Wychodzący, przychodzący | 3, nowość w 7.3.0 | Aplikacja zamyka gniazdo RTE kodem `4409` i zapisuje w dzienniku *RTE '&lt;name&gt;' speaks contract &lt;n&gt;, this app (&lt;release&gt;) contract 3: refused*. RTE w trybie wychodzącym zapisuje *the app speaks another contract (an upgrade in progress?): dialing again in 60 seconds*. Zadanie wysłane z innym kontraktem jest odrzucane |
| Baza danych (przestarzały) | 2, od 7.0.0 | RTE odrzuca zadania aplikacji |

**Testuj połączenie** na runnerze mówi, którym kontraktem mówi RTE, a którego potrzebuje aplikacja (zobacz
[Testuj połączenie](../runners/runner-page.html#test-connection)), a wiersz **Runnery** na stronie **Stan** wykonuje to samo sprawdzenie.
