# Developer Notebook

## To Do
- [ ] Implement video slide support.
- [ ] Optimize shaders for lower-end devices.

## In Progress
- [X] Convert monolithic JavaScript into a modular React application.
- [X] Encapsulate Three.js and Tweakpane logic into a custom hook.

## Done
- **2024-07-22**: Initial project setup: created file structure, implemented React entry point, and configured import map.
- **2024-07-22**: Converted original CSS to a CSS-in-JS solution using style objects.
- **2024-07-22**: Implemented the `Preloader` and `SliderUI` components.
- **2024-07-22**: Created the `useWebGLSlider` custom hook to manage all WebGL and interaction logic.
- **2024-07-22**: Integrated all components in `App.tsx` and finalized state management.
- **2024-07-22**: Wrote initial documentation (`README.md`, `noteBook.md`, `bugReport.md`).
- **2024-07-23**: Added two new effects (Glitch, Warp) and two new global controls (Vignette, Grain) with full Tweakpane integration and shader logic.
- **2024-07-23**: Overhauled the Glitch and Warp effects for more dynamic and visually appealing transitions. Improved Tweakpane controls for all effects with precise slider ranges.
- **2024-07-24**: Implemented a new scroll-triggered navigation mode, accessible via a 'Mode' selector in the control panel.
- **2024-07-25**: Completely overhauled the Plasma and Warp effects with more advanced shader techniques (FBM noise, chromatic aberration, etc.) for a more cinematic and visually rich result. Fixed a critical bug with duplicate import maps in `index.html`.
- **2024-07-26**: Created a self-contained Framer component (`WebGLSlider.tsx`) that merges all application logic and replaces the Tweakpane UI with Framer Property Controls.