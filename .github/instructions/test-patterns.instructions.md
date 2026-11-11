---
description: "Use when writing, refactoring or reviewing tests. Covers test file naming, test data externalization and test structure."
applyTo: "**/*.test.unit.ts, **/*.test.int.ts"
---

# Test Patterns

## Dateinamen & Ablage

- Unit-Tests: neben der Quelldatei, Endung `.test.unit.ts`
- Integrationstests: unter `src/integration/`, Endung `.test.int.ts`
- Testdaten-Klasse: neben der Quelldatei, Endung `.testdata.ts`

## Testdaten auslagern

Umfangreiche Testdaten **müssen** in eine eigene `*.testdata.ts`-Datei ausgelagert werden, damit die Testdatei lesbar bleibt. Die Testdatei enthält nur die Test-Logik, nicht die konkreten Werte.

**Verboten – Testdaten inline:**

```typescript
it.each([
  { name: 'case A', values: [1, 2, 3], expected: 2 },
  { name: 'case B', values: [-1, 0, 1], expected: 0 },
])('$name', ...)
```

**Korrekt – Testdaten ausgelagert:**

```typescript
// average.testdata.ts
export type AverageTestData = { name: string; values: number[]; expected: number };
export class AverageTestData { ... }

// average.test.unit.ts
import { AverageTestData } from './average.testdata';
const testData = new AverageTestData();
it.each([ testData.positive_values(), testData.negative_values() ])('$name', ...)
```

## Kein zirkulärer Import zwischen Test und Testdaten

Der geteilte Typ (`TestDataType`) gehört in die `*.testdata.ts`-Datei. Die Testdatei importiert den Typ von dort – **nicht umgekehrt**.

**Verboten:**

```typescript
// foo.testdata.ts
import { FooTestData } from "./foo.test.unit"; // zirkulär!
```

**Korrekt:**

```typescript
// foo.testdata.ts
export type FooTestData = { name: string; ... };

// foo.test.unit.ts
import { FooTestData, FooTestdataClass } from './foo.testdata';
```

## Struktur einer Testdatei

```typescript
export type MyFunctionTestdata = {
  name: string;
  inputs: ...; // Eingaben der Funktion
  expected: ...; // Erwarteter Rückgabewert
};

export class MyFunctionTestdataFactory {
  case_name(): MyFunctionTestdata {
    return { name: 'case_name', inputs: ..., expected: ... };
  }
}
```

## Struktur einer Unit-Test-Datei

```typescript
describe('functionName', () => {
  describe('fail-fast validation', () => {
    // Fail-Fast-Tests zuerst
  });

  describe('calculations', () => {
    const testData = new MyFunctionTestdataFactory();
    it.each([ testData.case_a(), testData.case_b() ])('$name', ({ inputs, expected }) => { ... });
  });
});
```
