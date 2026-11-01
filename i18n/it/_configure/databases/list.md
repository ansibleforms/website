---
layout: default
title: La pagina dei database
parent: Database
nav_order: 1
translated_from: 66ffec0a34395642b0208e81078dbc725bdc7123
---

# La pagina dei database
{: .no_toc }

La lista dei database, le sue colonne, e come aggiungerne uno
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La lista

La pagina in **Connessioni > Database** elenca ogni database con queste colonne:

| Colonna | Significato |
|---|---|
| Nome | Come lo indicano i moduli, con `dbConfig: <name>` |
| Descrizione | A cosa serve |
| Tipo database | Quello della sua credenziale: MySQL, MSSQL, PostgreSQL, Oracle o MongoDB |
| Database | Il database che apre la sua credenziale |

**Colonne** ne aggiunge altre due, disattivate per impostazione predefinita: **Host**, dove si connette la sua credenziale, con la porta quando
ne ha una, e **Usato da**, quanti moduli lo interrogano, con il suo nome o con quello della sua credenziale (vedi [Usato da](database-page.html#used-by)).

Il tipo di database, il database e l'host vengono letti dalla credenziale: modificali sulla credenziale, in
**Connessioni > Credenziali**. Nessuna colonna mostra un utente o una password.

---

## Aggiungere un database

**Aggiungi database** apre una finestra di dialogo in due passaggi, come quella di un runner.

| Passaggio | Campi |
|---|---|
| Database | **Nome** e **Descrizione**. Il nome è obbligatorio, e unico |
| Credenziali | **Credenziale**, obbligatoria: una credenziale di tipo **Database**. Vengono proposte solo queste |

Nel passaggio **Credenziali**, **Aggiungi credenziale** apre la finestra di dialogo di una nuova credenziale di tipo **Database** (vedi
[La pagina delle credenziali](../credentials/list.html)) e la sceglie una volta salvata, così un database e il suo accesso si possono aggiungere in una volta.

---

## Il menu della riga

Una riga apre la pagina del database, e il suo menu offre:

| Azione | Cosa fa |
|---|---|
| Modifica | Apre la sua pagina |
| Testa connessione | Si connette con la sua credenziale ed esegue la query minima del suo tipo di database, e dice se ha funzionato |
| Elimina | Elimina il database, dopo una conferma. La sua credenziale resta |

Eliminare un database che dei moduli indicano ancora fa fallire le loro query, a meno che non resti una credenziale con lo stesso nome a cui
ricorrere (vedi [I database nei moduli](in-forms.html)). Controlla prima la sua scheda **Usato da**.
