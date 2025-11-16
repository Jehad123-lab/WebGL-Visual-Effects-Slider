
import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';
import { addPropertyControls, ControlType } from 'framer';

// --- STYLES ---
const theme = {
  fontMono: '"PPSupplyMono", monospace',
  fontSans: '"PP Neue Montreal", sans-serif',
  colorBg: '#000',
  colorText: '#fff',
  colorTextMuted: 'rgba(255, 255, 255, 0.8)',
  colorAccent: '#fff',
  spacingSm: '1rem',
  spacingMd: '2rem',
};

const styles: { [key: string]: React.CSSProperties } = {
  body: {
    fontFamily: theme.fontSans,
    background: theme.colorBg,
    color: theme.colorText,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    margin: 0,
    padding: 0,
  },
  sliderWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  webglCanvas: {
    display: 'block',
    width: '100%',
    height: '100%',
  },
  slideNumber: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    fontFamily: theme.fontMono,
    fontWeight: 600,
    color: theme.colorText,
    zIndex: 3,
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  slideTotal: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    fontFamily: theme.fontMono,
    fontWeight: 600,
    color: theme.colorText,
    zIndex: 3,
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  slidesNavigation: {
    position: 'absolute',
    display: 'flex',
    gap: 0,
    zIndex: 3,
    pointerEvents: 'all',
  },
  slideNavItem: {
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    padding: theme.spacingSm,
    flex: 1,
    border: 'none',
    background: 'none',
    textAlign: 'left',
  },
  slideProgressLine: {
    width: '100%',
    height: '2px',
    background: 'rgba(255, 255, 255, 0.2)',
    marginBottom: '8px',
    borderRadius: '1px',
    overflow: 'hidden',
  },
  slideProgressFill: {
    height: '100%',
    width: '0%',
    background: theme.colorAccent,
    transition: 'width 0.1s ease, opacity 0.3s ease',
    borderRadius: '1px',
  },
  slideNavTitle: {
    fontFamily: theme.fontMono,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: theme.colorTextMuted,
    fontWeight: 600,
    transition: 'color 0.3s ease',
  },
  slideNavTitleActive: {
    color: theme.colorText,
  },
};

// --- SHADERS ---
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture1;
  uniform sampler2D uTexture2;
  uniform float uProgress;
  uniform vec2 uResolution;
  uniform vec2 uTexture1Size;
  uniform vec2 uTexture2Size;
  uniform int uEffectType;
  
  uniform float uGlobalIntensity;
  uniform float uSpeedMultiplier;
  uniform float uDistortionStrength;
  uniform float uColorEnhancement;
  uniform float uVignetteStrength;
  uniform float uGrainIntensity;
  
  uniform float uGlassRefractionStrength;
  uniform float uGlassChromaticAberration;
  uniform float uGlassBubbleClarity;
  uniform float uGlassEdgeGlow;
  uniform float uGlassLiquidFlow;
  
  uniform float uFrostIntensity;
  uniform float uFrostCrystalSize;
  uniform float uFrostIceCoverage;
  uniform float uFrostTemperature;
  uniform float uFrostTexture;
  
  uniform float uRippleFrequency;
  uniform float uRippleAmplitude;
  uniform float uRippleWaveSpeed;
  uniform float uRippleRippleCount;
  uniform float uRippleDecay;
  
  uniform float uPlasmaSpeed;
  uniform float uPlasmaEnergyIntensity;
  uniform float uPlasmaContrastBoost;
  uniform float uPlasmaTurbulence;
  
  uniform float uTimeshiftDistortion;
  uniform float uTimeshiftBlur;
  uniform float uTimeshiftFlow;
  uniform float uTimeshiftChromatic;
  uniform float uTimeshiftTurbulence;

  uniform float uGlitchBlockSize;
  uniform float uGlitchIntensity;
  uniform float uGlitchScanlines;
  uniform float uGlitchColorShift;
  uniform float uGlitchSpeed;

  uniform float uWarpStrength;
  uniform float uWarpRadius;
  uniform float uWarpTwist;
  uniform float uWarpTurbulence;
  uniform float uWarpChromaticAberration;
  uniform float uWarpSpeed;
  
  varying vec2 vUv;

  vec2 getCoverUV(vec2 uv, vec2 textureSize) {
    vec2 s = uResolution / textureSize;
    float scale = max(s.x, s.y);
    vec2 scaledSize = textureSize * scale;
    vec2 offset = (uResolution - scaledSize) * 0.5;
    return (uv * uResolution - offset) / scaledSize;
  }

  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(noise(i), noise(i + vec2(1.0, 0.0)), f.x), mix(noise(i + vec2(0.0, 1.0)), noise(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  mat2 rotate2d(float angle){ return mat2(cos(angle),-sin(angle), sin(angle),cos(angle)); }

  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 6; i++) { v += a * smoothNoise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  float rand(vec2 uv) { return fract(sin(dot(uv, vec2(92., 80.))) * 51.); }

  vec4 glassEffect(vec2 uv, float progress) {
    float glassStrength = 0.08 * uGlassRefractionStrength * uDistortionStrength * uGlobalIntensity;
    float chromaticAberration = 0.02 * uGlassChromaticAberration * uGlobalIntensity;
    float clearCenterSize = 0.3 * uGlassBubbleClarity;
    float time = progress * 5.0 * uSpeedMultiplier;
    vec2 center = vec2(0.5, 0.5);
    vec2 p = uv * uResolution;
    float maxRadius = length(uResolution) * 0.85;
    float bubbleRadius = progress * maxRadius;
    float dist = length(p - center * uResolution);
    float inside = smoothstep(bubbleRadius + 3.0, bubbleRadius - 3.0, dist);
    vec2 distortedUV = getCoverUV(uv, uTexture2Size);
    if (inside > 0.0) {
      float normalizedDist = dist / max(bubbleRadius, 0.001);
      vec2 direction = (dist > 0.0) ? (p - center * uResolution) / dist : vec2(0.0);
      float distanceFactor = smoothstep(clearCenterSize, 1.0, normalizedDist);
      float refractionOffset = glassStrength * pow(distanceFactor, 1.5);
      vec2 flowDirection = normalize(direction + vec2(sin(time), cos(time * 0.7)) * 0.3);
      distortedUV -= flowDirection * refractionOffset;
    }
    vec4 newImg;
    if (inside > 0.0) {
      float aberrationOffset = chromaticAberration * pow(smoothstep(clearCenterSize, 1.0, dist / max(bubbleRadius, 0.001)), 1.2);
      float r = texture2D(uTexture2, distortedUV + (p - center * uResolution) / dist * aberrationOffset * 1.2).r;
      float g = texture2D(uTexture2, distortedUV + (p - center * uResolution) / dist * aberrationOffset * 0.2).g;
      float b = texture2D(uTexture2, distortedUV - (p - center * uResolution) / dist * aberrationOffset * 0.8).b;
      newImg = vec4(r, g, b, 1.0);
    } else {
      newImg = texture2D(uTexture2, getCoverUV(uv, uTexture2Size));
    }
    newImg.rgb = mix(newImg.rgb, newImg.rgb * 1.2, (uColorEnhancement - 1.0) * 0.5);
    vec4 currentImg = texture2D(uTexture1, getCoverUV(uv, uTexture1Size));
    if (progress > 0.95) newImg = mix(newImg, texture2D(uTexture2, getCoverUV(uv, uTexture2Size)), (progress - 0.95) / 0.05);
    return mix(currentImg, newImg, inside);
  }
  vec4 frostEffect(vec2 uv, float progress) {
    float frost = smoothNoise(uv * (80.0 / uFrostCrystalSize) * uFrostTexture);
    float size = mix(progress, sqrt(progress), 0.5) * 1.12 * clamp(uFrostIceCoverage, 0.1, 2.5) + 1e-7;
    float dist = distance(uv, vec2(0.5));
    float vignette = pow(1.0 - smoothstep(size, clamp(pow(size, 4.0) / 2.0, size * 0.1, size * 8.0), dist), 2.0);
    vec2 rnd = vec2(rand(uv + frost * 0.1), rand(uv + frost * 0.1 + 0.5)) * frost * vignette * (0.8 * uFrostIntensity * uGlobalIntensity * uDistortionStrength) * (1.0 - floor(vignette));
    vec4 frozen = texture2D(uTexture2, getCoverUV(uv + rnd * 0.06, uTexture2Size));
    float tempShift = clamp(uFrostTemperature * 0.15, 0.0, 0.3);
    frozen *= vec4(clamp(0.85 + tempShift, 0.7, 1.2), 0.9, clamp(1.2 - tempShift, 0.8, 1.3), 1.0);
    vec4 finalFrost = mix(texture2D(uTexture2, getCoverUV(uv, uTexture2Size)), frozen, smoothstep(smoothNoise(uv * 25.0 / uFrostCrystalSize + 200.0) * 0.8, 1.0, pow(vignette, 1.5)));
    finalFrost.rgb *= mix(1.0, 1.2, (uColorEnhancement - 1.0) * 0.5);
    return mix(texture2D(uTexture1, getCoverUV(uv, uTexture1Size)), finalFrost, smoothstep(0.0, 1.0, progress));
  }
  vec4 rippleEffect(vec2 uv, float progress) {
    float dist = distance(uv, vec2(0.5));
    float waveRadius = progress * 0.8 * 1.5 * (uRippleWaveSpeed * uSpeedMultiplier);
    float ripple = sin((dist - waveRadius) * uRippleFrequency) * exp(-abs(dist - waveRadius) * 8.0 * uRippleDecay);
    vec2 distortedUV = getCoverUV(uv + normalize(uv - vec2(0.5)) * ripple * (uRippleAmplitude * uDistortionStrength * uGlobalIntensity), uTexture2Size);
    vec4 rippleResult = mix(texture2D(uTexture2, getCoverUV(uv, uTexture2Size)), texture2D(uTexture2, distortedUV), smoothstep(0.8, 0.72, dist));
    rippleResult.rgb *= mix(1.0, 1.2, (uColorEnhancement - 1.0) * 0.5);
    return mix(texture2D(uTexture1, getCoverUV(uv, uTexture1Size)), rippleResult, smoothstep(0.0, 1.0, progress));
  }
  vec3 plasmaColor(float i) {
      vec3 c1=vec3(.1,.0,.4),c2=vec3(1.,.2,.5),c3=vec3(1.,.9,.3);
      float t=smoothstep(0.,1.,i);
      return mix(mix(c1,c2,smoothstep(0.,.6,t)),c3,smoothstep(.5,1.,t));
  }
  vec4 plasmaEffect(vec2 uv, float progress) {
    float time = progress * 6.0 * uPlasmaSpeed * uSpeedMultiplier;
    float phase = smoothstep(0.0, 1.0, 1.0 - abs(progress - 0.5) * 2.0);
    float fbmNoise = fbm(rotate2d(time*.1)*uv*2.*uPlasmaTurbulence+time*.1);
    float i = pow(sin(fbmNoise*8.+time)*.5+.5,2.);
    vec2 dist = (vec2(fbm(uv*4.*uPlasmaTurbulence)-.5,fbm(uv*4.*uPlasmaTurbulence+5.2)-.5)) * i*.03*uDistortionStrength*uGlobalIntensity*phase;
    vec4 mixed = mix(texture2D(uTexture1, getCoverUV(uv+dist,uTexture1Size)), texture2D(uTexture2, getCoverUV(uv-dist,uTexture2Size)), progress);
    vec3 finalColor = mixed.rgb + plasmaColor(i)*pow(i,3.)*uPlasmaEnergyIntensity*phase*2.;
    finalColor = (finalColor-.5)*(1.+uPlasmaContrastBoost*i*phase)+.5;
    vec4 r = vec4(finalColor,1.);
    if(progress>.85) r=mix(r,texture2D(uTexture2,getCoverUV(uv,uTexture2Size)),(progress-.85)/.15);
    return mix(texture2D(uTexture1,getCoverUV(uv,uTexture1Size)),r,smoothstep(0.,1.,progress));
  }
  vec4 timeshiftEffect(vec2 uv, float progress) {
    float circleRadius=progress*length(uResolution)*.85;
    float inside=smoothstep(circleRadius+circleRadius*.2*uTimeshiftBlur,circleRadius-circleRadius*.2*uTimeshiftBlur,length(uv*uResolution-vec2(.5)*uResolution));
    vec4 finalColor;
    if(inside>.01 && inside<.99) {
        float boundary=smoothstep(0.,.3,inside)*smoothstep(1.,.7,inside);
        float time=progress*6.28*uTimeshiftFlow*uSpeedMultiplier;
        vec2 turb=vec2(fbm(uv*12.*uTimeshiftTurbulence+time*.4),fbm(uv*12.*uTimeshiftTurbulence-time*.5));
        vec2 disp=turb*.18*uTimeshiftDistortion*uDistortionStrength*uGlobalIntensity*boundary;
        finalColor=mix(texture2D(uTexture1,getCoverUV(uv+disp,uTexture1Size)),texture2D(uTexture2,getCoverUV(uv+disp,uTexture2Size)),inside);
    } else {
        finalColor = inside >= 0.99 ? texture2D(uTexture2, getCoverUV(uv, uTexture2Size)) : texture2D(uTexture1, getCoverUV(uv, uTexture1Size));
    }
    return mix(texture2D(uTexture1, getCoverUV(uv, uTexture1Size)), finalColor, smoothstep(0.,1.,progress));
  }
  vec4 glitchEffect(vec2 uv, float progress) {
    float glitchPeak=sin(progress*3.14159);
    float i=uGlitchIntensity*uDistortionStrength*uGlobalIntensity*glitchPeak;
    float blockNoise=rand(floor(uv*uResolution.y/mix(40.,uGlitchBlockSize,uGlitchIntensity))+floor(progress*15.*uGlitchSpeed));
    vec2 offset=vec2(0.); if(blockNoise>.8) offset.x=(rand(uv+10.)-.5)*.2*i;
    vec2 duv=uv+offset;
    float mixTex=clamp(smoothstep(.4,.6,progress)+(rand(uv+floor(progress*30.))-0.5)*i*.5,0.,1.);
    vec4 mixT=mix(texture2D(uTexture1,getCoverUV(duv,uTexture1Size)),texture2D(uTexture2,getCoverUV(duv,uTexture2Size)),mixTex);
    float cs=uGlitchColorShift*i*.05;
    vec4 fc=vec4(texture2D(uTexture2,getCoverUV(duv+vec2(cs,0.),uTexture2Size)).r,mixT.g,texture2D(uTexture1,getCoverUV(duv-vec2(cs,0.),uTexture1Size)).b,1.);
    fc.rgb-=(sin(uv.y*uResolution.y+progress*30.)*.1+(rand(vec2(floor(uv.y*uResolution.y),progress*15.))-.5)*.2)*uGlitchScanlines*i;
    return mix(texture2D(uTexture1,getCoverUV(uv,uTexture1Size)),fc,smoothstep(0.,1.,progress));
  }
  vec4 warpEffect(vec2 uv, float progress) {
    vec2 toCenter=uv-vec2(.5);
    float dist=length(toCenter);
    float phase=smoothstep(0.,1.,1.-abs(progress-.5)*2.);
    float turb=fbm(uv*4.*uWarpTurbulence-progress*8.*uWarpSpeed*.2)*.5;
    float d=pow(1.-smoothstep(0.,uWarpRadius,dist),2.)*uWarpStrength*uDistortionStrength*uGlobalIntensity*phase;
    float angle=atan(toCenter.y,toCenter.x)+d*uWarpTwist+turb*2.;
    vec2 wuv=vec2(.5)+vec2(cos(angle),sin(angle))*dist;
    vec4 wr=mix(texture2D(uTexture1,getCoverUV(wuv,uTexture1Size)),texture2D(uTexture2,getCoverUV(wuv,uTexture2Size)),progress);
    float cs=d*.05*uWarpChromaticAberration;
    wr.r=mix(wr.r,texture2D(uTexture2,getCoverUV(wuv+normalize(toCenter)*cs,uTexture2Size)).r,progress);
    wr.b=mix(wr.b,texture2D(uTexture1,getCoverUV(wuv-normalize(toCenter)*cs,uTexture1Size)).b,1.-progress);
    float pm=smoothstep(progress*(uWarpRadius+.2)-.03*phase,progress*(uWarpRadius+.2),dist);
    vec4 fc=mix(wr,texture2D(uTexture2,getCoverUV(uv,uTexture2Size)),pm);
    float sw=smoothstep(progress*(uWarpRadius+.2),progress*(uWarpRadius+.2)+.005,dist)*smoothstep(progress*(uWarpRadius+.2)+.03*phase+.005,progress*(uWarpRadius+.2)+.03*phase,dist);
    fc.rgb+=sw*vec3(1.,.9,.8)*phase*1.5;
    return mix(texture2D(uTexture1,getCoverUV(uv,uTexture1Size)),fc,smoothstep(0.,1.,progress));
  }

  void main() {
    vec4 effectColor;
    if (uEffectType == 0) effectColor = glassEffect(vUv, uProgress);
    else if (uEffectType == 1) effectColor = frostEffect(vUv, uProgress);
    else if (uEffectType == 2) effectColor = rippleEffect(vUv, uProgress);
    else if (uEffectType == 3) effectColor = plasmaEffect(vUv, uProgress);
    else if (uEffectType == 4) effectColor = timeshiftEffect(vUv, uProgress);
    else if (uEffectType == 5) effectColor = glitchEffect(vUv, uProgress);
    else if (uEffectType == 6) effectColor = warpEffect(vUv, uProgress);
    else effectColor = texture2D(uTexture1, getCoverUV(vUv, uTexture1Size));
    float vignette = 1.0 - smoothstep(0.8, 1.2, length(vUv - 0.5)) * uVignetteStrength * 0.5;
    effectColor.rgb *= vignette;
    effectColor.rgb += (rand(vUv + uProgress) - 0.5) * uGrainIntensity * 0.2;
    gl_FragColor = effectColor;
  }
`;

// --- COMPONENT ---
export function WebGLSlider(props: any) {
    const { ...allProps } = props;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [slideProgress, setSlideProgress] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    const slides = [];
    for (let i = 1; i <= 6; i++) {
        if (props[`media${i}`]) {
            slides.push({ title: props[`title${i}`] || `Slide ${i}`, media: props[`media${i}`] });
        }
    }
    const SLIDER_CONFIG = { settings: { ...allProps } };

    const threeState = useRef<any>({}).current;
    const isTransitioning = useRef(false);
    const sliderEnabled = useRef(false);
    const progressAnimation = useRef<ReturnType<typeof setInterval> | null>(null);
    const autoSlideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const currentSlideIndexRef = useRef(0);
    const startAutoSlideTimerRef = useRef<(() => void) | null>(null);
    const scrollAccumulator = useRef(0);

    const onProgressUpdate = useCallback((progress: number) => {
        setSlideProgress(progress);
    }, []);

    const stopAutoSlideTimer = useCallback(() => {
        if (progressAnimation.current) clearInterval(progressAnimation.current);
        if (autoSlideTimer.current) clearTimeout(autoSlideTimer.current);
        progressAnimation.current = null;
        autoSlideTimer.current = null;
    }, []);

    const navigateToSlide = useCallback((targetIndex: number) => {
        if (isTransitioning.current || targetIndex === currentSlideIndexRef.current || !threeState.shaderMaterial) return;
        stopAutoSlideTimer();
        onProgressUpdate(0);
        const currentTexture = threeState.slideTextures[currentSlideIndexRef.current];
        const targetTexture = threeState.slideTextures[targetIndex];
        if (!currentTexture || !targetTexture) return;

        isTransitioning.current = true;
        Object.assign(threeState.shaderMaterial.uniforms, {
            uTexture1: { value: currentTexture },
            uTexture2: { value: targetTexture },
            uTexture1Size: { value: currentTexture.userData.size },
            uTexture2Size: { value: targetTexture.userData.size },
        });
        currentSlideIndexRef.current = targetIndex;
        setCurrentSlideIndex(targetIndex);

        gsap.fromTo(threeState.shaderMaterial.uniforms.uProgress, { value: 0 }, {
            value: 1,
            duration: SLIDER_CONFIG.settings.transitionDuration,
            ease: SLIDER_CONFIG.settings.transitionEase,
            onComplete: () => {
                threeState.shaderMaterial.uniforms.uProgress.value = 0;
                threeState.shaderMaterial.uniforms.uTexture1.value = targetTexture;
                threeState.shaderMaterial.uniforms.uTexture1Size.value = targetTexture.userData.size;
                isTransitioning.current = false;
                if (props.mode === 'auto' && sliderEnabled.current && startAutoSlideTimerRef.current) {
                    startAutoSlideTimerRef.current();
                }
            }
        });
    }, [stopAutoSlideTimer, onProgressUpdate, threeState, SLIDER_CONFIG.settings.transitionDuration, SLIDER_CONFIG.settings.transitionEase, props.mode]);

    const handleSlideChange = useCallback(() => {
        if (isTransitioning.current || !sliderEnabled.current) return;
        navigateToSlide((currentSlideIndexRef.current + 1) % slides.length);
    }, [navigateToSlide, slides.length]);

    const startAutoSlideTimer = useCallback(() => {
        if (props.mode !== 'auto' || !sliderEnabled.current || slides.length < 2) {
            stopAutoSlideTimer();
            return;
        }
        stopAutoSlideTimer();
        let progress = 0;
        const PROGRESS_UPDATE_INTERVAL = 50;
        const increment = (100 / SLIDER_CONFIG.settings.autoSlideSpeed) * PROGRESS_UPDATE_INTERVAL;
        progressAnimation.current = setInterval(() => {
            if (props.mode !== 'auto') {
                stopAutoSlideTimer();
                return;
            }
            progress += increment;
            onProgressUpdate(progress);
            if (progress >= 100) {
                if(progressAnimation.current) clearInterval(progressAnimation.current);
                progressAnimation.current = null;
                onProgressUpdate(0); 
                handleSlideChange();
            }
        }, PROGRESS_UPDATE_INTERVAL);
    }, [props.mode, SLIDER_CONFIG.settings.autoSlideSpeed, slides.length, stopAutoSlideTimer, onProgressUpdate, handleSlideChange]);
    
    useEffect(() => {
        startAutoSlideTimerRef.current = startAutoSlideTimer;
    }, [startAutoSlideTimer]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const checkMobile = () => {
            if(container) setIsMobile(container.offsetWidth <= props.mobileBreakpoint);
        };
        const resizeObserver = new ResizeObserver(checkMobile);
        resizeObserver.observe(container);
        checkMobile();
        return () => {
            if(container) resizeObserver.unobserve(container);
        };
    }, [props.mobileBreakpoint]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || slides.length === 0) return;

        let isMounted = true;

        const getEffectIndex = (effectName: string) => ({ glass: 0, frost: 1, ripple: 2, plasma: 3, timeshift: 4, glitch: 5, warp: 6 }[effectName] || 0);

        const init = async () => {
            threeState.scene = new THREE.Scene();
            threeState.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            threeState.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
            
            const uniforms: { [key: string]: THREE.IUniform } = {
                uTexture1: { value: null }, uTexture2: { value: null }, uProgress: { value: 0.0 },
                uResolution: { value: new THREE.Vector2(1,1) }, uTexture1Size: { value: new THREE.Vector2(1,1) },
                uTexture2Size: { value: new THREE.Vector2(1,1) }, uEffectType: { value: 0 },
            };
            const settings = SLIDER_CONFIG.settings;
            Object.keys(settings).forEach(key => {
                const uniformKey = `u${key.charAt(0).toUpperCase() + key.slice(1)}`;
                if (typeof (settings as any)[key] === 'number') {
                    uniforms[uniformKey] = { value: (settings as any)[key] };
                }
            });
            uniforms.uEffectType.value = getEffectIndex(settings.currentEffect);

            threeState.shaderMaterial = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
            threeState.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), threeState.shaderMaterial));

            threeState.slideTextures = await Promise.all(slides.map(slide => new THREE.TextureLoader().loadAsync(slide.media)));
            threeState.slideTextures.forEach((texture: THREE.Texture) => {
                texture.userData.size = new THREE.Vector2((texture.image as HTMLImageElement).width, (texture.image as HTMLImageElement).height);
            });

            if (!isMounted || threeState.slideTextures.length < 1) return;
            
            threeState.shaderMaterial.uniforms.uTexture1.value = threeState.slideTextures[0];
            threeState.shaderMaterial.uniforms.uTexture1Size.value = threeState.slideTextures[0].userData.size;
            sliderEnabled.current = true;
            startAutoSlideTimer();

            const animate = () => {
                if (!isMounted) return;
                requestAnimationFrame(animate);
                threeState.renderer.render(threeState.scene, threeState.camera);
            };
            animate();
        };

        init();
        
        const parent = canvas.parentElement;
        const handleResize = () => {
             if (threeState.renderer && threeState.shaderMaterial && parent) {
                const { width, height } = parent.getBoundingClientRect();
                threeState.renderer.setSize(width, height);
                threeState.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                threeState.shaderMaterial.uniforms.uResolution.value.set(width, height);
             }
        };
        handleResize();

        const handleKeyDown = (e: KeyboardEvent) => {
            stopAutoSlideTimer();
            onProgressUpdate(0);
            if (e.code === "Space" || e.code === "ArrowRight") { handleSlideChange(); }
            else if (e.code === "ArrowLeft") { navigateToSlide((currentSlideIndexRef.current - 1 + slides.length) % slides.length); }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        if(parent) resizeObserver.observe(parent);
        
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            isMounted = false;
            stopAutoSlideTimer();
            if(parent) resizeObserver.unobserve(parent);
            document.removeEventListener('keydown', handleKeyDown);
            threeState.renderer?.dispose();
        };
    }, [slides.map(s=>s.media).join(',')]);
    
    useEffect(() => {
        const parent = canvasRef.current?.parentElement;
        if (!parent) return;

        const SCROLL_THRESHOLD = 50;
        
        const handleWheel = (e: WheelEvent) => {
            if (isTransitioning.current) return;
            e.preventDefault();
            
            scrollAccumulator.current += e.deltaY;

            if (Math.abs(scrollAccumulator.current) > SCROLL_THRESHOLD) {
                if (scrollAccumulator.current > 0) {
                    handleSlideChange();
                } else {
                    navigateToSlide((currentSlideIndexRef.current - 1 + slides.length) % slides.length);
                }
                scrollAccumulator.current = 0;
            }
        };

        if (props.mode === 'scroll') {
            parent.addEventListener('wheel', handleWheel, { passive: false });
        } else {
            startAutoSlideTimer();
        }

        return () => {
            parent.removeEventListener('wheel', handleWheel);
        };
    }, [props.mode, handleSlideChange, navigateToSlide, startAutoSlideTimer]);

    useEffect(() => {
        if(threeState.shaderMaterial) {
            const settings = SLIDER_CONFIG.settings;
            const getEffectIndex = (effectName: string) => ({ glass: 0, frost: 1, ripple: 2, plasma: 3, timeshift: 4, glitch: 5, warp: 6 }[effectName] || 0);
            Object.keys(settings).forEach(key => {
                const uniformKey = `u${key.charAt(0).toUpperCase() + key.slice(1)}`;
                if (threeState.shaderMaterial.uniforms[uniformKey]) {
                    threeState.shaderMaterial.uniforms[uniformKey].value = (settings as any)[key];
                }
            });
            threeState.shaderMaterial.uniforms.uEffectType.value = getEffectIndex(settings.currentEffect);
        }
    }, [allProps]);

    return (
        <div ref={containerRef} style={styles.body}>
            <main style={styles.sliderWrapper}>
                <canvas ref={canvasRef} style={styles.webglCanvas}></canvas>
                {slides.length > 0 && (
                    <>
                        {props.showSlideNumbers && (
                             <>
                                <span style={{
                                    ...styles.slideNumber,
                                    left: isMobile ? props.mobileNavHorizontalPadding : props.navHorizontalPadding,
                                    fontSize: isMobile ? props.mobileNumberFontSize : props.numberFontSize,
                                }}>
                                    {String(currentSlideIndex + 1).padStart(2, '0')}
                                </span>
                                <span style={{
                                    ...styles.slideTotal,
                                    right: isMobile ? props.mobileNavHorizontalPadding : props.navHorizontalPadding,
                                    fontSize: isMobile ? props.mobileNumberFontSize : props.numberFontSize,
                                }}>
                                    {String(slides.length).padStart(2, '0')}
                                </span>
                            </>
                        )}
                        {props.showNavBar && (
                            <nav style={{
                                ...styles.slidesNavigation,
                                bottom: isMobile ? props.mobileNavVerticalPadding : props.navVerticalPadding,
                                left: isMobile ? props.mobileNavHorizontalPadding : props.navHorizontalPadding,
                                right: isMobile ? props.mobileNavHorizontalPadding : props.navHorizontalPadding,
                            }}>
                                {slides.map((slide, index) => (
                                    <motion.button key={index} data-nav-item="true" style={styles.slideNavItem} onClick={(e) => { e.stopPropagation(); navigateToSlide(index); }}>
                                        <motion.div
                                            style={{
                                                position: 'absolute',
                                                top: 0, left: 0, right: 0, bottom: 0,
                                                backgroundColor: theme.colorText,
                                                zIndex: 0,
                                            }}
                                            initial={{ opacity: 0 }}
                                            whileHover={{ opacity: 0.08 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                        {props.showProgressBars && (
                                            <div style={{...styles.slideProgressLine, position: 'relative', zIndex: 1}}>
                                                <div style={{...styles.slideProgressFill, width: index === currentSlideIndex ? (props.mode === 'auto' ? `${slideProgress}%` : '100%') : '0%'}}></div>
                                            </div>
                                        )}
                                        {props.showNavTitles && (
                                            <div style={{
                                                ...styles.slideNavTitle,
                                                ...(index === currentSlideIndex && styles.slideNavTitleActive),
                                                position: 'relative',
                                                zIndex: 1,
                                                fontSize: isMobile ? props.mobileTitleFontSize : props.titleFontSize,
                                            }}>
                                                {slide.title}
                                            </div>
                                        )}
                                    </motion.button>
                                ))}
                            </nav>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

WebGLSlider.defaultProps = {
    // Media
    media1: "https://assets.codepen.io/7558/orange-portrait-001.jpg", title1: "Ethereal Glow",
    media2: "https://assets.codepen.io/7558/orange-portrait-002.jpg", title2: "Rose Mirage",
    media3: "https://assets.codepen.io/7558/orange-portrait-003.jpg", title3: "Velvet Mystique",
    media4: "https://assets.codepen.io/7558/orange-portrait-004.jpg", title4: "Golden Hour",
    media5: "https://assets.codepen.io/7558/orange-portrait-005.jpg", title5: "Midnight Dreams",
    media6: "https://assets.codepen.io/7558/orange-portrait-006.jpg", title6: "Silver Light",
    
    // UI
    showSlideNumbers: true, showNavBar: true, showProgressBars: true, showNavTitles: true,
    navVerticalPadding: 32, navHorizontalPadding: 32, numberFontSize: 12, titleFontSize: 11,

    // Responsive
    mobileBreakpoint: 600, mobileNavVerticalPadding: 16, mobileNavHorizontalPadding: 16,
    mobileNumberFontSize: 12, mobileTitleFontSize: 10,

    // Behavior & Effects
    ...{
      mode: "auto",
      transitionDuration: 1.8,
      transitionEase: "expo.inOut",
      autoSlideSpeed: 5000,
      currentEffect: "glass",
      globalIntensity: 1.0, speedMultiplier: 1.0, distortionStrength: 1.0,
      colorEnhancement: 1.0, vignetteStrength: 0.3, grainIntensity: 0.1,
      glassRefractionStrength: 1.0, glassChromaticAberration: 1.0, glassBubbleClarity: 1.0,
      glassEdgeGlow: 1.0, glassLiquidFlow: 1.0,
      frostIntensity: 1.5, frostCrystalSize: 1.0, frostIceCoverage: 1.0,
      frostTemperature: 1.0, frostTexture: 1.0,
      rippleFrequency: 25.0, rippleAmplitude: 0.08, rippleWaveSpeed: 1.0,
      rippleRippleCount: 1.0, rippleDecay: 1.0,
      plasmaSpeed: 0.6, plasmaEnergyIntensity: 0.6, plasmaContrastBoost: 0.4, plasmaTurbulence: 1.0,
      timeshiftDistortion: 1.6, timeshiftBlur: 1.5, timeshiftFlow: 1.4,
      timeshiftChromatic: 1.5, timeshiftTurbulence: 1.4,
      glitchBlockSize: 12.0, glitchIntensity: 0.6, glitchScanlines: 0.2,
      glitchColorShift: 0.3, glitchSpeed: 1.0,
      warpStrength: 1.2, warpRadius: 0.6, warpTwist: 1.0, warpTurbulence: 1.5,
      warpChromaticAberration: 1.0, warpSpeed: 1.0,
    }
};

addPropertyControls(WebGLSlider, {
    // Media
    // Fix: Replaced invalid ControlType.Title with ControlType.Boolean as a workaround to create a section title.
    _media_title: { type: ControlType.Boolean, title: "Media", defaultValue: false },
    media1: { type: ControlType.Image, title: "Image 1" }, title1: { type: ControlType.String, title: "Title 1" },
    media2: { type: ControlType.Image, title: "Image 2" }, title2: { type: ControlType.String, title: "Title 2" },
    media3: { type: ControlType.Image, title: "Image 3" }, title3: { type: ControlType.String, title: "Title 3" },
    media4: { type: ControlType.Image, title: "Image 4" }, title4: { type: ControlType.String, title: "Title 4" },
    media5: { type: ControlType.Image, title: "Image 5" }, title5: { type: ControlType.String, title: "Title 5" },
    media6: { type: ControlType.Image, title: "Image 6" }, title6: { type: ControlType.String, title: "Title 6" },
    
    // UI Customization
    // Fix: Replaced invalid ControlType.Title with ControlType.Boolean as a workaround to create a section title.
    _ui_title: { type: ControlType.Boolean, title: "UI Customization", defaultValue: false },
    showSlideNumbers: { type: ControlType.Boolean, title: "Show Numbers", defaultValue: true },
    showNavBar: { type: ControlType.Boolean, title: "Show Nav Bar", defaultValue: true },
    showProgressBars: { type: ControlType.Boolean, title: "Show Progress", defaultValue: true, hidden: (props) => !props.showNavBar },
    showNavTitles: { type: ControlType.Boolean, title: "Show Titles", defaultValue: true, hidden: (props) => !props.showNavBar },
    navVerticalPadding: { type: ControlType.Number, title: "Nav Padding Y", min: 0, max: 100, step: 1, displayStepper: true, defaultValue: 32 },
    navHorizontalPadding: { type: ControlType.Number, title: "Nav Padding X", min: 0, max: 100, step: 1, displayStepper: true, defaultValue: 32 },
    numberFontSize: { type: ControlType.Number, title: "Number Font Size", min: 8, max: 32, step: 1, displayStepper: true, defaultValue: 12 },
    titleFontSize: { type: ControlType.Number, title: "Title Font Size", min: 8, max: 32, step: 1, displayStepper: true, defaultValue: 11 },

    // Responsive
    // Fix: Replaced invalid ControlType.Title with ControlType.Boolean as a workaround to create a section title.
    _responsive_title: { type: ControlType.Boolean, title: "Responsive", defaultValue: false },
    mobileBreakpoint: { type: ControlType.Number, title: "Breakpoint (px)", min: 300, max: 1200, step: 10, defaultValue: 600, displayStepper: true },
    mobileNavVerticalPadding: { type: ControlType.Number, title: "📱 Nav Padding Y", min: 0, max: 100, step: 1, displayStepper: true, defaultValue: 16 },
    mobileNavHorizontalPadding: { type: ControlType.Number, title: "📱 Nav Padding X", min: 0, max: 100, step: 1, displayStepper: true, defaultValue: 16 },
    mobileNumberFontSize: { type: ControlType.Number, title: "📱 Number Font Size", min: 8, max: 32, step: 1, displayStepper: true, defaultValue: 12 },
    mobileTitleFontSize: { type: ControlType.Number, title: "📱 Title Font Size", min: 8, max: 32, step: 1, displayStepper: true, defaultValue: 10 },
    
    // Timing & Behavior
    // Fix: Replaced invalid ControlType.Title with ControlType.Boolean as a workaround to create a section title.
    _behavior_title: { type: ControlType.Boolean, title: "Timing & Behavior", defaultValue: false },
    mode: { type: ControlType.Enum, title: "Mode", options: ["auto", "scroll"] },
    transitionDuration: { type: ControlType.Number, title: "Transition Duration", min: 0.5, max: 5, step: 0.1, displayStepper: true },
    transitionEase: { type: ControlType.Enum, title: "Easing", options: ["none", "power2.inOut", "power3.inOut", "power4.inOut", "expo.inOut", "circ.inOut", "back.inOut"], optionTitles: ["Linear", "P2", "P3", "P4", "Expo", "Circ", "Back"], },
    autoSlideSpeed: { type: ControlType.Number, title: "Auto-Slide Speed", min: 2000, max: 10000, step: 100, displayStepper: true, hidden: (props) => props.mode !== 'auto' },
    
    // Effects
    // Fix: Replaced invalid ControlType.Title with ControlType.Boolean as a workaround to create a section title.
    _effects_title: { type: ControlType.Boolean, title: "Effects", defaultValue: false },
    currentEffect: { type: ControlType.Enum, title: "Effect Type", options: ["glass", "frost", "ripple", "plasma", "timeshift", "glitch", "warp"] },
    globalIntensity: { type: ControlType.Number, title: "Global Intensity", min: 0.1, max: 2, step: 0.1, displayStepper: true },
    speedMultiplier: { type: ControlType.Number, title: "Speed Multiplier", min: 0.1, max: 3, step: 0.1, displayStepper: true },
    distortionStrength: { type: ControlType.Number, title: "Distortion", min: 0.1, max: 3, step: 0.1, displayStepper: true },
    colorEnhancement: { type: ControlType.Number, title: "Color", min: 0.5, max: 2, step: 0.1, displayStepper: true },
    vignetteStrength: { type: ControlType.Number, title: "Vignette", min: 0, max: 1, step: 0.05, displayStepper: true },
    grainIntensity: { type: ControlType.Number, title: "Grain", min: 0, max: 0.5, step: 0.01, displayStepper: true },

    glassRefractionStrength: { type: ControlType.Number, title: "💎 Refraction", min: 0.1, max: 3, step: 0.1, hidden: (props) => props.currentEffect !== 'glass' },
    glassChromaticAberration: { type: ControlType.Number, title: "💎 Chromatic", min: 0.1, max: 3, step: 0.1, hidden: (props) => props.currentEffect !== 'glass' },
    glassBubbleClarity: { type: ControlType.Number, title: "💎 Clarity", min: 0.1, max: 2, step: 0.1, hidden: (props) => props.currentEffect !== 'glass' },
    glassEdgeGlow: { type: ControlType.Number, title: "💎 Edge Glow", min: 0, max: 2, step: 0.1, hidden: (props) => props.currentEffect !== 'glass' },
    glassLiquidFlow: { type: ControlType.Number, title: "💎 Flow", min: 0.1, max: 3, step: 0.1, hidden: (props) => props.currentEffect !== 'glass' },
    
    frostIntensity: { type: ControlType.Number, title: "❄️ Intensity", min: 0.5, max: 3, step: 0.1, hidden: (props) => props.currentEffect !== 'frost' },
    frostCrystalSize: { type: ControlType.Number, title: "❄️ Crystal Size", min: 0.3, max: 2, step: 0.1, hidden: (props) => props.currentEffect !== 'frost' },
    frostIceCoverage: { type: ControlType.Number, title: "❄️ Coverage", min: 0.1, max: 2, step: 0.1, hidden: (props) => props.currentEffect !== 'frost' },
    frostTemperature: { type: ControlType.Number, title: "❄️ Temperature", min: 0.1, max: 3, step: 0.1, hidden: (props) => props.currentEffect !== 'frost' },
    frostTexture: { type: ControlType.Number, title: "❄️ Texture", min: 0.3, max: 2, step: 0.1, hidden: (props) => props.currentEffect !== 'frost' },

    rippleFrequency: { type: ControlType.Number, title: "💧 Frequency", min: 10, max: 50, step: 1, hidden: (props) => props.currentEffect !== 'ripple' },
    rippleAmplitude: { type: ControlType.Number, title: "💧 Amplitude", min: 0.02, max: 0.2, step: 0.01, hidden: (props) => props.currentEffect !== 'ripple' },
    rippleWaveSpeed: { type: ControlType.Number, title: "💧 Speed", min: 0.2, max: 3, step: 0.1, hidden: (props) => props.currentEffect !== 'ripple' },
    rippleRippleCount: { type: ControlType.Number, title: "💧 Count", min: 0.1, max: 2, step: 0.1, hidden: (props) => props.currentEffect !== 'ripple' },
    rippleDecay: { type: ControlType.Number, title: "💧 Decay", min: 0.2, max: 2, step: 0.1, hidden: (props) => props.currentEffect !== 'ripple' },

    plasmaSpeed: { type: ControlType.Number, title: "🔥 Speed", min: 0.2, max: 2.0, step: 0.1, hidden: (props) => props.currentEffect !== 'plasma' },
    plasmaEnergyIntensity: { type: ControlType.Number, title: "🔥 Energy", min: 0.0, max: 1.0, step: 0.05, hidden: (props) => props.currentEffect !== 'plasma' },
    plasmaContrastBoost: { type: ControlType.Number, title: "🔥 Contrast", min: 0.0, max: 1.0, step: 0.05, hidden: (props) => props.currentEffect !== 'plasma' },
    plasmaTurbulence: { type: ControlType.Number, title: "🔥 Turbulence", min: 0.1, max: 3.0, step: 0.1, hidden: (props) => props.currentEffect !== 'plasma' },

    timeshiftDistortion: { type: ControlType.Number, title: "⏳ Distortion", min: 0.3, max: 3, step: 0.1, hidden: (props) => props.currentEffect !== 'timeshift' },
    timeshiftBlur: { type: ControlType.Number, title: "⏳ Blur", min: 0.3, max: 3, step: 0.1, hidden: (props) => props.currentEffect !== 'timeshift' },
    timeshiftFlow: { type: ControlType.Number, title: "⏳ Flow", min: 0.3, max: 3, step: 0.1, hidden: (props) => props.currentEffect !== 'timeshift' },
    timeshiftChromatic: { type: ControlType.Number, title: "⏳ Chromatic", min: 0, max: 3, step: 0.1, hidden: (props) => props.currentEffect !== 'timeshift' },
    timeshiftTurbulence: { type: ControlType.Number, title: "⏳ Turbulence", min: 0.3, max: 3, step: 0.1, hidden: (props) => props.currentEffect !== 'timeshift' },
    
    glitchBlockSize: { type: ControlType.Number, title: "📟 Block Size", min: 2.0, max: 50.0, step: 1.0, hidden: (props) => props.currentEffect !== 'glitch' },
    glitchIntensity: { type: ControlType.Number, title: "📟 Intensity", min: 0.0, max: 2.0, step: 0.05, hidden: (props) => props.currentEffect !== 'glitch' },
    glitchScanlines: { type: ControlType.Number, title: "📟 Scanlines", min: 0.0, max: 1.0, step: 0.05, hidden: (props) => props.currentEffect !== 'glitch' },
    glitchColorShift: { type: ControlType.Number, title: "📟 Color Shift", min: 0.0, max: 1.0, step: 0.05, hidden: (props) => props.currentEffect !== 'glitch' },
    glitchSpeed: { type: ControlType.Number, title: "📟 Speed", min: 0.1, max: 3.0, step: 0.1, hidden: (props) => props.currentEffect !== 'glitch' },

    warpStrength: { type: ControlType.Number, title: "🌀 Strength", min: 0.0, max: 3.0, step: 0.1, hidden: (props) => props.currentEffect !== 'warp' },
    warpRadius: { type: ControlType.Number, title: "🌀 Radius", min: 0.1, max: 1.5, step: 0.05, hidden: (props) => props.currentEffect !== 'warp' },
    warpTwist: { type: ControlType.Number, title: "🌀 Twist", min: -3.0, max: 3.0, step: 0.1, hidden: (props) => props.currentEffect !== 'warp' },
    warpTurbulence: { type: ControlType.Number, title: "🌀 Turbulence", min: 0.0, max: 5.0, step: 0.1, hidden: (props) => props.currentEffect !== 'warp' },
    warpChromaticAberration: { type: ControlType.Number, title: "🌀 Chromatic", min: 0.0, max: 2.0, step: 0.05, hidden: (props) => props.currentEffect !== 'warp' },
    warpSpeed: { type: ControlType.Number, title: "🌀 Speed", min: 0.1, max: 3.0, step: 0.1, hidden: (props) => props.currentEffect !== 'warp' },
});

export default WebGLSlider;
