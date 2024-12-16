# Documentation
---
## Table of Contents
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Usage](#usage)


## Introduction
This is a simple chrome extension meant to simulate basic vim commands in google docs. It is a work in progress and is not meant to be a full replacement for vim. The extension is meant to be a fun way to practice vim commands in a different environment. Currently, features are very limited and only basic commands are supported, but more features will be added in the future.

## Installation
1. Clone this repository
```bash
git clone https://github.com/BCCheungGit/Google-Docs-Vim.git
```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable developer mode (toggle in top right corner)
4. Click `Load unpacked` and select the directory where you cloned the repository
5. The extension should now be installed and ready to use, have fun!


## Usage
- `i` to enter insert mode
- `esc` to exit insert mode
- `a` to enter insert mode after the cursor
- `hjkl` to move the cursor in normal and visual mode
- `w` to move the cursor to the beginning of the next word
- `b` to move the cursor to the beginning of the previous word
- `x` to delete the character under the cursor
- `u` to undo the last action
- `/` to enter search mode
- `v` to enter visual mode
- `$` to move the cursor to the end of the line
- `0` to move the cursor to the beginning of the line
