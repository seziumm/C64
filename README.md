# C64 Terminal Portfolio

My personal website, built as a Commodore 64-style terminal.  
Blog posts and projects are fetched from Supabase. No frameworks, just vanilla HTML/CSS/JS.

[seziumm.github.io/C64](https://seziumm.github.io/C64/)

## Project Structure

```
├── index.html
├── css/
│   ├── font.css              # C64 bitmap font face
│   └── palette.css           # C64 16-color palette as CSS variables
├── font/
│   └── C64.ttf               # Commodore 64 bitmap font
└── js/
    ├── core/
    │   ├── text.js           # Text wrapping & escaping utilities
    │   ├── terminal.js       # Screen rendering & print queue
    │   └── shell.js          # Command registry & middleware
    ├── api/
    │   └── supabase.js       # Supabase REST client
    ├── commands/
    │   ├── static.js         # Hardcoded commands (ABOUT, CONTACT)
    │   └── dynamic.js        # Data-driven commands (PROJECTS, BLOG)
    ├── input/
    │   ├── mobile.js         # Touch events & iOS keyboard management
    │   └── desktop.js        # Focus management for desktop
    └── main.js               # Boot sequence & shared keyboard input
```

## Commands

- `HELP` — list all available commands
- `ABOUT` — a brief intro on who I am
- `CONTACT` — ways to reach me
- `PROJECTS` — browse my projects, pick one by number to read it
- `BLOG` — list of blog posts, pick one by number to read it
- `CLEAR` — clear the screen
