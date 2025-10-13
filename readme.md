# Janah & Sascha – Hochzeit (RSVP)

Mobile-freundliche RSVP-Seite mit Google-Sheet-Backend und Admin-Dashboard.

## Live-URL
https://sash3107.github.io/hochzeit/

## Dateien
- `index.html` – Formular für Gäste
- `admin.html` – Admin-Dashboard (passwortgeschützt)
- `style.css` – Design (Pastellgrün, elegant, responsiv)
- `app.js` – Logik + Google Apps Script Anbindung
- `hintergrund.jpg` – euer Foto (bitte hier ablegen)
- `README.md` – diese Anleitung

## Google Sheet
Spalten in Zeile 1:
Timestamp | Name | Teilnahme | Begleitung | Kinder | Ernährung | Kommentar
Sheet-Name standardmäßig `Tabelle1`.

## Google Apps Script (Backend)
1. In Google Sheets → **Erweiterungen → Apps Script**
2. Code aus Abschnitt „Google Script (unten)“ komplett einfügen (falls noch nicht).
3. **Bereitstellen → Als Web-App** → Zugriff: *Jeder, der den Link hat*
4. Die Web-App-URL in `app.js` unter `SCRIPT_WEB_APP_URL` eintragen (ist hier bereits gesetzt).

## Deployment auf GitHub Pages
1. Auf GitHub ein Repo `hochzeit` anlegen (unter `Sash3107`).
2. Alle Dateien hochladen (inkl. `hintergrund.jpg`).
3. **Settings → Pages** → *Deploy from branch* (main / root).
4. Warten bis die grüne Meldung erscheint; Seite dann unter:
   https://sash3107.github.io/hochzeit/

## Admin-Login
- Passwort: `!23Bisamratte!23` (wird clientseitig gehasht).
- Öffne `admin.html`, gib das Passwort ein.

## Anpassungen
- Foto austauschen: `hintergrund.jpg` ersetzen.
- Farben: in `style.css` Variablen (`--accent`, `--accent-dark`) ändern.
- Script-URL / Sheet-Link anpassen in `app.js`.

## Datenschutz
- Es werden nur die eingegebenen Formulardaten gespeichert, keine Cookies oder Tracker.
- Die Daten liegen in deinem Google Sheet.
