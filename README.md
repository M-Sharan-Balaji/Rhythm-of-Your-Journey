# Rhythm of Your Journey

Live demo: https://rhythm-of-your-journey.vercel.app/

Rhythm of Your Journey is a browser-based rhythm side-scroller where gameplay and music are tightly coupled. Player actions directly influence a looping musical sequence, and progression through the game layers additional musical elements. The game functions both as an interactive experience and a generative music system.

## Overview

In most games, music exists independently of gameplay. In Rhythm of Your Journey, music defines the structure of the level. Timing, progression, and challenge are synchronized to a fixed rhythmic grid.

Each stage introduces a new instrument layer. Notes placed earlier remain active as the player progresses, gradually forming a complete musical composition by the end of a run.

## Gameplay

The game is a side-scrolling runner with rhythm-based mechanics.

- The world scrolls automatically
- The player jumps to avoid obstacles
- Actions are aligned to an 8-step rhythmic loop
- Notes placed by the player persist across stages
- Visual cues indicate timing, current step, and progression

Success depends on maintaining rhythm rather than reacting quickly.

## Audio System

Audio is generated in real time using the Web Audio API via Tone.js.

- Loop-based sequencing with precise scheduling
- Multiple instrument tracks layered progressively
- Notes triggered and modified by player input
- Light processing applied for consistency and balance
- Option to export the generated track

Each playthrough produces a unique musical result.

## Technical Stack

- JavaScript (vanilla)
- HTML5 Canvas for rendering
- Tone.js for audio synthesis and scheduling
- Static hosting (Vercel)

The project runs entirely client-side with no backend.

## Controls

SPACE  
Jump and place or overwrite a note on the current step

Movement and timing are automatic.

## Project Structure

/
├── music-runner/
│   ├── sprites/
│   ├── backgrounds/
│   └── index.html/
│   └── main.js/
│   └── style.css/
└── README.md

## Motivation

This project explores music as a core gameplay mechanic rather than a supporting element. It was built as an experiment in audio-visual synchronization, procedural composition, and minimalistic game design.

It is suitable as a creative coding project, a rhythm game prototype, or a hackathon submission focused on novelty and execution.

## Disclaimer

This project is non-commercial and created for educational and experimental purposes.

Any third-party logos or brand-inspired visuals used in earlier iterations of the project are the property of their respective owners and are not intended to imply endorsement, affiliation, or association. Where applicable, such visuals are used in a transformative or illustrative context.

## Future Work

- Expanded rhythm patterns and time signatures
- Additional instruments and sound design options
- Difficulty scaling based on timing accuracy
- Saving and sharing generated compositions
- Improved mobile support

## License

MIT License
