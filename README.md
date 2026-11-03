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

Die HP-Pfade können in Foundry unter `Configure Settings → Module Settings`
angepasst werden:

- `HP-Wert-Pfad`: relativ zu `actor.system`, Standard `attributes.hp.value`
- `HP-Maximum-Pfad`: relativ zu `actor.system`, Standard `attributes.hp.max`
- `HP-Pfade automatisch erkennen`: versucht zusätzlich gängige Strukturen

Beispiel für ein System mit `actor.system.health.current` und
`actor.system.health.max`:

- HP-Wert-Pfad: `health.current`
- HP-Maximum-Pfad: `health.max`

Dateien:

- `<Charakter>_HP.txt` – aktueller und maximaler Wert als `Aktuell/Maximum`, zum Beispiel `24/25`
- `<Charakter>_Wurf.txt` – ausschließlich das jeweils letzte Würfelergebnis

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
