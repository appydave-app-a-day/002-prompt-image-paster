# Prompt Image Paster

Command-line automation tool for pasting image generation prompts to Leonardo AI or OpenAI DALL-E with automated timing and clipboard management.

## Features

- Automated prompt pasting with configurable delays
- Support for Leonardo AI and OpenAI DALL-E
- CSV-based prompt management with progress tracking
- Clipboard integration with keyboard simulation
- Scene/shot organization for complex narratives
- Customizable base delay timing
- Graceful interruption handling (Ctrl+C)
- User confirmation every 8 prompts

## Installation

**For experienced developers:**
```bash
npm install
```

**For new developers (especially Windows):**
See [WINDOWS-SETUP.md](WINDOWS-SETUP.md) for detailed step-by-step instructions including Node.js installation, GitHub download, and permissions setup.

## Usage

```bash
node app.js <targetApp> <promptFile> [--delay=seconds] [--setup=seconds] [--pause=prompts]
```

### Parameters

**Required (positional):**
- `targetApp`: Target application (`leonardo` or `openai`)
- `promptFile`: Path to CSV file containing prompts

**Optional (named):**
- `--delay=N`: Seconds between prompts (overrides defaults below)
- `--setup=N`: Initial countdown seconds (default: 10)
- `--pause=N`: Prompts before user confirmation pause (default: 8)

### Target Applications

| App | Description | Default Delay |
|-----|-------------|---------------|
| `leonardo` | Leonardo AI image generation | 40 seconds |
| `openai` | ChatGPT image generation | 240 seconds |

## Examples

### Basic Usage

```bash
# Use OpenAI with CSV file (default settings: 240s delay, 10s setup, pause every 8)
node app.js openai prompts/boy-baker/boy-baker-v3.csv

# Use Leonardo AI with CSV file (default settings: 40s delay, 10s setup, pause every 8)  
node app.js leonardo prompts/boy-baker/boy-baker-leonardo.csv
```

### Custom Configuration Examples

```bash
# Testing mode: 1 prompt at a time with quick delays
node app.js openai prompts/boy-baker/boy-baker-v3.csv --delay=5 --setup=5 --pause=1

# Conservative: longer delays with frequent pauses
node app.js openai prompts/boy-baker/boy-baker-v3.csv --delay=240 --setup=15 --pause=5

# Balanced: moderate delays for steady processing
node app.js openai prompts/boy-baker/boy-baker-v3.csv --delay=180 --setup=12 --pause=8

# Fast processing: shorter delays with less interruption
node app.js openai prompts/boy-baker/boy-baker-v3.csv --delay=150 --setup=10 --pause=10

# Long session: minimal interruptions for large batches
node app.js openai prompts/boy-baker/boy-baker-v3.csv --delay=200 --pause=20
```

## Prompt File Format

CSV files with four columns: Sent, Shot, PromptID, Prompt
```csv
Sent,Shot,PromptID,Prompt
false,1,1,"A young baker kneading dough in a rustic kitchen"
false,1,2,"The baker placing bread into a stone oven"
false,2,1,"Fresh baked goods cooling on wooden shelves"
```

**CSV Benefits:**
- Track which prompts have been sent (`Sent` column: false/true)
- Organize by scenes/shots for complex narratives
- Better data management and filtering
- Resume processing from where you left off
- No separate `.processed` files created - all tracking in the CSV

## How It Works

1. **Setup**: 10-second countdown to focus target application
2. **Processing**: For each prompt:
   - Copies formatted prompt to clipboard
   - Simulates Cmd/Ctrl+A → Cmd/Ctrl+V → Enter
   - Marks prompt as `Sent=true` in CSV file
   - Waits for configured delay (with random jitter)
3. **Confirmation**: Pauses every 8 prompts for user confirmation
4. **Completion**: All prompts processed and saved

## Output Files

- Original CSV file is updated with `Sent=true` for processed prompts
- No separate `.processed` files created
- All progress tracked in the original CSV

## Prompt File Organization

Files are organized in project folders under `prompts/`:

```
prompts/
├── boy-baker/
│   ├── boy-baker-openai.csv        # OpenAI-optimized baker story
│   ├── boy-baker-leonardo.csv      # Leonardo AI-optimized baker story
│   └── boy-baker-v3.csv            # Latest version with scene organization
├── dog-fox/
│   ├── dog-fox-openai.csv          # OpenAI dog-fox story prompts
│   └── dog-fox-leonardo.csv        # Leonardo AI dog-fox prompts
├── old-format/                     # Legacy text files (deprecated)
└── your-project/
    └── your-prompts.csv            # Your custom prompt files
```

**Project Structure Benefits:**
- Keep related prompt variations together
- Easy comparison between OpenAI vs Leonardo versions  
- Organized by story/theme
- Clean separation of different projects
- All files use CSV format for consistency

## Interruption & Recovery

- Press `Ctrl+C` to gracefully stop
- Processed prompts are automatically saved
- Resume by running the same command (prompts marked as `Sent=true` are skipped)

## Troubleshooting

### Clipboard Issues
- Ensure clipboard access permissions are granted
- On macOS, grant Terminal accessibility permissions in System Preferences

### Keyboard Simulation Issues  
- Ensure target application window is focused
- Grant accessibility permissions for Terminal/IDE
- Test with a simple text editor first

### Timing Issues
- Adjust base delay for slower/faster target applications
- Consider network latency for web-based tools
- Use jitter to avoid detection patterns