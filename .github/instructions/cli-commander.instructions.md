---
description: "Use when creating a CLI tool, adding new CLI commands, or structuring commands with @commander-js/extra-typings. Covers entry point setup, command folder structure, and command registration pattern."
applyTo: "**/*.ts"
---

# CLI Tool Structure with @commander-js/extra-typings

## Projektstruktur

```
src/
  index.ts                              # Programm-Einstiegspunkt: Setup, Command-Struktur & Registrierung
  validation/
    <topic>.validation.ts               # Wiederverwendbare Validierungsfunktionen
  commands/
    <command-name>/
      <command-name>.command.ts         # Validierung + Delegation an Handler
      <command-name>.handler.ts         # Ausschließlich Business-Logik
```

## `index.ts` – Programm-Setup

`index.ts` definiert die gesamte Command-Struktur (Name, Description, Arguments, Options) und importiert die Action-Funktionen aus den Command-Dateien. Keine Business-Logik.

```typescript
import { Command } from "@commander-js/extra-typings";
import { fooAction } from "./commands/foo/foo.command";

const program = new Command()
  .name("my-cli")
  .description("Short description of the tool")
  .version("0.1.0");

program
  .command("foo")
  .description("Does foo things")
  .argument("<input>", "The input value")
  .option("--verbose", "Enable verbose output")
  .action(fooAction);

try {
  program.parse();
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
```

## Command-Datei – `commands/<name>/<name>.command.ts`

Jeder Befehl liegt in einem eigenen Ordner. Die Datei exportiert eine `<name>Action`-Funktion und ist verantwortlich für **Validierung** und **Delegation** an den Handler. Keine Business-Logik.

```typescript
import { validateDirectory } from "../../validation/path.validation.js";
import { handleFoo } from "./foo.handler.js";

export function fooAction(outputDir: string): void {
  validateDirectory(outputDir);
  handleFoo(outputDir);
}
```

## Handler – `commands/<name>/<name>.handler.ts`

Der Handler enthält **ausschließlich Business-Logik**. Er vertraut darauf, dass die Command-Datei bereits validiert hat – keine defensive Validierung hier.

```typescript
export function handleFoo(outputDir: string): void {
  // Nur Business-Logik, keine Validierung
}
```

## Validierung – `src/validation/<topic>.validation.ts`

Validierungsfunktionen werden in `src/validation/` ausgelagert, damit sie von mehreren Commands wiederverwendet werden können. Sie werfen bei ungültiger Eingabe eine `Error`-Exception.

```typescript
// src/validation/path.validation.ts
import { existsSync, statSync } from "fs";

export function validateDirectory(path: string): void {
  if (!existsSync(path)) {
    throw new Error(`Directory does not exist: "${path}"`);
  }
  if (!statSync(path).isDirectory()) {
    throw new Error(`Path is not a directory: "${path}"`);
  }
}
```

## Argumente & Options – Defaults und Validierung

### Defaults

Optionale Argumente und Options erhalten immer einen sinnvollen Defaultwert direkt in `index.ts`:

```typescript
program
  .command("foo")
  .argument("[output-dir]", "Directory to write output to", process.cwd())
  .option("--format <format>", "Output format", "json")
  .action(fooAction);
```

### Vorverarbeitung von Argumenten und Options (Preprocessing)

`index.ts` ist auch verantwortlich für die **Vorverarbeitung** von Argumenten und Options. Transformationen wie Pfadauflösung, Typkonvertierungen oder Normalisierungen gehören hierher – **nicht** in die Command-Datei und erst recht nicht in den Handler.

Commander unterstützt dafür `.argParser()` für Arguments und eine Parser-Funktion als dritten Parameter bei `.option()`:

```typescript
import { Argument, Command } from "@commander-js/extra-typings";
import { resolve } from "path";

program
  .command("foo")
  .addArgument(
    new Argument("<input-file>", "Path to the input file").argParser((val) =>
      resolve(val),
    ),
  )
  .option(
    "--output-dir <dir>",
    "Directory to write output to",
    (val) => resolve(val),
    resolve(process.cwd()),
  )
  .action(fooAction);
```

Die Action-Funktion und der Handler erhalten damit bereits **aufgelöste, normalisierte Werte** und müssen sich nicht um Rohwerte vom CLI kümmern.

**Faustregel:** Alles, was mit dem Parsen und Formen der CLI-Eingabe zu tun hat, gehört in `index.ts`. Was mit der Semantik der Eingabe zu tun hat ("Ist der Pfad ein gültiges Verzeichnis?"), gehört in die Command-Datei.

### Validierung

Eingaben werden **in der Command-Datei** (`<name>.command.ts`) validiert, bevor der Handler aufgerufen wird. Validierungsfunktionen liegen in `src/validation/` und werden wiederverwendet.

```typescript
// src/validation/path.validation.ts – wiederverwendbare Funktion
export function validateDirectory(path: string): void { ... }

// foo.command.ts – Validierung vor Handler-Aufruf (Pfad ist bereits aufgelöst)
export function fooAction(outputDir: string): void {
  validateDirectory(outputDir); // aus src/validation/
  handleFoo(outputDir);
}
```

**Der Handler validiert nie** – er vertraut auf die Command-Datei.

**Was immer validiert werden muss:**

- **Pfade**: Existiert das Verzeichnis/die Datei? Ist es tatsächlich ein Verzeichnis / eine Datei?
- **Strings**: Leer? Enthält unerlaubte Zeichen (z.B. `..`, Null-Bytes, Pfad-Traversal)?
- **Enum-artige Werte**: Ist der Wert einer der erlaubten Werte?

**Sicherheitsregeln (erste Verteidigungslinie):**

- Pfadeingaben niemals ungeprüft in Dateisystemoperationen verwenden
- Pfad-Traversal verhindern: Eingaben mit `path.resolve()` auflösen und prüfen, ob der resultierende Pfad noch im erlaubten Bereich liegt
- Keine Shell-Interpolation von Nutzereingaben
- Strings auf maximale Länge und erlaubte Zeichen prüfen, bevor sie weiterverarbeitet werden

```typescript
import { resolve } from "path";

export function handleFoo(outputDir: string, allowedBaseDir: string): void {
  const resolvedPath = resolve(outputDir);
  if (!resolvedPath.startsWith(resolve(allowedBaseDir))) {
    throw new Error(`Path traversal detected: "${outputDir}"`);
  }
  // ...
}
```

## Fehlerbehandlung

Fehler werden als Exceptions geworfen und **zentral in `index.ts`** abgefangen. Handler und Commands werfen – sie behandeln keine Fehler selbst.

```typescript
// src/validation/path.validation.ts
export function validateDirectory(path: string): void {
  if (!isValid(path)) {
    throw new Error(`Invalid path: "${path}"`);
  }
}

// foo.command.ts
export function fooAction(input: string): void {
  validateDirectory(input); // wirft bei ungültiger Eingabe
  handleFoo(input);
}

// index.ts
import { Command } from "@commander-js/extra-typings";
import { fooAction } from "./commands/foo/foo.command";

const program = new Command().name("my-cli").version("0.1.0");

program.command("foo").argument("<input>", "The input value").action(fooAction);

try {
  program.parse();
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
```

**Exit Codes:**

- `0` – Erfolg
- `1` – Fehler (einheitlich für alle Fehlertypen)

## Regeln

- `index.ts` definiert die komplette Command-Struktur (`.command()`, `.description()`, `.argument()`, `.option()`) – aber **keine** Business-Logik
- `index.ts` importiert nur die Action-Funktion aus der Command-Datei und übergibt sie an `.action()`
- `index.ts` übernimmt die **Vorverarbeitung** von Argumenten und Options (z.B. Pfadauflösung via `argParser` / Option-Parser) – die Action erhält bereits transformierte Werte
- Optionale Argumente und Options bekommen immer einen Defaultwert in `index.ts`
- Eingabevalidierung erfolgt **in der Command-Datei** (`<name>.command.ts`) vor dem Handler-Aufruf
- Wiederverwendbare Validierungsfunktionen kommen nach `src/validation/<topic>.validation.ts`
- **Der Handler ist reine Business-Logik** – er validiert keine Eingaben
- Pfadeingaben immer mit `path.resolve()` auflösen und auf Pfad-Traversal prüfen
- Action-Funktionen heißen `<name>Action` und werden aus `<name>.command.ts` exportiert
- Action- und Handler-Funktionen werfen Exceptions – sie rufen **niemals** `process.exit()` oder `console.error()` selbst auf
- Fehlermeldungen sind kurze, lesbare Texte ohne Stack-Trace (nur `err.message`)
- Jeder Befehl liegt in `src/commands/<name>/<name>.command.ts`
- Unit-Tests für Validierungsfunktionen in `src/validation/<topic>.validation.test.unit.ts`
- Unit-Tests für Handler-Logik in `<name>.handler.test.unit.ts` im selben Ordner
