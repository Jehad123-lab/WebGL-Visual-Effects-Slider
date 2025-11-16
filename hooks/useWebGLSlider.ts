
import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { Pane } from 'tweakpane';
import { gsap } from 'gsap';
import { SLIDER_CONFIG } from '../config/sliderConfig';
import { slides } from '../constants/slideData';
import { vertexShader } from '../shaders/vertexShader';
import { fragmentShader } from '../shaders/fragmentShader';
import { tweakpaneStyles } from '../styles';

interface UseWebGLSliderProps {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    onSlideChange: (index: number) => void;
    onProgressUpdate: (progress: number) => void;
    onModeChange: (mode: string) => void;
}

export const useWebGLSlider = ({ canvasRef, onSlideChange, onProgressUpdate, onModeChange }: UseWebGLSliderProps) => {
    const threeState = useRef<any>({}).current; // To store all non-React state
    const isTransitioning = useRef(false);
    const sliderEnabled = useRef(false);
    const progressAnimation = useRef<ReturnType<typeof setInterval> | null>(null);
    const autoSlideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const currentSlideIndexRef = useRef(0);
    const scrollAccumulator = useRef(0);

    const startAutoSlideTimerRef = useRef<(() => void) | null>(null);

    const stopAutoSlideTimer = useCallback(() => {
        if (progressAnimation.current) {
            clearInterval(progressAnimation.current);
            progressAnimation.current = null;
        }
        if (autoSlideTimer.current) {
            clearTimeout(autoSlideTimer.current);
            autoSlideTimer.current = null;
        }
    }, []);

    const quickResetProgress = useCallback(() => {
         onProgressUpdate(0);
    }, [onProgressUpdate]);

    const navigateToSlide = useCallback((targetIndex: number) => {
        if (isTransitioning.current || targetIndex === currentSlideIndexRef.current) return;
        stopAutoSlideTimer();
        
        const { shaderMaterial, slideTextures } = threeState;
        if (!shaderMaterial || !slideTextures) return;

        const currentTexture = slideTextures[currentSlideIndexRef.current];
        const targetTexture = slideTextures[targetIndex];
        if (!currentTexture || !targetTexture) return;

        isTransitioning.current = true;
        shaderMaterial.uniforms.uTexture1.value = currentTexture;
        shaderMaterial.uniforms.uTexture2.value = targetTexture;
        shaderMaterial.uniforms.uTexture1Size.value = currentTexture.userData.size;
        shaderMaterial.uniforms.uTexture2Size.value = targetTexture.userData.size;
        
        currentSlideIndexRef.current = targetIndex;
        onSlideChange(targetIndex);

        gsap.fromTo(
            shaderMaterial.uniforms.uProgress,
            { value: 0 },
            {
                value: 1,
                duration: SLIDER_CONFIG.settings.transitionDuration,
                ease: SLIDER_CONFIG.settings.transitionEase,
                onComplete: () => {
                    shaderMaterial.uniforms.uProgress.value = 0;
                    shaderMaterial.uniforms.uTexture1.value = targetTexture;
                    shaderMaterial.uniforms.uTexture1Size.value = targetTexture.userData.size;
                    isTransitioning.current = false;
                    if (SLIDER_CONFIG.settings.mode === 'auto') {
                        autoSlideTimer.current = setTimeout(() => {
                           if (sliderEnabled.current && startAutoSlideTimerRef.current) {
                               startAutoSlideTimerRef.current();
                           }
                        }, 100);
                    }
                }
            }
        );
    }, [onSlideChange, stopAutoSlideTimer, threeState]);

    const handleSlideChange = useCallback(() => {
        if (isTransitioning.current || !sliderEnabled.current) return;
        const nextIndex = (currentSlideIndexRef.current + 1) % slides.length;
        navigateToSlide(nextIndex);
    }, [navigateToSlide]);

    const startAutoSlideTimer = useCallback(() => {
        if (SLIDER_CONFIG.settings.mode !== 'auto') {
            stopAutoSlideTimer();
            return;
        }
        if (!sliderEnabled.current || !threeState.slideTextures || threeState.slideTextures.length < 2) return;
        stopAutoSlideTimer();
        let progress = 0;
        const PROGRESS_UPDATE_INTERVAL = 50;
        const increment = (100 / SLIDER_CONFIG.settings.autoSlideSpeed) * PROGRESS_UPDATE_INTERVAL;

        progressAnimation.current = setInterval(() => {
            if (!sliderEnabled.current || SLIDER_CONFIG.settings.mode !== 'auto') {
                stopAutoSlideTimer();
                return;
            }
            progress += increment;
            onProgressUpdate(progress);
            if (progress >= 100) {
                if(progressAnimation.current) clearInterval(progressAnimation.current);
                progressAnimation.current = null;
                onProgressUpdate(0); 
                if (!isTransitioning.current) {
                    handleSlideChange();
                }
            }
        }, PROGRESS_UPDATE_INTERVAL);
    }, [onProgressUpdate, stopAutoSlideTimer, handleSlideChange, threeState]);

    useEffect(() => {
        startAutoSlideTimerRef.current = startAutoSlideTimer;
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let isMounted = true;
        const SCROLL_THRESHOLD = 50;
        
        const setupPane = () => {
          const pane = new Pane({ title: "Visual Effects Controls" });
          threeState.pane = pane;
          
          const effectFolders: { [key: string]: any } = {};
          let isApplyingPreset = false;
          
          const getEffectIndex = (effectName: string) => ({ glass: 0, frost: 1, ripple: 2, plasma: 3, timeshift: 4, glitch: 5, warp: 6 }[effectName] || 0);

          const updateShaderUniforms = () => {
            if (!threeState.shaderMaterial) return;
            const { uniforms } = threeState.shaderMaterial;
            const { settings } = SLIDER_CONFIG;
            Object.keys(settings).forEach(key => {
                const uniformKey = `u${key.charAt(0).toUpperCase() + key.slice(1)}`;
                if (uniforms[uniformKey] && key !== 'currentEffect' && key !== 'currentEffectPreset' && key !== 'mode' && key !== 'transitionEase') {
                    uniforms[uniformKey].value = (settings as any)[key];
                }
            });
            uniforms.uEffectType.value = getEffectIndex(settings.currentEffect);
          };

            const generalFolder = pane.addFolder({ title: "General Settings" });
            generalFolder.addBinding(SLIDER_CONFIG.settings, "globalIntensity", { label: "Global Intensity", min: 0.1, max: 2.0, step: 0.1 });
            generalFolder.addBinding(SLIDER_CONFIG.settings, "speedMultiplier", { label: "Speed Multiplier", min: 0.1, max: 3.0, step: 0.1 });
            generalFolder.addBinding(SLIDER_CONFIG.settings, "distortionStrength", { label: "Distortion", min: 0.1, max: 3.0, step: 0.1 });
            generalFolder.addBinding(SLIDER_CONFIG.settings, "colorEnhancement", { label: "Color Enhancement", min: 0.5, max: 2.0, step: 0.1 });
            generalFolder.addBinding(SLIDER_CONFIG.settings, "vignetteStrength", { label: "Vignette", min: 0.0, max: 1.0, step: 0.05 });
            generalFolder.addBinding(SLIDER_CONFIG.settings, "grainIntensity", { label: "Grain", min: 0.0, max: 0.5, step: 0.01 });

            const timingFolder = pane.addFolder({ title: "Timing & Mode" });
            timingFolder.addBinding(SLIDER_CONFIG.settings, "mode", { label: "Mode", options: { Auto: 'auto', Scroll: 'scroll' } });
            timingFolder.addBinding(SLIDER_CONFIG.settings, "transitionDuration", { label: "Transition Duration", min: 0.5, max: 5.0, step: 0.1 });
            timingFolder.addBinding(SLIDER_CONFIG.settings, "transitionEase", {
                label: "Transition Easing",
                options: {
                    Linear: "none",
                    "Power2 In/Out": "power2.inOut",
                    "Power3 In/Out": "power3.inOut",
                    "Power4 In/Out": "power4.inOut",
                    "Expo In/Out": "expo.inOut",
                    "Circ In/Out": "circ.inOut",
                    "Back In/Out": "back.inOut",
                },
            });
            timingFolder.addBinding(SLIDER_CONFIG.settings, "autoSlideSpeed", { label: "Auto Slide Speed", min: 2000, max: 10000, step: 500 });

            const effectFolder = pane.addFolder({ title: "Effect Selection" });
            effectFolder.addBinding(SLIDER_CONFIG.settings, "currentEffect", {
                label: "Effect Type",
                options: { Glass: "glass", Frost: "frost", Ripple: "ripple", Plasma: "plasma", Timeshift: "timeshift", Glitch: "glitch", Warp: "warp" }
            });

            const presetsFolder = pane.addFolder({ title: "Effect Presets" });
            const getPresetOptions = (effectName: string) => {
                const presets = (SLIDER_CONFIG.effectPresets as any)[effectName];
                const options = Object.keys(presets).reduce((acc, key) => ({ ...acc, [key]: key }), {});
                return { ...options, Custom: "Custom" };
            };

            let presetBinding = presetsFolder.addBinding(SLIDER_CONFIG.settings, "currentEffectPreset", {
                label: "Preset",
                options: getPresetOptions(SLIDER_CONFIG.settings.currentEffect)
            });

            effectFolders.glass = pane.addFolder({ title: "Glass Settings", hidden: true });
            effectFolders.glass.addBinding(SLIDER_CONFIG.settings, "glassRefractionStrength", { min: 0.1, max: 3.0, step: 0.1 });
            effectFolders.glass.addBinding(SLIDER_CONFIG.settings, "glassChromaticAberration", { min: 0.1, max: 3.0, step: 0.1 });
            effectFolders.glass.addBinding(SLIDER_CONFIG.settings, "glassBubbleClarity", { min: 0.1, max: 2.0, step: 0.1 });
            effectFolders.glass.addBinding(SLIDER_CONFIG.settings, "glassEdgeGlow", { min: 0.0, max: 2.0, step: 0.1 });
            effectFolders.glass.addBinding(SLIDER_CONFIG.settings, "glassLiquidFlow", { min: 0.1, max: 3.0, step: 0.1 });

            effectFolders.frost = pane.addFolder({ title: "Frost Settings", hidden: true });
            effectFolders.frost.addBinding(SLIDER_CONFIG.settings, "frostIntensity", { min: 0.5, max: 3.0, step: 0.1 });
            effectFolders.frost.addBinding(SLIDER_CONFIG.settings, "frostCrystalSize", { min: 0.3, max: 2.0, step: 0.1 });
            effectFolders.frost.addBinding(SLIDER_CONFIG.settings, "frostIceCoverage", { min: 0.1, max: 2.0, step: 0.1 });
            effectFolders.frost.addBinding(SLIDER_CONFIG.settings, "frostTemperature", { min: 0.1, max: 3.0, step: 0.1 });
            effectFolders.frost.addBinding(SLIDER_CONFIG.settings, "frostTexture", { min: 0.3, max: 2.0, step: 0.1 });

            effectFolders.ripple = pane.addFolder({ title: "Ripple Settings", hidden: true });
            effectFolders.ripple.addBinding(SLIDER_CONFIG.settings, "rippleFrequency", { min: 10.0, max: 50.0, step: 1.0 });
            effectFolders.ripple.addBinding(SLIDER_CONFIG.settings, "rippleAmplitude", { min: 0.02, max: 0.2, step: 0.01 });
            effectFolders.ripple.addBinding(SLIDER_CONFIG.settings, "rippleWaveSpeed", { min: 0.2, max: 3.0, step: 0.1 });
            effectFolders.ripple.addBinding(SLIDER_CONFIG.settings, "rippleRippleCount", { min: 0.1, max: 2.0, step: 0.1 });
            effectFolders.ripple.addBinding(SLIDER_CONFIG.settings, "rippleDecay", { min: 0.2, max: 2.0, step: 0.1 });
            
            effectFolders.plasma = pane.addFolder({ title: "Plasma Settings", hidden: true });
            effectFolders.plasma.addBinding(SLIDER_CONFIG.settings, "plasmaSpeed", { min: 0.2, max: 2.0, step: 0.1 });
            effectFolders.plasma.addBinding(SLIDER_CONFIG.settings, "plasmaEnergyIntensity", { min: 0.0, max: 1.0, step: 0.05 });
            effectFolders.plasma.addBinding(SLIDER_CONFIG.settings, "plasmaContrastBoost", { min: 0.0, max: 1.0, step: 0.05 });
            effectFolders.plasma.addBinding(SLIDER_CONFIG.settings, "plasmaTurbulence", { min: 0.1, max: 3.0, step: 0.1 });

            effectFolders.timeshift = pane.addFolder({ title: "Timeshift Settings", hidden: true });
            effectFolders.timeshift.addBinding(SLIDER_CONFIG.settings, "timeshiftDistortion", { min: 0.3, max: 3.0, step: 0.1 });
            effectFolders.timeshift.addBinding(SLIDER_CONFIG.settings, "timeshiftBlur", { min: 0.3, max: 3.0, step: 0.1 });
            effectFolders.timeshift.addBinding(SLIDER_CONFIG.settings, "timeshiftFlow", { min: 0.3, max: 3.0, step: 0.1 });
            effectFolders.timeshift.addBinding(SLIDER_CONFIG.settings, "timeshiftChromatic", { min: 0.0, max: 3.0, step: 0.1 });
            effectFolders.timeshift.addBinding(SLIDER_CONFIG.settings, "timeshiftTurbulence", { min: 0.3, max: 3.0, step: 0.1 });

            effectFolders.glitch = pane.addFolder({ title: "Glitch Settings", hidden: true });
            effectFolders.glitch.addBinding(SLIDER_CONFIG.settings, "glitchBlockSize", { label: "Block Size", min: 2.0, max: 50.0, step: 1.0 });
            effectFolders.glitch.addBinding(SLIDER_CONFIG.settings, "glitchIntensity", { label: "Intensity", min: 0.0, max: 2.0, step: 0.05 });
            effectFolders.glitch.addBinding(SLIDER_CONFIG.settings, "glitchScanlines", { label: "Scanlines", min: 0.0, max: 1.0, step: 0.05 });
            effectFolders.glitch.addBinding(SLIDER_CONFIG.settings, "glitchColorShift", { label: "Color Shift", min: 0.0, max: 1.0, step: 0.05 });
            effectFolders.glitch.addBinding(SLIDER_CONFIG.settings, "glitchSpeed", { label: "Speed", min: 0.1, max: 3.0, step: 0.1 });

            effectFolders.warp = pane.addFolder({ title: "Warp Settings", hidden: true });
            effectFolders.warp.addBinding(SLIDER_CONFIG.settings, "warpStrength", { label: "Strength", min: 0.0, max: 3.0, step: 0.1 });
            effectFolders.warp.addBinding(SLIDER_CONFIG.settings, "warpRadius", { label: "Radius", min: 0.1, max: 1.5, step: 0.05 });
            effectFolders.warp.addBinding(SLIDER_CONFIG.settings, "warpTwist", { label: "Twist", min: -3.0, max: 3.0, step: 0.1 });
            effectFolders.warp.addBinding(SLIDER_CONFIG.settings, "warpTurbulence", { label: "Turbulence", min: 0.0, max: 5.0, step: 0.1 });
            effectFolders.warp.addBinding(SLIDER_CONFIG.settings, "warpChromaticAberration", { label: "Chromatic", min: 0.0, max: 2.0, step: 0.05 });
            effectFolders.warp.addBinding(SLIDER_CONFIG.settings, "warpSpeed", { label: "Speed", min: 0.1, max: 3.0, step: 0.1 });
            
            const updateEffectFolderVisibility = (currentEffect: string) => {
                Object.keys(effectFolders).forEach(key => {
                    effectFolders[key].hidden = key !== currentEffect;
                });
            };

            const applyEffectPreset = (effectName: string, presetName: string) => {
                const preset = (SLIDER_CONFIG.effectPresets as any)[effectName]?.[presetName];
                if (preset) {
                    isApplyingPreset = true;
                    Object.assign(SLIDER_CONFIG.settings, preset);
                    pane.refresh();
                    updateShaderUniforms();
                    setTimeout(() => { isApplyingPreset = false; }, 100);
                }
            };
            
            const handleEffectChange = (newEffect: string) => {
                updateEffectFolderVisibility(newEffect);
                presetsFolder.remove(presetBinding);
                SLIDER_CONFIG.settings.currentEffectPreset = "Default";
                presetBinding = presetsFolder.addBinding(SLIDER_CONFIG.settings, "currentEffectPreset", { label: "Preset", options: getPresetOptions(newEffect) });
                applyEffectPreset(newEffect, "Default");
            };
            
            updateEffectFolderVisibility(SLIDER_CONFIG.settings.currentEffect);

            pane.on('change', (ev) => {
                if (isApplyingPreset) return;
                const key = (ev.target as any).key;
                
                if (key === 'currentEffect') {
                    handleEffectChange(SLIDER_CONFIG.settings.currentEffect);
                } else if (key === 'currentEffectPreset') {
                    applyEffectPreset(SLIDER_CONFIG.settings.currentEffect, SLIDER_CONFIG.settings.currentEffectPreset);
                } else if (key === 'mode') {
                    onModeChange(SLIDER_CONFIG.settings.mode);
                    if (SLIDER_CONFIG.settings.mode === 'auto') {
                        startAutoSlideTimer();
                    } else {
                        stopAutoSlideTimer();
                        onProgressUpdate(0);
                    }
                } else {
                    if ((SLIDER_CONFIG.effectPresets as any)[SLIDER_CONFIG.settings.currentEffect]?.Default.hasOwnProperty(key)) {
                        SLIDER_CONFIG.settings.currentEffectPreset = "Custom";
                        pane.refresh();
                    }
                    updateShaderUniforms();
                }
            });

            const paneElement = canvas.parentElement?.querySelector<HTMLElement>(".tp-dfwv");
            if (paneElement) paneElement.style.display = 'none';
        };

        const init = async () => {
            threeState.scene = new THREE.Scene();
            threeState.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            threeState.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
            threeState.renderer.setSize(window.innerWidth, window.innerHeight);
            threeState.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            const uniforms: { [key: string]: THREE.IUniform } = {
                uTexture1: { value: null },
                uTexture2: { value: null },
                uProgress: { value: 0.0 },
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                uTexture1Size: { value: new THREE.Vector2(1, 1) },
                uTexture2Size: { value: new THREE.Vector2(1, 1) },
                uEffectType: { value: 0 },
                // Global
                uGlobalIntensity: { value: SLIDER_CONFIG.settings.globalIntensity },
                uSpeedMultiplier: { value: SLIDER_CONFIG.settings.speedMultiplier },
                uDistortionStrength: { value: SLIDER_CONFIG.settings.distortionStrength },
                uColorEnhancement: { value: SLIDER_CONFIG.settings.colorEnhancement },
                uVignetteStrength: { value: SLIDER_CONFIG.settings.vignetteStrength },
                uGrainIntensity: { value: SLIDER_CONFIG.settings.grainIntensity },
                // Glass
                uGlassRefractionStrength: { value: SLIDER_CONFIG.settings.glassRefractionStrength },
                uGlassChromaticAberration: { value: SLIDER_CONFIG.settings.glassChromaticAberration },
                uGlassBubbleClarity: { value: SLIDER_CONFIG.settings.glassBubbleClarity },
                uGlassEdgeGlow: { value: SLIDER_CONFIG.settings.glassEdgeGlow },
                uGlassLiquidFlow: { value: SLIDER_CONFIG.settings.glassLiquidFlow },
                // Frost
                uFrostIntensity: { value: SLIDER_CONFIG.settings.frostIntensity },
                uFrostCrystalSize: { value: SLIDER_CONFIG.settings.frostCrystalSize },
                uFrostIceCoverage: { value: SLIDER_CONFIG.settings.frostIceCoverage },
                uFrostTemperature: { value: SLIDER_CONFIG.settings.frostTemperature },
                uFrostTexture: { value: SLIDER_CONFIG.settings.frostTexture },
                // Ripple
                uRippleFrequency: { value: SLIDER_CONFIG.settings.rippleFrequency },
                uRippleAmplitude: { value: SLIDER_CONFIG.settings.rippleAmplitude },
                uRippleWaveSpeed: { value: SLIDER_CONFIG.settings.rippleWaveSpeed },
                uRippleRippleCount: { value: SLIDER_CONFIG.settings.rippleRippleCount },
                uRippleDecay: { value: SLIDER_CONFIG.settings.rippleDecay },
                // Plasma
                uPlasmaSpeed: { value: SLIDER_CONFIG.settings.plasmaSpeed },
                uPlasmaEnergyIntensity: { value: SLIDER_CONFIG.settings.plasmaEnergyIntensity },
                uPlasmaContrastBoost: { value: SLIDER_CONFIG.settings.plasmaContrastBoost },
                uPlasmaTurbulence: { value: SLIDER_CONFIG.settings.plasmaTurbulence },
                // Timeshift
                uTimeshiftDistortion: { value: SLIDER_CONFIG.settings.timeshiftDistortion },
                uTimeshiftBlur: { value: SLIDER_CONFIG.settings.timeshiftBlur },
                uTimeshiftFlow: { value: SLIDER_CONFIG.settings.timeshiftFlow },
                uTimeshiftChromatic: { value: SLIDER_CONFIG.settings.timeshiftChromatic },
                uTimeshiftTurbulence: { value: SLIDER_CONFIG.settings.timeshiftTurbulence },
                // Glitch
                uGlitchBlockSize: { value: SLIDER_CONFIG.settings.glitchBlockSize },
                uGlitchIntensity: { value: SLIDER_CONFIG.settings.glitchIntensity },
                uGlitchScanlines: { value: SLIDER_CONFIG.settings.glitchScanlines },
                uGlitchColorShift: { value: SLIDER_CONFIG.settings.glitchColorShift },
                uGlitchSpeed: { value: SLIDER_CONFIG.settings.glitchSpeed },
                // Warp
                uWarpStrength: { value: SLIDER_CONFIG.settings.warpStrength },
                uWarpRadius: { value: SLIDER_CONFIG.settings.warpRadius },
                uWarpTwist: { value: SLIDER_CONFIG.settings.warpTwist },
                uWarpTurbulence: { value: SLIDER_CONFIG.settings.warpTurbulence },
                uWarpChromaticAberration: { value: SLIDER_CONFIG.settings.warpChromaticAberration },
                uWarpSpeed: { value: SLIDER_CONFIG.settings.warpSpeed },
            };

            threeState.shaderMaterial = new THREE.ShaderMaterial({
                uniforms,
                vertexShader,
                fragmentShader
            });

            const geometry = new THREE.PlaneGeometry(2, 2);
            const mesh = new THREE.Mesh(geometry, threeState.shaderMaterial);
            threeState.scene.add(mesh);

            threeState.slideTextures = await Promise.all(
                slides.map(slide => new THREE.TextureLoader().loadAsync(slide.media))
            );
            threeState.slideTextures.forEach((texture: THREE.Texture) => {
                texture.userData.size = new THREE.Vector2((texture.image as HTMLImageElement).width, (texture.image as HTMLImageElement).height);
            });

            if (!isMounted) return;

            if (threeState.slideTextures.length >= 2) {
                threeState.shaderMaterial.uniforms.uTexture1.value = threeState.slideTextures[0];
                threeState.shaderMaterial.uniforms.uTexture2.value = threeState.slideTextures[1];
                threeState.shaderMaterial.uniforms.uTexture1Size.value = threeState.slideTextures[0].userData.size;
                threeState.shaderMaterial.uniforms.uTexture2Size.value = threeState.slideTextures[1].userData.size;
                sliderEnabled.current = true;
                startAutoSlideTimer();
            }

            setupPane();

            const styleTag = document.createElement('style');
            styleTag.innerHTML = tweakpaneStyles;
            document.head.appendChild(styleTag);
            threeState.styleTag = styleTag;


            const animate = () => {
                if (!isMounted) return;
                requestAnimationFrame(animate);
                threeState.renderer.render(threeState.scene, threeState.camera);
            };
            animate();
        };

        init();

        const handleResize = () => {
             if (threeState.renderer && threeState.shaderMaterial) {
                threeState.renderer.setSize(window.innerWidth, window.innerHeight);
                threeState.shaderMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
             }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space" || e.code === "ArrowRight") {
                e.preventDefault();
                stopAutoSlideTimer();
                quickResetProgress();
                handleSlideChange();
            } else if (e.code === "ArrowLeft") {
                e.preventDefault();
                stopAutoSlideTimer();
                quickResetProgress();
                const prevIndex = (currentSlideIndexRef.current - 1 + slides.length) % slides.length;
                navigateToSlide(prevIndex);
            } else if (e.code === 'KeyH') {
                 const paneElement = canvas.parentElement?.querySelector<HTMLElement>(".tp-dfwv");
                 if (paneElement) paneElement.style.display = paneElement.style.display === 'none' ? 'block' : 'none';
            }
        };

        const handleWheel = (e: WheelEvent) => {
            if (SLIDER_CONFIG.settings.mode !== 'scroll' || isTransitioning.current) return;
            e.preventDefault();
            
            scrollAccumulator.current += e.deltaY;

            if (Math.abs(scrollAccumulator.current) > SCROLL_THRESHOLD) {
                stopAutoSlideTimer();
                quickResetProgress();

                if (scrollAccumulator.current > 0) {
                    handleSlideChange();
                } else {
                    const prevIndex = (currentSlideIndexRef.current - 1 + slides.length) % slides.length;
                    navigateToSlide(prevIndex);
                }
                scrollAccumulator.current = 0;
            }
        };

        window.addEventListener('resize', handleResize);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            isMounted = false;
            stopAutoSlideTimer();
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('wheel', handleWheel);
            threeState.pane?.dispose();
            if (threeState.styleTag) document.head.removeChild(threeState.styleTag);
            threeState.renderer?.dispose();
        };
    }, [canvasRef, startAutoSlideTimer, stopAutoSlideTimer, handleSlideChange, navigateToSlide, quickResetProgress, onProgressUpdate, onModeChange]);

    return { navigateToSlide, handleSlideChange, stopAutoSlideTimer, quickResetProgress };
};
