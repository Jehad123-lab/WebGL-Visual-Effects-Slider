export const SLIDER_CONFIG = {
  settings: {
    mode: "auto",
    transitionDuration: 2.5,
    autoSlideSpeed: 5000,
    currentEffect: "glass",
    currentEffectPreset: "Default",
    globalIntensity: 1.0,
    speedMultiplier: 1.0,
    distortionStrength: 1.0,
    colorEnhancement: 1.0,
    vignetteStrength: 0.3,
    grainIntensity: 0.1,
    glassRefractionStrength: 1.0,
    glassChromaticAberration: 1.0,
    glassBubbleClarity: 1.0,
    glassEdgeGlow: 1.0,
    glassLiquidFlow: 1.0,
    frostIntensity: 1.5,
    frostCrystalSize: 1.0,
    frostIceCoverage: 1.0,
    frostTemperature: 1.0,
    frostTexture: 1.0,
    rippleFrequency: 25.0,
    rippleAmplitude: 0.08,
    rippleWaveSpeed: 1.0,
    rippleRippleCount: 1.0,
    rippleDecay: 1.0,
    plasmaSpeed: 0.6,
    plasmaEnergyIntensity: 0.6,
    plasmaContrastBoost: 0.4,
    plasmaTurbulence: 1.0,
    timeshiftDistortion: 1.6,
    timeshiftBlur: 1.5,
    timeshiftFlow: 1.4,
    timeshiftChromatic: 1.5,
    timeshiftTurbulence: 1.4,
    glitchBlockSize: 12.0,
    glitchIntensity: 0.6,
    glitchScanlines: 0.2,
    glitchColorShift: 0.3,
    glitchSpeed: 1.0,
    warpStrength: 1.2,
    warpRadius: 0.6,
    warpTwist: 1.0,
    warpTurbulence: 1.5,
    warpChromaticAberration: 1.0,
    warpSpeed: 1.0,
  },
  effectPresets: {
    glass: {
      Subtle: {
        glassRefractionStrength: 0.6,
        glassChromaticAberration: 0.5,
        glassBubbleClarity: 1.3,
        glassEdgeGlow: 0.7,
        glassLiquidFlow: 0.8
      },
      Default: {
        glassRefractionStrength: 1.0,
        glassChromaticAberration: 1.0,
        glassBubbleClarity: 1.0,
        glassEdgeGlow: 1.0,
        glassLiquidFlow: 1.0
      },
      Crystal: {
        glassRefractionStrength: 1.5,
        glassChromaticAberration: 1.8,
        glassBubbleClarity: 0.7,
        glassEdgeGlow: 1.4,
        glassLiquidFlow: 0.5
      },
      Liquid: {
        glassRefractionStrength: 0.8,
        glassChromaticAberration: 0.4,
        glassBubbleClarity: 1.2,
        glassEdgeGlow: 0.8,
        glassLiquidFlow: 1.8
      }
    },
    frost: {
      Light: {
        frostIntensity: 0.8,
        frostCrystalSize: 1.3,
        frostIceCoverage: 0.6,
        frostTemperature: 0.7,
        frostTexture: 0.8
      },
      Default: {
        frostIntensity: 1.5,
        frostCrystalSize: 1.0,
        frostIceCoverage: 1.0,
        frostTemperature: 1.0,
        frostTexture: 1.0
      },
      Heavy: {
        frostIntensity: 2.2,
        frostCrystalSize: 0.7,
        frostIceCoverage: 1.4,
        frostTemperature: 1.5,
        frostTexture: 1.3
      },
      Arctic: {
        frostIntensity: 2.8,
        frostCrystalSize: 0.5,
        frostIceCoverage: 1.8,
        frostTemperature: 2.0,
        frostTexture: 1.6
      }
    },
    ripple: {
      Gentle: {
        rippleFrequency: 15.0,
        rippleAmplitude: 0.05,
        rippleWaveSpeed: 0.7,
        rippleRippleCount: 0.8,
        rippleDecay: 1.2
      },
      Default: {
        rippleFrequency: 25.0,
        rippleAmplitude: 0.08,
        rippleWaveSpeed: 1.0,
        rippleRippleCount: 1.0,
        rippleDecay: 1.0
      },
      Strong: {
        rippleFrequency: 35.0,
        rippleAmplitude: 0.12,
        rippleWaveSpeed: 1.4,
        rippleRippleCount: 1.3,
        rippleDecay: 0.8
      },
      Tsunami: {
        rippleFrequency: 45.0,
        rippleAmplitude: 0.18,
        rippleWaveSpeed: 1.8,
        rippleRippleCount: 1.6,
        rippleDecay: 0.6
      }
    },
    plasma: {
      Nebula: {
        plasmaSpeed: 0.3,
        plasmaEnergyIntensity: 0.8,
        plasmaContrastBoost: 0.2,
        plasmaTurbulence: 0.6
      },
      Default: {
        plasmaSpeed: 0.6,
        plasmaEnergyIntensity: 0.6,
        plasmaContrastBoost: 0.4,
        plasmaTurbulence: 1.0
      },
      Caustic: {
        plasmaSpeed: 1.2,
        plasmaEnergyIntensity: 0.4,
        plasmaContrastBoost: 0.6,
        plasmaTurbulence: 1.8
      },
      Supernova: {
        plasmaSpeed: 0.8,
        plasmaEnergyIntensity: 1.0,
        plasmaContrastBoost: 0.8,
        plasmaTurbulence: 1.2
      }
    },
    timeshift: {
      Subtle: {
        timeshiftDistortion: 0.5,
        timeshiftBlur: 0.6,
        timeshiftFlow: 0.5,
        timeshiftChromatic: 0.4,
        timeshiftTurbulence: 0.6
      },
      Default: {
        timeshiftDistortion: 1.6,
        timeshiftBlur: 1.5,
        timeshiftFlow: 1.4,
        timeshiftChromatic: 1.5,
        timeshiftTurbulence: 1.4
      },
      Intense: {
        timeshiftDistortion: 2.2,
        timeshiftBlur: 2.0,
        timeshiftFlow: 2.0,
        timeshiftChromatic: 2.2,
        timeshiftTurbulence: 2.0
      },
      Dreamlike: {
        timeshiftDistortion: 2.8,
        timeshiftBlur: 2.5,
        timeshiftFlow: 2.5,
        timeshiftChromatic: 2.6,
        timeshiftTurbulence: 2.5
      }
    },
    glitch: {
        Subtle: {
            glitchBlockSize: 24.0,
            glitchIntensity: 0.3,
            glitchScanlines: 0.1,
            glitchColorShift: 0.1,
            glitchSpeed: 0.6,
        },
        Default: {
            glitchBlockSize: 12.0,
            glitchIntensity: 0.6,
            glitchScanlines: 0.2,
            glitchColorShift: 0.3,
            glitchSpeed: 1.0,
        },
        Corrupted: {
            glitchBlockSize: 4.0,
            glitchIntensity: 1.5,
            glitchScanlines: 0.8,
            glitchColorShift: 0.9,
            glitchSpeed: 1.5,
        },
        Cyberpunk: {
            glitchBlockSize: 12.0,
            glitchIntensity: 1.2,
            glitchScanlines: 0.5,
            glitchColorShift: 1.2,
            glitchSpeed: 0.8,
        }
    },
    warp: {
        Gentle: {
            warpStrength: 0.6,
            warpRadius: 0.8,
            warpTwist: 0.5,
            warpTurbulence: 0.8,
            warpChromaticAberration: 0.4,
            warpSpeed: 0.7,
        },
        Default: {
            warpStrength: 1.2,
            warpRadius: 0.6,
            warpTwist: 1.0,
            warpTurbulence: 1.5,
            warpChromaticAberration: 1.0,
            warpSpeed: 1.0,
        },
        Vortex: {
            warpStrength: 2.0,
            warpRadius: 0.4,
            warpTwist: 1.8,
            warpTurbulence: 2.5,
            warpChromaticAberration: 1.5,
            warpSpeed: 1.4,
        },
        BlackHole: {
            warpStrength: 3.0,
            warpRadius: 0.3,
            warpTwist: -2.5,
            warpTurbulence: 3.0,
            warpChromaticAberration: 2.0,
            warpSpeed: 0.8,
        }
    }
  }
};