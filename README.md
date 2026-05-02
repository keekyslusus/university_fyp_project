# Scandium - Static VPN Configuration Security Analyzer

Scandium is a desktop static-analysis tool for OpenVPN and WireGuard configuration files. It inspects VPN client profiles without connecting to a VPN server, detects security misconfigurations with a rule-based engine, assigns an explainable risk score, and produces remediation guidance.

The project is designed as a cybersecurity/software-engineering FYP artifact: it includes parsing, rule matching, evidence-based findings, weighted scoring, remediation guidance, localization, and a reproducible evaluation dataset.

## Static Analysis Pipeline

```text
File input -> VPN type detection -> Parsing -> Rule engine -> Findings -> Scoring -> Report -> Remediation Advisor
```

Scandium does not execute the VPN configuration and does not perform network scanning. It performs static analysis over the configuration text and reports risks inferred from directives, sections, missing parameters, and malformed values.

## Features

- OpenVPN `.ovpn` and WireGuard `.conf` file analysis;
- automatic VPN type detection;
- parser with line-number evidence;
- declarative rule engine;
- severity, category, confidence, and weighted penalty for each finding;
- explainable score breakdown by risk category;
- exportable `.txt` security report;
- optional Remediation Advisor for concise fix guidance;
- reproducible evaluation samples and automated tests.


## Rule Categories

Current rules cover:

- `cryptography` - weak cipher, weak auth, missing or weak TLS minimum version;
- `authentication` - missing server certificate checks and identity verification;
- `privacy` - compression risks and DNS leak scenarios;
- `routing` - full tunnel and protocol-related routing warnings;
- `dns` - missing DNS and full-tunnel-without-DNS risks;
- `hardening` - missing TLS hardening, dangerous script execution, missing keepalive;
- `credential-exposure` - cached credentials, inline keys, private key material;
- `configuration-validity` - missing sections, malformed WireGuard keys, malformed endpoints, incomplete profiles.

Each finding can include evidence such as:

```text
line 5: cipher BF-CBC
```

This makes the output closer to static code analyzers such as ESLint or SonarQube, but focused on VPN configuration security.

## Scoring Model

Each rule has:

- severity: `info`, `low`, `medium`, or `high`;
- category;
- confidence;
- weight.

The final score is calculated as:

```text
score = 100 - total weighted penalties
```

The score is clamped to `0..100` and mapped to:

- `low` risk: score `75..100`;
- `medium` risk: score `45..74`;
- `high` risk: score `0..44`.

The exported report includes a score breakdown by category.

## Remediation Advisor (Gemini)

The Remediation Advisor turns local static-analysis findings into concise fix guidance. The deterministic rule engine remains the source of truth; the advisor does not make independent security decisions.

You can enter the Gemini API key in the application or create a `.env` file:

```bash
VITE_GEMINI_API_KEY=your_key
```

The advisor receives the local static-analysis result, including severity, category, confidence, score breakdown, and evidence. It is prompted to explain only the risks supported by the provided findings.

Advisor responses are cached by SHA-256 hash of the file content and selected language, so the same configuration is not sent repeatedly for the same language.

SDK documentation: https://googleapis.github.io/js-genai/release_docs/index.html

## Evaluation Dataset

The `samples` directory contains curated secure and insecure configurations:

```text
samples/
  secure/
  insecure/
  evaluation.csv
```

`samples/evaluation.csv` defines the expected risk level and minimum expected findings for each sample. This supports reproducible evaluation and can be used in the final project report.

Run evaluation tests:

```bash
npm test
```

The current automated checks verify:

- parser evidence and line numbers;
- expected risk levels for evaluation samples;
- expected minimum finding IDs for evaluation samples.

## Run

Install dependencies:

```bash
npm install
```

Run the Electron app:

```bash
npm run dev
```

Run the web-only Vite app:

```bash
npm run dev:web
```

## Build And Verify

Typecheck:

```bash
npm run typecheck
```

Run tests:

```bash
npm test
```

Build:

```bash
npm run build
```

## Project Structure

- `src/core` - parser, rule engine, scoring, reports, advisor cache, and remediation prompts.
- `src/components` - Solid UI components.
- `src/i18n` - UI and finding dictionaries.
- `src/utils` - shared utilities.
- `electron` - Electron main/preload code.
- `samples` - demo and evaluation VPN configurations.
- `tests` - parser and evaluation tests.

## Technology Stack

- TypeScript - core application logic, static-analysis engine, typed findings, scoring, and tests.
- SolidJS - reactive frontend UI for file upload, findings, score summaries, dialogs, and localized views.
- Vite - fast development server and production web build pipeline.
- Electron/Electron Builder - cross-platform desktop shell for Windows and Linux release builds.
- Google GenAI SDK - optional Gemini-powered Remediation Advisor.
- Node.js and npm - dependency management, build scripts, test execution, and release automation.

## Limitations

- Scandium analyzes client configuration files only; it does not inspect the VPN server runtime state.
- Some findings are inferred from missing directives, so they represent potential risk rather than confirmed exploitation.
- WireGuard `PrivateKey` presence is reported as sensitive material exposure even though it is normal in client profiles.
- Remediation Advisor output is an explanation layer; deterministic local rules remain the source of truth.
