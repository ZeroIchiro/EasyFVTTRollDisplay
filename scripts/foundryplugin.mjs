const OUTPUT_DIRECTORY = "foundryplugin-output";
const MODULE_ID = "foundryplugin";

// Files in the Foundry Data directory are served directly by Foundry's built-in
// web server. The public URL is: /foundryplugin-output/<filename>

/**
 * FoundryPlugin records player and GM rolls and character HP values.
 * Files are written through Foundry's FilePicker API by the GM client.
 */
class FoundryPluginRecorder {
  static initialize() {
    game.settings.register(MODULE_ID, "hpValuePath", {
      name: "HP-Wert-Pfad",
      hint: "Pfad relativ zu actor.system, zum Beispiel attributes.hp.value",
      scope: "world",
      config: true,
      type: String,
      default: "attributes.hp.value"
    });

    game.settings.register(MODULE_ID, "hpMaxPath", {
      name: "HP-Maximum-Pfad",
      hint: "Pfad relativ zu actor.system, zum Beispiel attributes.hp.max",
      scope: "world",
      config: true,
      type: String,
      default: "attributes.hp.max"
    });

    game.settings.register(MODULE_ID, "hpAutoDetect", {
      name: "HP-Pfade automatisch erkennen",
      hint: "Verwendet gängige HP-Strukturen, wenn die konfigurierten Pfade nicht gefunden werden.",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });

    Hooks.on("ready", async () => {
      if (!game.user?.isGM) return;
      await this.prepareOutputDirectory();
      for (const actor of game.actors.contents) {
        await this.recordActorHP(actor);
      }
    });
    Hooks.on("createChatMessage", (message) => this.recordChatMessage(message));
    Hooks.on("updateActor", (actor) => this.recordActorHP(actor));

    console.log(`[${MODULE_ID}] Recorder initialized`);
  }

  static async prepareOutputDirectory() {
    try {
      await FilePicker.createDirectory("data", OUTPUT_DIRECTORY);
    } catch (error) {
      // The directory commonly already exists; only log unexpected failures.
      if (!String(error?.message ?? error).toLowerCase().includes("exist")) {
        console.error(`[${MODULE_ID}] Could not prepare output directory`, error);
      }
    }
  }

  static async recordChatMessage(message) {
    if (!game.user?.isGM || !message.isRoll) return;

    const speaker = message.speaker ?? {};
    const actor = speaker.actor ? game.actors.get(speaker.actor) : null;
    const user = message.user ?? game.users.get(message.user?.id);
    const rollResults = this.formatRollResults(message);
    if (!rollResults) return;

    const targetName = actor?.name ?? user?.name ?? "unbekannt";
    const fileName = `${this.safeFileName(targetName)}_Wurf.txt`;

    try {
      await this.writeFile(fileName, `${rollResults}\n`);
    } catch (error) {
      console.error(`[${MODULE_ID}] Could not record roll`, error);
    }
  }

  static async recordActorHP(actor) {
    if (!game.user?.isGM || !actor) return;

    const hp = this.getHP(actor);
    if (!hp) return;

    const content = [
      `Charakter: ${actor.name}`,
      `Aktuelle HP: ${hp.value}`,
      `Maximale HP: ${hp.max}`,
      `Aktualisiert: ${new Date().toISOString()}`,
      ""
    ].join("\n");

    try {
      await this.writeFile(`${this.safeFileName(actor.name)}_HP.txt`, content);
    } catch (error) {
      console.error(`[${MODULE_ID}] Could not record HP`, error);
    }
  }

  static getHP(actor) {
    const configuredValuePath = game.settings.get(MODULE_ID, "hpValuePath");
    const configuredMaxPath = game.settings.get(MODULE_ID, "hpMaxPath");
    const candidates = [[configuredValuePath, configuredMaxPath]];

    if (game.settings.get(MODULE_ID, "hpAutoDetect")) {
      candidates.push(
        ["attributes.hp.value", "attributes.hp.max"],
        ["hp.value", "hp.max"],
        ["attributes.health.value", "attributes.health.max"],
        ["health.value", "health.max"]
      );
    }

    for (const [valuePath, maxPath] of candidates) {
      const value = foundry.utils.getProperty(actor.system, valuePath);
      const max = foundry.utils.getProperty(actor.system, maxPath);
      if (value !== undefined && value !== null && max !== undefined && max !== null) {
        return { value, max };
      }
    }

    return null;
  }

  static formatRollResults(message) {
    const rolls = message.rolls ?? (message.roll ? [message.roll] : []);
    const totals = rolls
      .map((roll) => roll.total)
      .filter((total) => total !== undefined && total !== null);
    return totals.length ? String(totals[totals.length - 1]) : "";
  }

  static safeFileName(value) {
    return String(value)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "_")
      .replace(/^\.+|\.+$/g, "")
      .slice(0, 100) || "unbekannt";
  }

  static async appendToFile(fileName, addition) {
    let existing = "";
    try {
      existing = await this.readFile(fileName);
    } catch {
      // A missing file is expected on the first entry.
    }
    await this.writeFile(fileName, `${existing}${addition}`);
  }

  static async readFile(fileName) {
    const listing = await FilePicker.browse("data", OUTPUT_DIRECTORY);
    const fileUrl = listing.files.find((url) => url.endsWith(`/${fileName}`));
    if (!fileUrl) throw new Error("File does not exist yet");

    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`File not available (${response.status})`);
    return response.text();
  }

  static async writeFile(fileName, content) {
    const file = new File([content], fileName, { type: "text/plain;charset=utf-8" });
    await FilePicker.upload("data", OUTPUT_DIRECTORY, file, {}, { notify: false });
  }
}

Hooks.once("init", () => {
  console.log(`[${MODULE_ID}] Initialisierung`);
  FoundryPluginRecorder.initialize();
});
