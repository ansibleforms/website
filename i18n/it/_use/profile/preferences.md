---
layout: default
title: Preferenze
parent: Il tuo profilo
nav_order: 2
translated_from: d67f4050fea45cbd0cccd16c37cdc03838042925
---

# Preferenze
{: .no_toc }

Lingua, tema, fuso orario, formato data e notifiche desktop
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Le preferenze

La vista Preferenze cambia l'aspetto di AnsibleForms per te. Ogni scelta viene salvata nel browser
in cui la fai, quindi un altro browser o computer parte dai valori predefiniti.

| Impostazione | Scelte | Si imposta anche da |
|---|---|---|
| Lingua | Català, Deutsch, English, Español, Français, Italiano, Nederlands, Polski, Português, 日本語 (giapponese), 简体中文 (cinese semplificato) | la bandiera nell'intestazione |
| Tema | Segui il browser, Chiaro, Scuro, o Colore (un'intestazione nel colore che scegli) | l'icona del sole nell'intestazione |
| Vista dei form | Riquadri o Lista | il pulsante nella pagina Moduli |
| Fuso orario | UTC, il fuso di questo browser, o qualsiasi fuso per nome | solo qui |
| Formato data | `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY` o `DD.MM.YYYY` | solo qui |
| Notifiche desktop | Attive o disattive | solo qui |

Dalla 7.3.0 la vista è suddivisa in schede, ognuna con il proprio indirizzo (`/profile/preferences/<tab>`): **Aspetto** (lingua, tema e vista
dei form), **Data e ora** (fuso orario e formato data) e **Notifiche**. La casella di ricerca sopra di esse elenca le impostazioni che corrispondono
sotto il nome della loro scheda. Una scelta resta una bozza finché non premi **Salva**, e uscire dalla vista con una modifica non salvata chiede prima conferma.

**Segui il browser** passa a chiaro o scuro come fa il browser, e cambia insieme a esso. È il tema predefinito dalla 7.3.0, a meno che il tuo
amministratore non ne scelga un altro. Passando il mouse su un colore del tema **Colore**, qui o nel menu del tema dell'intestazione, si vede un'anteprima dell'app in quel
colore, e il tema precedente torna quando il puntatore lascia la tavolozza; non cambia nulla finché non fai clic.

---

## Notifiche desktop

Dalla 7.3.0 la scheda **Notifiche** attiva le notifiche desktop in questo browser, per gli utenti il cui ruolo imposta `showJobs`.

Il browser chiede il permesso la prima volta. Quando blocca le notifiche per il sito, l'interruttore resta disattivato e spiega come
consentirle, e un sito in semplice `http` non può mostrarle affatto. Una volta attive, arriva una notifica:

| Quando | Cosa dice | Un clic su di essa |
|---|---|---|
| Un job che hai avviato termina | Il modulo e il suo esito, come *Patch Linux servers: Riuscito*, con il numero del job e la durata | Porta in primo piano la scheda su quel job |
| Un job attende la tua approvazione | Il modulo, il numero del job e chi l'ha avviato, con i pulsanti **Approva** e **Rifiuta** | Apre i job in attesa di approvazione |

I pulsanti **Approva** e **Rifiuta** compaiono in Chrome ed Edge; Firefox e Safari mostrano la notifica senza di essi, e lo stesso fa un
sito con un certificato autofirmato, perché i pulsanti richiedono un service worker. Le notifiche arrivano solo mentre è aperta una scheda di AnsibleForms,
anche in background: non viene inviato nulla una volta chiuse tutte le schede. Ognuna compare una sola volta, per quante schede siano aperte, e i passi di un
job multistep e il job che stai guardando non generano notifiche.

---

## Fuso orario

Date e orari in tutto AnsibleForms vengono mostrati nel fuso orario che selezioni. Questo comprende le ore di inizio
e fine dei job, il registro di audit, la pagina di stato, i backup, i job salvati, e la scadenza di un token
API. Cambiare il fuso orario aggiorna subito ogni pagina, senza ricaricare.

Finché non ne scegli uno, vale il fuso orario impostato dal tuo amministratore per tutti (**Impostazioni > Aspetto > Valori predefiniti**, vedi
[Aspetto](../appearance.html)), **UTC** se non è stato cambiato. **Questo browser** segue il fuso orario del tuo computer, e
l'elenco contiene ogni fuso per nome, come `Europe/Madrid`. La scheda mostra l'ora corrente nel fuso e nel formato selezionati.

---

## Formato data

Il formato data stabilisce come si legge la parte data di ogni data, con ogni scelta mostrata con la data di oggi: `YYYY-MM-DD`
(2026-10-12), `DD/MM/YYYY`, `MM/DD/YYYY` o `DD.MM.YYYY`. Finché non ne scegli uno, vale il formato data predefinito del tuo amministratore,
`YYYY-MM-DD` se non è stato cambiato. Come le altre scelte, viene conservato in questo browser.

---

## Cosa mantiene gli orari del server

Due eccezioni mantengono gli orari propri del server:

- **Il log del server e l'output dei job** sono testo che contiene gli orari che il server vi ha scritto.
- **Gli orari che inserisci**, come quando deve girare un job programmato, e le pianificazioni cron, funzionano come
  prima.
