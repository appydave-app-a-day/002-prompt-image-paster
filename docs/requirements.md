Here is your **updated requirements specification** for the Prompt-to-Image Automation Tool, reflecting all current decisions:

---

## 🛠️ **Prompt-to-Image Automation Tool – Requirements Specification (v2)**

### 🧩 **Core Function**

A **Node.js command-line script** that:

* Reads prompts from a `.txt` file (one prompt per line)
* Copies the prompt to clipboard
* Simulates **paste + Enter**
* Tracks processed prompts by:

  * Removing them from the input file
  * Appending them to a `.processed.txt` file

---

### 🚀 **How to Run**

```bash
node app.js openai prompts/fox.txt
```

### 🧾 **Arguments**

| Position | Parameter    | Description                                  |
| -------- | ------------ | -------------------------------------------- |
| 1        | `targetApp`  | `"leonardo"` or `"openai"`                   |
| 2        | `promptFile` | Path to `.txt` file with one prompt per line |

---

### 📂 **File Handling**

* **Input File**: `[some-name].txt`
  e.g., `fox.txt`

* **Processed File**: `[some-name].processed.txt`
  e.g., `fox.processed.txt`

---

### 🧠 **Prompt Formatting**

| Target App | Prompt Format                      |
| ---------- | ---------------------------------- |
| Leonardo   | Raw prompt (no wrapping or suffix) |
| OpenAI     | `create image: ${prompt} 16:9`     |

---

### ⏱️ **Randomized Wait Time Between Prompts**

| Target App | Base Delay | Jitter  | Final Range  |
| ---------- | ---------- | ------- | ------------ |
| Leonardo   | 50 sec     | ±15 sec | 35 – 65 sec  |
| OpenAI     | 120 sec    | ±30 sec | 90 – 150 sec |

---

### 🔄 **Behavior Flow**

1. User opens the target app in Chrome (Leonardo or ChatGPT) and focuses the input field.

2. User runs the script with proper args.

3. Script:

   * Waits 10 seconds for setup
   * Reads the first line of the input file
   * Formats the prompt based on the app
   * Copies prompt to clipboard
   * Simulates paste (`Cmd+V` / `Ctrl+V`) and press `Enter`
   * Moves prompt to `.processed.txt`
   * Waits randomized delay
   * Repeats

4. Every 8 prompts: optional pause for user confirmation (press key to continue)

