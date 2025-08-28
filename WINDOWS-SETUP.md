# Windows Setup Guide for Junior Developers

This guide will walk you through setting up the Prompt Image Paster tool on Windows from scratch.

## Prerequisites Check

First, let's check if you have Node.js installed:

1. Press `Windows + R`
2. Type `cmd` and press Enter
3. In the command prompt, type: `node --version`
4. If you see a version number (like `v18.17.0`), you have Node.js! Skip to Step 2.
5. If you get an error, continue to Step 1.

## Step 1: Install Node.js (if needed)

1. Go to https://nodejs.org
2. Click the green button that says "LTS" (Long Term Support)
3. Download and run the installer
4. Follow the installation wizard (use all default options)
5. Restart your computer
6. Test the installation:
   - Open Command Prompt (`Windows + R`, type `cmd`, press Enter)
   - Type `node --version` - you should see a version number

## Step 2: Download the Project from GitHub

### Option A: Download as ZIP (Easiest)
1. Go to the GitHub repository page (you should have this URL)
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Extract the ZIP file to a folder like `C:\Projects\prompt-image-paster`

### Option B: Using Git (More Advanced)
If you want to use Git:
1. Install Git from https://git-scm.com/download/win
2. Open Command Prompt
3. Navigate to where you want the project: `cd C:\Projects`
4. Clone the repository: `git clone [repository-url]`

## Step 3: Install Project Dependencies

1. Open Command Prompt (`Windows + R`, type `cmd`, press Enter)
2. Navigate to your project folder:
   ```
   cd C:\Projects\prompt-image-paster
   ```
   (Replace with your actual path)

3. Install the required packages:
   ```
   npm install
   ```
   
   You should see output like:
   ```
   npm WARN deprecated ...
   added 45 packages in 3.2s
   ```

## Step 4: Test the Installation

1. In the same Command Prompt, type:
   ```
   node app.js
   ```

2. You should see help text starting with:
   ```
   🛠️  Prompt-to-Image Automation Tool
   
   Usage: node app.js <targetApp> <promptFile> ...
   ```

3. If you see this, congratulations! The tool is installed correctly.

## Step 5: Prepare Your Prompt Files

1. Look in the `prompts` folder - you should see project subfolders like `boy-baker/`
2. Files are organized by project: `prompts/project-name/file.csv`
3. You can use the existing CSV files or create your own project folder
4. For CSV format, use these columns: `Sent,Shot,PromptID,Prompt`

## Step 6: Grant Permissions (Important!)

The tool needs permission to control your keyboard and mouse:

1. Go to **Settings** → **Privacy & Security** → **Accessibility**
2. Make sure **Command Prompt** or your terminal has permission
3. You might need to run Command Prompt as Administrator:
   - Right-click Command Prompt
   - Select "Run as administrator"

## Step 7: Test with a Single Prompt

1. Open ChatGPT in your web browser
2. In Command Prompt, run:
   ```
   node app.js openai prompts/boy-baker/boy-baker-v3.csv --delay=5 --setup=5 --pause=1
   ```

3. You'll have 5 seconds to click on the ChatGPT input field
4. The tool will paste one prompt and pause for confirmation

## Common Issues & Solutions

### "npm is not recognized"
- Node.js wasn't installed properly
- Restart your computer and try again
- Reinstall Node.js from nodejs.org

### "Permission denied" or keyboard doesn't work
- Run Command Prompt as Administrator
- Check Windows accessibility permissions
- Make sure ChatGPT window is focused

### "Module not found"
- Make sure you ran `npm install` in the correct folder
- Check that you're in the project directory: `dir` should show `app.js`

### Path with spaces
If your folder path has spaces, wrap it in quotes:
```
cd "C:\My Projects\prompt-image-paster"
```

## Next Steps

Once everything works:
1. Create your own project folder like `prompts/my-story/`
2. Add your CSV prompt files using the format: `Sent,Shot,PromptID,Prompt`
3. Use different delay settings for your needs
4. Check the main README.md for advanced usage

## Getting Help

If you get stuck:
1. Make sure you followed each step exactly
2. Check that all paths are correct
3. Try running Command Prompt as Administrator
4. Ask for help with the exact error message you're seeing

## File Structure Check

Your folder should look like this:
```
prompt-image-paster/
├── app.js
├── package.json
├── package-lock.json
├── node_modules/ (folder)
├── prompts/ (folder)
├── README.md
└── WINDOWS-SETUP.md (this file)
```

If `node_modules` folder is missing, run `npm install` again.