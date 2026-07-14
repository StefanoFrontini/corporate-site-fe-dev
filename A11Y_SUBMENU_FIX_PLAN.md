# Fix VoiceOver: sottovoci del menu mobile leggibili dopo la chiusura

## Contesto

L'esperto di accessibilità ha segnalato che su iPhone (Safari/VoiceOver), dopo aver espanso e poi ricompresso una voce di menu mobile con sottovoci (es. "Società"), VoiceOver a volte continua a leggere la prima sottovoce appena nascosta (es. "Chi siamo"), anche se il DOM risulta correttamente collassato.

Ho verificato il problema con Playwright/Chromium su `http://localhost:8000/it/` (viewport mobile) ispezionando `src/components/Menu/MenuNavigation/MenuNavigation.tsx`: in Chromium, `hidden`, `display:none`, `visibility:hidden` e `getBoundingClientRect()` riflettono sempre correttamente lo stato chiuso, anche subito dopo un toggle dinamico. Questo conferma che non è un problema di "nascondimento" ma di sincronizzazione dell'accessibility tree specifica di WebKit/VoiceOver — non riproducibile in questo ambiente (niente WebKit/VoiceOver reale su Linux).

`aria-haspopup` è già rimosso su mobile (uno dei workaround suggeriti dall'esperto è già implementato).

## Round 1 (già implementato e confermato su iPhone reale)

Causa tecnica plausibile individuata in `src/components/Menu/Menu.sass`: la regola `ul[hidden] { display: none !important }` (righe 12-13) applica `display:none` istantaneamente alla chiusura, ma le regole `transition: all …` sulle stesse `> ul` (mobile riga ~269, desktop riga ~161) includevano anche `visibility` tra le proprietà animate. Per la spec CSS Transitions, quando `visibility` transita verso `hidden`, lo user agent deve considerare l'elemento ancora "visibile" per tutta la durata della transizione — un segnale in conflitto diretto con il `display:none` immediato imposto da `[hidden]`. Questo doppio segnale simultaneo e contraddittorio era una causa plausibile per cui l'AX tree builder di WebKit poteva campionare uno stato stantio dopo la chiusura.

Tre modifiche già applicate (working tree, non committate):

1. **`src/components/Menu/MenuNavigation/MenuNavigation.tsx`** — aggiunto un `submenuRef` e un `useEffect` che imposta/rimuove esplicitamente `aria-hidden`/`inert` sul `<ul>` del sottomenu in sync con `submenuOpen`, rispecchiando il pattern già usato in `src/partials/Header/Header.tsx` (righe 39-61) per main/footer durante il trap del menu mobile.
2. **`src/components/Menu/Menu.sass`** — rimosso `visibility` dalla shorthand `transition: all` su entrambe le regole `> ul` (mobile e desktop), sostituita con liste esplicite (`opacity, transform` desktop; `opacity, max-height` mobile).
3. Verificato che lo stesso pattern `[hidden]` + `transition: all` esiste anche in `src/components/SharedBlocks/Accordion/Accordion.sass` e nella sua copia duplicata in `UniversityCollaboration/`, ma non toccato (nessuna segnalazione di bug su quei componenti, fuori scope).

**Risultato**: confermato funzionante su iPhone reale per l'interazione "apri esplicito col doppio tap → chiudi esplicito col doppio tap".

## Round 2 — bug ancora presente su una sequenza diversa (auto-chiusura via focusout)

**Sequenza riprodotta** (diversa da quella testata nel Round 1):

1. Apri "Società" (doppio tap sul trigger).
2. Swipe a sinistra ripetutamente fino alla X di chiusura del menu — durante questo, il sottomenu si auto-chiude (via `handleFocusOut` in `MenuNavigation.tsx`, non un toggle esplicito).
3. Swipe a destra: il cursore VoiceOver torna su "Società" (sottomenu già chiuso da un po').
4. Swipe a destra ancora: **VoiceOver legge comunque "Chi siamo"**, pur essendo il sottomenu chiuso da tempo (non è una race sullo stesso frame — il fix del Round 1 aveva già avuto tutto il tempo di applicarsi).

**Causa probabile** (validata con un secondo passaggio di design): il fix del Round 1 nasconde il sottomenu solo via attributi (`hidden`/`aria-hidden`/`inert`) su un nodo che resta sempre presente nel DOM — non ne cambia mai la posizione. È plausibile che VoiceOver, la prima volta che attraversa il sottomenu aperto, cachi l'ordine di navigazione swipe (puntatori next/prev tra i nodi), e non invalidi quel puntatore quando gli attributi cambiano su un nodo che non si è mai spostato/rimosso — a differenza di quando un nodo viene realmente rimosso dal DOM, che forza WebKit a ricostruire il sottoalbero AX da zero. Coerente con il fix più robusto e ben documentato per questa classe di bug (es. `unmountOnExit` di MUI per Accordion/Collapse, trovato in ricerche precedenti).

### Fix implementato

In `src/components/Menu/MenuNavigation/MenuNavigation.tsx`, riga ~285 (`{items?.map(item => {`), condizionare il rendering delle `<li>` del sottomenu in modo che vengano realmente smontate dal DOM quando chiuso — **scope: solo mobile**, per evitare di rimuovere i link dall'HTML statico/renderizzato per crawler mobile-first (`isMobile` parte sempre `false` in SSR/build e nella prima resa client, esattamente come già sfruttato da `aria-haspopup={!isMobile ? 'true' : undefined}` alle righe 248/273 — quindi su desktop il comportamento resta identico a oggi):

```diff
       {hasChildren && (
         <ul id={submenuId} ref={submenuRef} hidden={!submenuOpen}>
-          {items?.map(item => {
+          {(!isMobile || submenuOpen) && items?.map(item => {
             const isCurrentSubmenu = pathname
               .split('/')
               .includes(
                 (item?.uiRouterKey?.replace(/-\d+/, '') ?? '') as string
               );
             return (
               item && (
                 <li
                   key={item?.id}
                   className={classNames(
                     className,
                     item.highlight && 'alternative'
                   )}
                   aria-current={isCurrentSubmenu ? 'page' : undefined}
                 >
                   <MenuItem item={item} />
                 </li>
               )
             );
           })}
         </ul>
       )}
```

Il wrapper `<ul>` resta sempre montato (necessario perché `aria-controls={submenuId}` deve riferirsi a un elemento sempre presente, e per mantenere l'effetto `aria-hidden`/`inert` del Round 1 come difesa aggiuntiva).

Nessun impatto sui gestori da tastiera (`ArrowDown`/`ArrowUp`/`Home`/`End`/`Escape`): tutte le query su `ul li` girano solo quando `submenuOpen` è già `true` (quindi le `<li>` sono già montate), oppure subito dopo l'apertura con un buffer di 150ms, ampiamente sufficiente per il commit di React. Nessuna regressione di focus: nei percorsi `Escape`/`handleFocusOut` il focus è già spostato via (o riassegnato a `triggerRef`) prima che il nodo venga smontato — stesso comportamento di oggi, dove `hidden` già rimuove il nodo dal tab order.

### Hardening incluso

In `handleMouseLeave` (chiusura via hover su desktop, riga ~174), spostare il focus su `triggerRef` se il focus si trova attualmente dentro il sottomenu, prima di chiudere — stesso pattern già usato nei gestori `Escape`. Non risolve il bug segnalato, ma è economico da sistemare visto che tocchiamo questa funzione, e copre un rischio di focus-stranding pre-esistente (non introdotto da questo fix):

```diff
   const handleMouseLeave = () => {
     if (window.innerWidth >= MOBILE_BREAKPOINT && hasChildren) {
+      if (
+        menuRef.current &&
+        document.activeElement &&
+        menuRef.current.contains(document.activeElement) &&
+        document.activeElement !== triggerRef.current
+      ) {
+        triggerRef.current?.focus();
+      }
       setSubmenuOpen(false);
     }
   };
```

**Risultato**: confermato funzionante su iPhone reale, riproducendo esattamente la sequenza sopra (apri → swipe fino alla X, lasciando auto-chiudere → swipe indietro su "Società" → swipe avanti) — VoiceOver non legge più "Chi siamo".

## Round 3 — sottomenu "gemelli" rimangono aperti quando esci dal nav

**Bug segnalato** (diverso dai precedenti, non è il bug VoiceOver/AX-tree): apri "Società" → vai su "Prodotti e servizi" → apri anche quel sottomenu → swipe indietro fino alla X: "Società" si auto-chiude ma "Prodotti e servizi" resta aperto.

**Causa**: ogni `MenuNavigation` ha uno stato `submenuOpen` indipendente, e `handleFocusOut` (righe ~188-219) chiude il proprio sottomenu solo quando **il proprio** `<li>` perde il focus verso fuori dal `<nav>` — l'evento scatta una sola volta, quando il focus attraversa quell'item. Se l'utente ha già superato "Prodotti e servizi" tornando verso "Società" (il suo blur è già scattato e ha deciso "resto aperto", perché il focus era ancora dentro il nav), non c'è più nessun listener che osservi la successiva uscita dal nav per quell'item specifico — solo il blur di "Società" (l'ultimo item attraversato prima della X) lo rileva.

**Fix implementato**: centralizzato il rilevamento "il focus è uscito interamente dal `<nav>`" a livello di `Menu.tsx`, che alla perdita di focus dal `<nav>` dispatcha un evento custom (`MENU_CLOSE_ALL_SUBMENUS_EVENT`, nuova costante in `src/types.ts`) sull'elemento `<nav>`. Ogni `MenuNavigation` si registra con un listener (`useEffect` su `nav.addEventListener(...)`) che chiude il proprio submenu alla ricezione dell'evento. Applicato a entrambi i `<nav>` (`menu-main` e `menu-reserved`) in `Menu.tsx`. Nessuna modifica al comportamento esistente "resta aperto mentre navighi dentro il nav" — solo aggiunta la chiusura collettiva quando il focus esce completamente.

**Verificato** con Playwright (mobile): apri "Società" + "Prodotti e servizi" → sposta il focus fuori dal nav (verso l'hamburger) → entrambi risultano chiusi (`aria-expanded=false`). Verificato anche che spostarsi tra voci **dentro** il nav non chiude nulla (comportamento preesistente invariato).

**Risultato**: confermato funzionante su iPhone reale, riproducendo la sequenza sopra (due sottomenu aperti, swipe fino alla X) — entrambi si chiudono correttamente.

## Stato finale

Tutti e tre i round sono implementati nel working tree (non committati) e confermati funzionanti su iPhone reale con VoiceOver. File modificati:
- `src/components/Menu/MenuNavigation/MenuNavigation.tsx`
- `src/components/Menu/Menu.tsx`
- `src/components/Menu/Menu.sass`
- `src/types.ts`

## Verifica

1. `yarn typecheck` (via Node 18/nvm) — nessun nuovo errore in nessuno dei tre round (l'unico errore residuo, in `Intro.tsx`, è pre-esistente e non correlato).
2. Test con Playwright MCP (Chromium) per ogni round: sincronizzazione `hidden`/`aria-hidden`/`inert`, smontaggio reale delle `<li>` su mobile con DOM invariato su desktop, chiusura collettiva dei sottomenu all'uscita dal `<nav>` con il comportamento "resta aperto dentro il nav" preservato.
3. Verificato che l'HTML statico (SSR/build) continui a contenere i link del sottomenu, dato che `isMobile` è sempre `false` in fase di build — nessuna regressione SEO/crawling.
4. **Confermato su iPhone reale con VoiceOver** per tutti e tre i round, incluse le sequenze di interazione specifiche che avevano fatto emergere i bug dei Round 2 e 3.
