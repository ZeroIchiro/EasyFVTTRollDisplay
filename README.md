# FoundryPlugin

Modul für Foundry Virtual Tabletop zur Erfassung von Würfelergebnissen und Charakter-HP während einer laufenden Session.

Der integrierte Foundry-Webserver stellt den Ausgabeordner direkt bereit. Bei
`https://deine-foundry-domain.tld` sind die Dateien abrufbar unter:

- `https://deine-foundry-domain.tld/foundryplugin-output/<Charakter>_HP.txt`
- `https://deine-foundry-domain.tld/foundryplugin-output/<Charakter>_Wurf.txt`

Bei lokalem Betrieb mit dem Standardport lautet die URL beispielsweise:

`http://localhost:30000/foundryplugin-output/CharakterA_HP.txt`

Die URLs sind absichtlich nicht zusätzlich geschützt. Foundry behandelt Inhalte
unter `Data/` als direkt auslieferbare Webressourcen. Der Ausgabeordner sollte
daher keine vertraulichen Daten enthalten.

- `<Charakter>_HP.txt` – aktuelle und maximale HP
- `<Charakter>_Wurf.txt` – erfasste Würfe

Nicht zuordenbare Würfe werden in `<Spieler>_Wurf.txt` gespeichert.

## Struktur

- `module.json` – Modulmanifest
- `scripts/` – JavaScript-/ES-Modul-Code
- `styles/` – CSS-Dateien
- `templates/` – HTML-Templates
- `packs/` – optionale Compendium-Packs
- `lang/` – optionale Übersetzungsdateien

## Lokales Testen

Das Verzeichnis kann für die Entwicklung direkt als Modul in
`<Foundry-Datenverzeichnis>/Data/modules/` verwendet werden. Der Ordnername
muss `foundryplugin` entsprechen, ebenso das Feld `id` in `module.json`.
