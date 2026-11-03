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
      await this.appendToFile(fileName, `${rollResults}\n`);
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
    const hp = foundry.utils.getProperty(actor.system, "attributes.hp")
      ?? foundry.utils.getProperty(actor.system, "hp");
    if (!hp || hp.value === undefined || hp.max === undefined) return null;
    return { value: hp.value, max: hp.max };
  }

  static formatRollResults(message) {
    const rolls = message.rolls ?? (message.roll ? [message.roll] : []);
    return rolls
      .map((roll) => roll.total)
      .filter((total) => total !== undefined && total !== null)
      .join("\n");
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
