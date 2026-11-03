# Easy Dice Result Display for OBS

A Foundry Virtual Tabletop module that writes the latest dice result and the current/max HP values of actors to plain-text files. The files can be consumed by OBS, scripts, dashboards, or other tools.

## Features

- Records rolls made by players and the GM.
- Associates a roll with the speaking actor when Foundry provides an actor speaker.
- Writes only the latest roll result to the actor's roll file.
- Writes current and maximum HP as `current/max`.
- Rewrites the HP file when the actor is updated.
- Creates initial HP files when the world is ready.
- Uses Foundry's built-in web server; no separate web server or reverse proxy is required.
- Provides configurable HP data paths in the Foundry module settings.

## Installation via Foundry

1. Open the Foundry setup screen.
2. Open **Add-on Modules**.
3. Click **Install Module**.
4. Paste this manifest URL into the **Manifest URL** field:

   ```text
   https://raw.githubusercontent.com/ZeroIchiro/EasyFVTTRollDisplay/refs/tags/v0.1.11/module.json
   ```

5. Click **Install**.
6. Create or open a world.
7. Open **Manage Modules**.
8. Enable **Easy Dice Result Display for OBS**.
9. Start or reload the world as a GM.

The module ID is `obsdicerolldisplay`.

## Manual installation

1. Download the module ZIP from the GitHub repository or from the `download` URL in `module.json`.
2. Extract the module into:

   ```text
   <Foundry User Data>/Data/modules/obsdicerolldisplay/
   ```

3. Make sure `module.json` is directly inside the `obsdicerolldisplay` directory.
4. Restart Foundry and enable the module in the world.

The directory name must match the manifest ID exactly:

```text
obsdicerolldisplay
```

## Output files

The GM client creates the output directory here:

```text
<Foundry User Data>/Data/obsdicerolldisplay-output/
```

The output directory is next to `modules`, not inside it:

```text
<Data>/
├── modules/
│   └── obsdicerolldisplay/
└── obsdicerolldisplay-output/
```

The following files are created:

```text
<CharacterName>_HP.txt
<CharacterName>_Wurf.txt
```

For example:

```text
Nyx_Finsterwald_HP.txt
Nyx_Finsterwald_Wurf.txt
```

### HP file

The HP file contains only the current and maximum value:

```text
24/25
```

- `24` = current HP
- `25` = maximum HP

The file is fully overwritten when the actor is updated. It is also written during world startup for actors whose configured HP values can be found.

### Roll file

The roll file contains only the latest total result:

```text
15
```

A new roll replaces the previous value. If a chat message contains multiple rolls, only the last total in that message is written.

Rolls that cannot be associated with an actor are written to:

```text
<PlayerName>_Wurf.txt
```

## Accessing files by URL

Foundry serves files stored below its `Data` directory through its built-in web server. No additional web server is required.

If the Foundry instance is available at:

```text
https://example.com
```

then the files can be accessed at:

```text
https://example.com/obsdicerolldisplay-output/Nyx_Finsterwald_HP.txt
https://example.com/obsdicerolldisplay-output/Nyx_Finsterwald_Wurf.txt
```

For a local Foundry installation using the default port:

```text
http://localhost:30000/obsdicerolldisplay-output/Nyx_Finsterwald_HP.txt
```

Use the actual hostname, domain, port, and base path of your Foundry installation.

The files are intentionally served without an additional access-control layer. Files below `Data` are web-accessible resources in Foundry. Do not store confidential information in this output directory.

## Configuring HP paths

Open the settings in the running world:

```text
Configure Settings → Module Settings → Easy Dice Result Display for OBS
```

The module settings are:

### HP Value Path

The path to the current HP value, relative to `actor.system`.

Default:

```text
attributes.hp.value
```

### HP Maximum Path

The path to the maximum HP value, relative to `actor.system`.

Default:

```text
attributes.hp.max
```

### Auto-detect HP paths

When enabled, the module also tries these common paths if the configured paths do not contain values:

```text
attributes.hp.value / attributes.hp.max
hp.value / hp.max
attributes.health.value / attributes.health.max
health.value / health.max
```

The manually configured paths are tried first.

### Example: Splittermond

For the current Splittermond Foundry system, use:

```text
HP Value Path: health.total.value
HP Maximum Path: health.max
```

These paths correspond to:

```text
actor.system.health.total.value
actor.system.health.max
```

The values shown in the Splittermond health bar are calculated values, so the actor must be prepared by the Splittermond system before the module can read them.

### Finding paths for another game system

1. Open the actor sheet.
2. Open the browser developer tools with `F12`.
3. Open the **Console** tab.
4. Select the actor in the Actors directory or assign it to a variable.
5. Inspect its system data, for example:

   ```js
   const actor = game.actors.getName("Character Name");
   console.log(actor.system);
   ```

6. Find the object containing the current and maximum HP values.
7. Enter the paths relative to `actor.system`, without the `system.` prefix.

For example, if the console shows:

```js
actor.system.health.current
actor.system.health.max
```

enter:

```text
HP Value Path: health.current
HP Maximum Path: health.max
```

After changing the settings, reload the world or update an actor to trigger a new HP file write.

## Requirements and behavior

- The module must be enabled in the world.
- The GM must have the world open for file creation and updates.
- Actors must expose both a current and a maximum HP value at the configured paths.
- Existing files are not imported or retroactively reconstructed.
- Existing files in the former `foundryplugin-output` directory are not moved automatically.

## Development structure

```text
module.json
scripts/
  foundryplugin.mjs
styles/
  foundryplugin.css
templates/
packs/
lang/
```

The repository is available at:

```text
https://github.com/ZeroIchiro/EasyFVTTRollDisplay
```
