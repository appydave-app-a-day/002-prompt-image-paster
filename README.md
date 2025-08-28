# Prompt Image Paster

Command-line automation tool for pasting image generation prompts to Leonardo AI or OpenAI DALL-E with automated timing and clipboard management.

## Features

- Automated prompt pasting with configurable delays
- Support for Leonardo AI and OpenAI DALL-E
- Clipboard integration with keyboard simulation
- Progress tracking and processed prompt saving
- Customizable base delay timing
- Graceful interruption handling (Ctrl+C)
- User confirmation every 8 prompts

## Installation

```bash
npm install
```

## Usage

```bash
node app.js <targetApp> <promptFile> [baseDelaySeconds]
```

### Parameters

- `targetApp`: Target application (`leonardo` or `openai`)
- `promptFile`: Path to text file containing prompts
- `baseDelaySeconds` (optional): Override default delay between prompts

### Target Applications

| App | Description | Default Delay |
|-----|-------------|---------------|
| `leonardo` | Leonardo AI image generation | 40 seconds |
| `openai` | ChatGPT image generation | 240 seconds |

## Examples

### Basic Usage

```bash
# Use OpenAI with text file (default 240-second delay)
node app.js openai prompts/boy-baker-v1.openai.txt

# Use OpenAI with CSV file (default 240-second delay)
node app.js openai prompts/boy-baker-v3.csv

# Use Leonardo AI with default 40-second delay  
node app.js leonardo prompts/boy-baker.leonardo.txt
```

### Custom Delay Examples

```bash
# Override OpenAI delay to 60 seconds
node app.js openai prompts/boy-baker-v1.openai.txt 60

# Override Leonardo delay to 30 seconds
node app.js leonardo prompts/dog-fox-leonardo.txt 30

# Quick testing with 5-second delay
node app.js openai prompts/boy-baker-v2.openai.txt 5
```

## Prompt File Formats

### Text Format (.txt)
Numbered sequences with arrow format:
```
1→A young baker kneading dough in a rustic kitchen
2→The baker placing bread into a stone oven
3→Fresh baked goods cooling on wooden shelves
```

### CSV Format (.csv)
Four columns: Sent, Shot, PromptID, Prompt
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

## How It Works

1. **Setup**: 10-second countdown to focus target application
2. **Processing**: For each prompt:
   - Copies formatted prompt to clipboard
   - Simulates Cmd/Ctrl+A → Cmd/Ctrl+V → Enter
   - Saves processed prompt to `.processed.txt` file
   - Removes prompt from original file
   - Waits for configured delay (with random jitter)
3. **Confirmation**: Pauses every 8 prompts for user confirmation
4. **Completion**: All prompts processed and saved

## Output Files

- **Processed file**: `filename.processed.txt` - Contains all successfully processed prompts
- **Original file**: Updated to remove processed prompts

## Available Prompt Files

- `prompts/boy-baker-v1.openai.txt` - OpenAI-optimized baker story prompts
- `prompts/boy-baker-v2.openai.txt` - Alternative baker story version
- `prompts/boy-baker.leonardo.txt` - Leonardo AI-optimized baker prompts
- `prompts/dog-fox-openai.txt` - OpenAI dog-fox story prompts  
- `prompts/dog-fox-leonardo.txt` - Leonardo AI dog-fox prompts

## Interruption & Recovery

- Press `Ctrl+C` to gracefully stop
- Processed prompts are automatically saved
- Resume by running the same command (processed prompts are skipped)

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