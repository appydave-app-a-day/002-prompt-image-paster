#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const robot = require('robotjs');
const chalk = require('chalk');

// Target app configurations
const targetConfigs = {
  leonardo: {
    name: "Leonardo AI",
    baseDelay: 40000,        // 40 seconds
    jitter: 15000,           // ±15 seconds
    promptFormat: "{prompt}", // Raw prompt
    description: "Leonardo AI image generation"
  },
  openai: {
    name: "OpenAI DALL-E", 
    baseDelay: 240000,       // 240 seconds
    jitter: 30000,           // ±30 seconds
    promptFormat: "create image: {prompt} 16:9", // Wrapped format
    description: "ChatGPT image generation"
  }
};

class PromptAutomator {
  constructor(targetApp, promptFile, customBaseDelay = null, setupDelay = 10) {
    this.targetApp = targetApp;
    this.promptFile = promptFile;
    this.config = { ...targetConfigs[targetApp] };
    this.setupDelay = setupDelay * 1000; // Convert seconds to milliseconds
    
    // Override base delay if provided
    if (customBaseDelay !== null) {
      this.config.baseDelay = customBaseDelay * 1000; // Convert seconds to milliseconds
    }
    this.processedFile = this.getProcessedFileName(promptFile);
    this.processedCount = 0;
    this.isInterrupted = false;
    
    // Handle Ctrl+C gracefully
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n\n⚠️  Process interrupted by user'));
      console.log(chalk.gray('Processed prompts have been saved to:'), chalk.cyan(this.processedFile));
      this.isInterrupted = true;
      process.exit(0);
    });
  }

  getProcessedFileName(originalFile) {
    const dir = path.dirname(originalFile);
    const name = path.basename(originalFile, path.extname(originalFile));
    const ext = path.extname(originalFile);
    return path.join(dir, `${name}.processed${ext}`);
  }

  validateInputs() {
    if (!this.config) {
      throw new Error(`Invalid target app. Must be one of: ${Object.keys(targetConfigs).join(', ')}`);
    }
    
    if (!fs.existsSync(this.promptFile)) {
      throw new Error(`Prompt file not found: ${this.promptFile}`);
    }
  }

  readPrompts() {
    const content = fs.readFileSync(this.promptFile, 'utf8');
    const ext = path.extname(this.promptFile).toLowerCase();
    
    if (ext === '.csv') {
      return this.parseCSVPrompts(content);
    } else {
      return this.parseTextPrompts(content);
    }
  }

  parseCSVPrompts(content) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length === 0) return [];
    
    // Skip header row
    const dataLines = lines.slice(1);
    const prompts = [];
    
    for (const line of dataLines) {
      // Simple CSV parsing - handles quoted fields with commas
      const fields = this.parseCSVLine(line);
      if (fields.length >= 4) {
        const [sent, shot, promptId, prompt] = fields;
        // Only include prompts that haven't been sent
        if (sent.toLowerCase() === 'false') {
          prompts.push({ originalLine: line, prompt: prompt.trim() });
        }
      }
    }
    
    return prompts.map(p => p.prompt);
  }

  parseCSVLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"' && !inQuotes) {
        inQuotes = true;
      } else if (char === '"' && inQuotes) {
        if (nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = false;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current);
    return fields;
  }

  parseTextPrompts(content) {
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Strip numbered prefixes like "1→", "2→", etc.
        return line.replace(/^\d+→\s*/, '').trim();
      })
      .filter(line => line.length > 0);
  }

  formatPrompt(prompt) {
    return this.config.promptFormat.replace('{prompt}', prompt);
  }

  async copyToClipboard(text) {
    try {
      const clipboardy = await import('clipboardy');
      await clipboardy.default.write(text);
      return true;
    } catch (error) {
      console.error(chalk.red('Failed to copy to clipboard:'), error.message);
      console.error(chalk.red('This may be due to clipboard access permissions or environment issues.'));
      throw error; // Re-throw to stop execution instead of continuing
    }
  }

  simulatePasteAndEnter() {
    try {
      // Detect platform for correct key combination
      const isMac = process.platform === 'darwin';
      const modifier = isMac ? 'command' : 'control';
      
      // Select all text first to replace instead of concatenate
      robot.keyTap('a', modifier);
      
      // Small delay before paste
      setTimeout(() => {
        // Paste
        robot.keyTap('v', modifier);
        
        // Small delay before Enter
        setTimeout(() => {
          robot.keyTap('enter');
        }, 100);
      }, 100);
      
      return true;
    } catch (error) {
      console.error(chalk.red('Failed to simulate keyboard input:'), error.message);
      return false;
    }
  }

  simulateBrowserRefresh() {
    try {
      // Detect platform for correct key combination
      const isMac = process.platform === 'darwin';
      const modifier = isMac ? 'command' : 'control';
      
      // Press Cmd+R or Ctrl+R to refresh browser
      robot.keyTap('r', modifier);
      
      return true;
    } catch (error) {
      console.error(chalk.red('Failed to simulate browser refresh:'), error.message);
      return false;
    }
  }

  async saveProcessedPrompt(prompt) {
    try {
      const formattedPrompt = this.formatPrompt(prompt);
      fs.appendFileSync(this.processedFile, formattedPrompt + '\n');
      return true;
    } catch (error) {
      console.error(chalk.red('Failed to save processed prompt:'), error.message);
      return false;
    }
  }

  removePromptFromOriginal(promptToRemove) {
    try {
      const ext = path.extname(this.promptFile).toLowerCase();
      
      if (ext === '.csv') {
        return this.markPromptAsSentInCSV(promptToRemove);
      } else {
        return this.removePromptFromTextFile(promptToRemove);
      }
    } catch (error) {
      console.error(chalk.red('Failed to update original file:'), error.message);
      return false;
    }
  }

  markPromptAsSentInCSV(promptToRemove) {
    const content = fs.readFileSync(this.promptFile, 'utf8');
    const lines = content.split('\n');
    let updated = false;
    
    for (let i = 1; i < lines.length; i++) { // Skip header
      const line = lines[i].trim();
      if (line.length === 0) continue;
      
      const fields = this.parseCSVLine(line);
      if (fields.length >= 4) {
        const [sent, shot, promptId, prompt] = fields;
        if (sent.toLowerCase() === 'false' && prompt.trim() === promptToRemove.trim()) {
          // Mark as sent
          fields[0] = 'true';
          lines[i] = fields.map(field => {
            // Re-quote fields that contain commas or quotes
            if (field.includes(',') || field.includes('"')) {
              return `"${field.replace(/"/g, '""')}"`;
            }
            return field;
          }).join(',');
          updated = true;
          break;
        }
      }
    }
    
    if (updated) {
      fs.writeFileSync(this.promptFile, lines.join('\n'));
    }
    return updated;
  }

  removePromptFromTextFile(promptToRemove) {
    const prompts = this.parseTextPrompts(fs.readFileSync(this.promptFile, 'utf8'));
    const remainingPrompts = prompts.filter(p => p !== promptToRemove);
    
    // Reconstruct file with original format
    const content = remainingPrompts.map((p, index) => `${index + 1}→${p}`).join('\n') + '\n';
    fs.writeFileSync(this.promptFile, content);
    return true;
  }

  getRandomDelay() {
    const jitter = (Math.random() - 0.5) * 2 * this.config.jitter;
    return Math.round(this.config.baseDelay + jitter);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async waitWithCountdown(ms, message) {
    const seconds = Math.floor(ms / 1000);
    console.log(chalk.gray(`${message} (${seconds}s)`));
    
    for (let i = seconds; i > 0; i--) {
      if (this.isInterrupted) return;
      process.stdout.write(chalk.gray(`\r⏱️  ${i}s remaining...`));
      await this.sleep(1000);
    }
    process.stdout.write('\r' + ' '.repeat(50) + '\r'); // Clear countdown line
  }

  async promptUserToContinue() {
    return new Promise((resolve) => {
      console.log(chalk.yellow('\n🔄 Processed 8 prompts. Press Enter to continue or Ctrl+C to stop...'));
      
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.once('data', (key) => {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        
        // Check if Ctrl+C was pressed
        if (key[0] === 3) {
          this.isInterrupted = true;
          process.exit(0);
        }
        
        console.log(chalk.green('✅ Continuing...\n'));
        resolve();
      });
    });
  }

  async run() {
    try {
      this.validateInputs();
      
      console.log(chalk.blue('🚀 Prompt-to-Image Automation Tool'));
      console.log(chalk.gray('Target:'), chalk.cyan(this.config.name));
      console.log(chalk.gray('File:'), chalk.cyan(this.promptFile));
      console.log(chalk.gray('Processed file:'), chalk.cyan(this.processedFile));
      console.log('');
      
      // Initial setup delay
      await this.waitWithCountdown(this.setupDelay, '⏳ Waiting for setup - ensure target app is focused');
      
      while (true) {
        if (this.isInterrupted) break;
        
        const prompts = this.readPrompts();
        
        if (prompts.length === 0) {
          console.log(chalk.green('✅ All prompts processed!'));
          break;
        }
        
        const currentPrompt = prompts[0];
        const formattedPrompt = this.formatPrompt(currentPrompt);
        
        console.log(chalk.blue(`\n📝 Processing prompt ${this.processedCount + 1}:`));
        console.log(chalk.white(formattedPrompt));
        
        // Copy to clipboard
        await this.copyToClipboard(formattedPrompt);
        
        // Simulate paste and enter
        const pasted = this.simulatePasteAndEnter();
        if (!pasted) {
          console.error(chalk.red('Failed to simulate keyboard input. Stopping automation.'));
          break;
        }
        
        // Save to processed file and remove from original
        await this.saveProcessedPrompt(currentPrompt);
        this.removePromptFromOriginal(currentPrompt);
        
        this.processedCount++;
        console.log(chalk.green(`✅ Prompt sent successfully (${this.processedCount} processed)`));
        
        // Check if we need user confirmation
        if (this.processedCount % 8 === 0 && prompts.length > 1) {
          await this.promptUserToContinue();
          // After user confirmation, use shorter delay like initial setup
          await this.waitWithCountdown(this.setupDelay, '⏳ Resuming automation - ensure target app is focused');
        } else if (prompts.length > 1) {
          // Normal delay between prompts
          const delay = this.getRandomDelay();
          await this.waitWithCountdown(delay, '⏳ Waiting before next prompt');
          
          // Special handling for OpenAI: refresh browser to fix interface bug
          if (this.targetApp === 'openai') {
            console.log(chalk.yellow('🔄 Refreshing browser for OpenAI (fixing interface bug)'));
            const refreshed = this.simulateBrowserRefresh();
            if (!refreshed) {
              console.error(chalk.red('Failed to refresh browser. Continuing anyway...'));
            }
            // Wait 10 seconds for page reload
            await this.waitWithCountdown(10000, '⏳ Waiting for browser reload');
          }
        }
      }
      
      console.log(chalk.green(`\n🎉 Automation completed! Total prompts processed: ${this.processedCount}`));
      
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2 || args.length > 4) {
    console.log(chalk.blue('🛠️  Prompt-to-Image Automation Tool'));
    console.log('');
    console.log(chalk.white('Usage:'), chalk.cyan('node app.js <targetApp> <promptFile> [baseDelaySeconds] [setupDelaySeconds]'));
    console.log('');
    console.log(chalk.white('Target Apps:'));
    Object.entries(targetConfigs).forEach(([key, config]) => {
      console.log(`  ${chalk.cyan(key.padEnd(10))} - ${config.description} (default: ${config.baseDelay/1000}s)`);
    });
    console.log('');
    console.log(chalk.white('File Formats:'));
    console.log(chalk.gray('  Text files (.txt): 1→prompt format'));
    console.log(chalk.gray('  CSV files (.csv): Sent,Shot,PromptID,Prompt columns'));
    console.log('');
    console.log(chalk.white('Examples:'));
    console.log(chalk.gray('  node app.js openai prompts/fox.txt'));
    console.log(chalk.gray('  node app.js openai prompts/story.csv'));
    console.log(chalk.gray('  node app.js leonardo prompts/fox.txt 30     # Override delay to 30 seconds'));
    console.log(chalk.gray('  node app.js leonardo prompts/fox.txt 30 20  # Override delay to 30s, setup to 20s'));
    console.log('');
    console.log(chalk.white('Note: Tool pauses every 8 prompts for user confirmation'));
    process.exit(1);
  }
  
  const [targetApp, promptFile, baseDelaySeconds, setupDelaySeconds] = args;
  const customBaseDelay = baseDelaySeconds ? parseInt(baseDelaySeconds, 10) : null;
  const customSetupDelay = setupDelaySeconds ? parseInt(setupDelaySeconds, 10) : 10;
  
  if (baseDelaySeconds && (isNaN(customBaseDelay) || customBaseDelay < 1)) {
    console.error(chalk.red('❌ Error: Base delay must be a positive number (seconds)'));
    process.exit(1);
  }
  
  if (setupDelaySeconds && (isNaN(customSetupDelay) || customSetupDelay < 1)) {
    console.error(chalk.red('❌ Error: Setup delay must be a positive number (seconds)'));
    process.exit(1);
  }
  
  const automator = new PromptAutomator(targetApp, promptFile, customBaseDelay, customSetupDelay);
  automator.run();
}

if (require.main === module) {
  main();
}

module.exports = { PromptAutomator, targetConfigs };
