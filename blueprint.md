# Project Blueprint: Calc Rush

## Overview

Calc Rush is a fast-paced puzzle game where players drop numbered and operator blocks to form equations and score points. The game is built with Next.js and TypeScript, using a custom grid-based physics and game logic engine.

## Core Architecture: 3-Phase Model

The game operates on a simple and robust three-phase model:

1.  **PLACEMENT:** The active block is controlled by the user at the top of the screen. The user can move it left or right.
2.  **FALLING:** Once dropped, the block enters a pseudo-physics simulation. It accelerates downwards with gravity, can slide, and its size can change dynamically based on its value.
3.  **LOCKED:** When the block comes to a rest at the bottom of the playfield or on top of another locked block, it snaps to the grid. At this point, the game checks for any valid mathematical equations.

## Core Features

*   **Grid-Based Gameplay:** Blocks exist on a fixed grid, providing predictable and controllable gameplay.
*   **Custom Physics:** A simple, custom physics model for the "FALLING" phase creates a dynamic and engaging feel without the overhead of a full physics engine.
*   **Equation-Solving:** Players must strategically place blocks to form valid mathematical equations (e.g., `3 + 4 = 7`).
*   **Dynamic Block Sizing:** Number blocks change size based on their value, adding a visual cue and an element of danger/relief.

## Design and Style

*   **Minimalist UI:** A clean, minimalist interface that focuses on the gameplay.
*   **Color-Coded Blocks:** Number blocks are green, and operator blocks are yellow, providing a clear visual distinction.

## Recent Changes (Major Refactor)

*   **Removed `matter-js`:** The `matter-js` physics engine has been completely removed from the project.
*   **Implemented 3-Phase Architecture:** The game logic has been rewritten from scratch to use the PLACEMENT → FALLING → LOCKED model.
*   **New Game Files:** Created new, simplified versions of `Game.ts`, `Renderer.ts`, and `types.ts`.
*   **New Constants:** Added a `constants.ts` file to manage game parameters like grid size, gravity, and colors.
*   **Updated UI:** The main `index.tsx` file has been updated to drive the new game logic and render the new, simplified UI.
