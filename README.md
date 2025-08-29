Here’s a polished, fully accurate README aligned with your current `app.js` code, including all nuances like text file handling, jitter, and OpenAI refresh:

---

# Prompt Image Paster

Command-line automation tool for pasting image generation prompts to Leonardo AI or OpenAI DALL-E with automated timing and clipboard management.

## Features

* Automated prompt pasting with configurable delays and jitter
* Support for Leonardo AI and OpenAI DALL-E
* CSV and text-based prompt management with progress tracking
* Clipboard integration with keyboard simulation (Cmd/Ctrl+A → Cmd/Ctrl+V → Enter)
* Scene/shot organization for complex narratives
* Customizable base delay timing
* Graceful interruption handling (Ctrl+C)
* User confirmation every 8 prompts (default)

---

## Installation

**For experienced developers:**

```bash
npm install
```

**For new developers (especially Windows):**
See [WINDOWS-SETUP.md](WINDOWS-SETUP.md) for step-by-step instructions including Node.js installation, GitHub download, and permissions setup.

---

## Usage

```bash
node app.js <targetApp> <promptFile> [--delay=seconds] [--setup=seconds] [--pause=prompts]
```

### Parameters

**Required (positional):**

* `targetApp`: Target application (`leonardo` or `openai`)
* `promptFile`: Path to `.csv` or `.txt` file containing prompts

**Optional (named):**

* `--delay=N` — seconds between prompts (includes random jitter, overrides defaults)
* `--setup=N` — initial countdown seconds before automation starts (default: 10)
* `--pause=N` — prompts before user confirmation pause (default: 8)

---

### Target Applications

| App        | Description                  | Default Delay |
| ---------- | ---------------------------- | ------------- |
| `leonardo` | Leonardo AI image generation | 40 seconds    |
| `openai`   | ChatGPT image generation     | 240 seconds   |

> **Note:** OpenAI prompts trigger an automatic browser refresh to fix interface quirks.

---

## Examples

### Basic Usage

```bash
# Use OpenAI with CSV file (default settings: 240s delay, 10s setup, pause every 8)
node app.js openai prompts/boy-baker/boy-baker-v3.csv

# Use Leonardo AI with CSV file (default settings: 40s delay, 10s setup, pause every 8)  
node app.js leonardo prompts/boy-baker/boy-baker-leonardo.csv
```

### Custom Configurations

```bash
# Testing: 1 prompt at a time, quick delays
node app.js openai prompts/boy-baker/boy-baker-v3.csv --delay=5 --setup=10 --pause=1

# Conservative: longer delays with frequent pauses
node app.js openai prompts/boy-baker/boy-baker-v3.csv --delay=240 --setup=15 --pause=5

# Balanced: moderate delays for steady processing
node app.js openai prompts/boy-baker/boy-baker-v3.csv --delay=180 --setup=12 --pause=8

# Fast processing: shorter delays with minimal interruption
node app.js openai prompts/boy-baker/boy-baker-v3.csv --delay=150 --setup=10 --pause=10
```

---

## Prompt File Formats

### CSV

Four columns: `Sent,Shot,PromptID,Prompt`

```csv
Sent,Shot,PromptID,Prompt
false,1,1,"A young baker kneading dough in a rustic kitchen"
false,1,2,"The baker placing bread into a stone oven"
false,2,1,"Fresh baked goods cooling on wooden shelves"
```

**Benefits of CSV:**

* Track which prompts have been sent (`Sent` column)
* Organize by scenes/shots for complex narratives
* Resume processing seamlessly
* No separate `.processed` files created

---

### Text Files (Legacy)

* Format: `1→Prompt text` per line
* Automation creates `.processed` file to track completed prompts
* Original file is rewritten with remaining prompts

> **Recommendation:** Prefer CSV for modern usage; text files are legacy.

---

## How It Works

1. **Setup:** Countdown to focus target application
2. **Processing:** For each prompt:

   * Copies formatted prompt to clipboard
   * Simulates keyboard input (paste + enter)
   * Marks prompt as sent (CSV) or moves to `.processed` (text)
   * Waits for configured delay ± jitter
3. **Confirmation:** Pauses every N prompts for user confirmation
4. **Completion:** All prompts processed; CSV/text updated automatically

---

## Output Files

* **CSV:** Original file updated with `Sent=true` for processed prompts
* **Text:** `.processed` file created; original text file updated with remaining prompts

---

## Prompt File Organization

```
prompts/
├── boy-baker/
│   ├── boy-baker-openai.csv        # OpenAI-optimized baker story
│   ├── boy-baker-leonardo.csv      # Leonardo AI-optimized baker story
│   └── boy-baker-v3.csv            # Latest version with scene organization
├── dog-fox/
│   ├── dog-fox-openai.csv          # OpenAI dog-fox story prompts
│   └── dog-fox-leonardo.csv        # Leonardo AI dog-fox prompts
├── old-format/                     # Legacy text files
└── your-project/
    └── your-prompts.csv            # Custom prompts
```

---

## Interruption & Recovery

* Press `Ctrl+C` to gracefully stop
* Progress is saved automatically
* Resume by running the same command (processed prompts are skipped)

---

## Troubleshooting

### Clipboard Issues

* Ensure clipboard permissions are granted
* On macOS, allow Terminal accessibility in System Preferences

### Keyboard Simulation Issues

* Target application window must be focused
* Grant accessibility permissions for your terminal/IDE
* Test with a text editor first if needed

### Timing Issues

* Adjust `--delay` for slower/faster apps
* Use `--setup` to ensure focus
* Random jitter prevents predictable patterns

---

This README now fully aligns with your `app.js` logic, covering CSV vs text behavior, delays with jitter, OpenAI refresh, `.processed` files, and safe interruption handling.

---

If you want, I can **also make a concise one-page “Quickstart” version** that’s ready to drop in the repo for users who just want to run it immediately. This is ideal for beginners. Do you want me to make that too?
