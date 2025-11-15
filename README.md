https://ai.studio/apps/drive/1VsPHhvJ_kqmlLF2Y7xrgOEK-SZHtmkBM

# WebGL Visual Effects Slider

An immersive, fullscreen image slider powered by Three.js and WebGL shaders. This React application delivers a highly dynamic and visually engaging user experience with seven distinct, customizable transition effects.

## Features

- **Seven Unique WebGL Effects**: Glass, Frost, Ripple, Plasma, Timeshift, Glitch, and Warp transitions.
- **Real-time Customization**: An integrated Tweakpane UI allows for live adjustment of all effect parameters.
- **Effect Presets**: Each effect comes with multiple presets (e.g., Subtle, Default, Intense) for quick setup.
- **Multiple Navigation Modes**: Features automatic playback and a manual scroll-triggered mode.
- **Responsive Design**: Fluid layout that works across desktop and mobile devices.
- **Keyboard & Touch Navigation**: Control the slider with arrow keys, spacebar, mouse clicks, or scrolling.
- **Modular React Architecture**: Built with modern React (v18+), TypeScript, and hooks for clean, maintainable code.

## Directory Structure

```
.
├── components/
│   └── SliderUI.tsx
├── config/
│   └── sliderConfig.ts
...
├── WebGLSlider.tsx  <-- New Framer Component
...
```

## Setup and Running

This project is designed to run in a modern browser that supports ES Modules and Import Maps.

1.  **Serve the Files**: Use a simple local server to serve the project directory. You can use tools like `http-server` or the Live Server extension in VS Code.
2.  **Open in Browser**: Navigate to the local server's address (e.g., `http://localhost:8080`) in your browser.

The application will start and launch the interactive slider directly.

## How to Use

- **Navigate Slides**:
  - **Auto Mode** (default): Click anywhere on the screen to advance.
  - **Scroll Mode**: Use your mouse wheel or trackpad to scroll up and down between slides.
  - Use the **left/right arrow keys** or the **spacebar**.
  - Click on the navigation titles at the bottom.
- **Toggle Controls**:
  - Press the **'H' key** to show or hide the effect customization panel.
  - In the panel, you can switch between **'Auto'** and **'Scroll'** navigation modes.
  
## Framer Component

This project includes a self-contained `WebGLSlider.tsx` file designed for use as a Code Component in Framer.

### How to Use in Framer

1.  **Copy the File**: Copy the `WebGLSlider.tsx` file into the `code` directory of your Framer project.
2.  **Use in Editor**: The component will appear in your Framer assets panel. Drag it onto your canvas.
3.  **Customize**: Use the Property Controls in the Framer UI to customize everything:
    - Upload up to 6 slide images.
    - Edit slide titles.
    - Select the navigation **Mode** ('auto' or 'scroll').
    - Set the auto-play speed (in 'auto' mode).
    - Select the transition effect.
    - Fine-tune all global and effect-specific parameters.
