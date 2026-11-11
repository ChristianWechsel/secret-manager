---
description: Allgemeine Coding-Standards, Architektur, Library-Design und Konventionen für TypeScript
applyTo: "**/*.ts"
---

# Guidelines & Coding Standards

Dies ist eine referenzierte Bibliothek, die in anderen Systemen konsumiert wird. Bei der Entwicklung sind folgende Regeln zwingend einzuhalten:

## 1. Architektur & Design-Prinzipien (SOLID)

- **S**ingle Responsibility: Jede Klasse/Funktion hat nur eine exakte Aufgabe (z.B. eine spezifische mathematische Berechnung).
- **O**pen/Closed: Code sollte offen für Erweiterungen, aber geschlossen für Modifikationen sein. Nutze Interfaces und Polymorphismus.
- **L**iskov Substitution: Abgeleitete Typen müssen anstelle ihrer Basistypen verwendbar sein.
- **I**nterface Segregation: Viele spezifische Interfaces (`ICalculateYield`, `ICalculateRisk`) statt eines großen Allzweck-Interfaces.
- **D**ependency Inversion: Module auf höherer Ebene dürfen nicht von untergeordneten abhängen. Nutze Dependency Injection für externe Daten/Dienste.

## 2. Struktur & Konventionen

- **Ordnerstruktur (Fachlich nach finanzmathematischen Konzepten)**:
  - Die Ablage der Algorithmen muss für einen Finanzmathematiker **logisch erschließbar** sein.
  - Bilde fachliche Kategorien und Algorithmus-Familien als Ordnerstrukturen ab. Beispiel: Ein MIN-Selektions-Algorithmus liegt im Ordner `src/characteristic-values/min-selection/` oder `src/extreme-values/min-selection/`.
  - `src/` - Basisordner für alle Source-Dateien und fachlichen Unterordner.
  - `src/integration/` - Alle Integrationstests, da sie auf einer höheren Ebene das Zusammenspiel prüfen.
- **Dateinamen**:
  - Nutze konsequent `kebab-case.ts` für Dateinamen (z.B. `yield-calculator.ts`).
  - Unit-Tests: Neben der Source-Datei mit Endung `.test.unit.ts` (z.B. `src/yield-calculator.test.unit.ts`).
  - Integrationstests: Abgelegt unter `src/integration/` mit Endung `.test.int.ts`.
- **Variablen & Funktionen**:
  - `camelCase` für Variablen, Funktionen und Methoden.
  - `PascalCase` für Klassen und Interfaces (Interfaces _können_, müssen aber nicht zwingend mit `I` beginnen, wähle sprechende Namen).
  - Deskriptive, klare Namen, keine unverständlichen Kürzel (z.B. `yieldCurve` statt `yc`).

## 3. Zentrale Exports (`index.ts`)

- Alle Funktionen, Klassen, Interfaces und Typen, die nach außen sichtbar sein sollen, **müssen in der Datei `src/index.ts` exportiert werden**.
- Dies stellt sicher, dass tief verschachtelte interne Strukturen verborgen bleiben können, während öffentliche APIs sauber über den Einstiegspunkt importierbar sind.

## 4. Algorithmen & Performance

- **Time Complexity First**: Die Laufzeitkomplexität hat bei der Implementierung mathematischer und quantitativer Algorithmen **immer** Vorrang.
- **Space Complexity Second**: Die Speichereffizienz ist zweitrangig. Optimiere auf Geschwindigkeit (z.B. durch Caching/Memoization oder effizientere Datenstrukturen), auch wenn dies mehr Speicher benötigt.

## 5. Fehlerbehandlung & Fail Fast

- Wende konsequent das **"Fail-Fast"**-Prinzip an.
- Überprüfe Input-Parameter **sofort am Anfang** der Funktion/Methode auf Validität (z.B. auf `undefined`, `null`, `NaN` oder invalide numerische Bereiche).
- Wirf im Fehlerfall immer **aussagekräftige Fehlermeldungen** mit `throw new Error(...)` anstatt ungültige Zustände leise zu ignorieren oder Standardwerte zurückzugeben. Die Fehlermeldung muss erklären, _was_ falsch war und (falls möglich) _warum_.

## 6. Typsicherheit & Generics

- Nutze TypeScript **Generics**, wo immer es sinnvoll ist, um Funktionen und Klassen stark typisiert, aber gleichzeitig flexibel und wiederverwendbar zu gestalten.
- **Keine Type Assertions (`as Type`)**: `as string`, `as number`, `as MyType` etc. sind Notfallmaßnahmen und dürfen nicht als Lösung für Typrobleme eingesetzt werden. Nutze stattdessen:
  - Proper Type Narrowing (`typeof`, `instanceof`, Discriminated Unions)
  - Generics mit Constraints
  - Return-Typen und Parameter-Typen explizit deklarieren
  - `satisfies`-Operator für Typprüfung ohne Assertion

## 7. Kommentare

- Kommentare sind Anti-Pattern, wenn sie offensichtlichen Code erklären. Fokusier dich darauf die Funktions-, Methoden, Klassen- und Variablennamen sprechend zu machen, um nicht mit Kommentaren unverständlichen Code zu erklären.
- Wenn du Kommentare benötigst, um den Code zu erklären refaktoriere den Code so, damit durch z.B. neue Variablen oder Funktionen die Absicht besser aus dem Code ersichtlich ist.

## 8. Namensgebung

- Der Name gibt den Inhalt wider
  - Funktionen und Methoden sind Verben oder verbale Phrasen (z.B. `calculateYield`, `getRiskFactor`).
  - Klassen und Interfaces sind Substantive oder nominale Phrasen (z.B. `YieldCalculator`, `RiskModel`).
- Keine Abkürzungen, außer allgemein anerkannt.

## 9. types & Interfaces

- Speichere types & interfaces, welche übergreifend in mehreren Modulen verwendet werden, in einem eigenen Ordner `src/types/` oder `src/interfaces/`.
