export const fragmentShader = `
  uniform sampler2D uTexture1;
  uniform sampler2D uTexture2;
  uniform float uProgress;
  uniform vec2 uResolution;
  uniform vec2 uTexture1Size;
  uniform vec2 uTexture2Size;
  uniform int uEffectType;
  
  // Global settings uniforms
  uniform float uGlobalIntensity;
  uniform float uSpeedMultiplier;
  uniform float uDistortionStrength;
  uniform float uColorEnhancement;
  uniform float uVignetteStrength;
  uniform float uGrainIntensity;
  
  // Glass uniforms
  uniform float uGlassRefractionStrength;
  uniform float uGlassChromaticAberration;
  uniform float uGlassBubbleClarity;
  uniform float uGlassEdgeGlow;
  uniform float uGlassLiquidFlow;
  
  // Frost uniforms
  uniform float uFrostIntensity;
  uniform float uFrostCrystalSize;
  uniform float uFrostIceCoverage;
  uniform float uFrostTemperature;
  uniform float uFrostTexture;
  
  // Ripple uniforms
  uniform float uRippleFrequency;
  uniform float uRippleAmplitude;
  uniform float uRippleWaveSpeed;
  uniform float uRippleRippleCount;
  uniform float uRippleDecay;
  
  // Plasma uniforms
  uniform float uPlasmaSpeed;
  uniform float uPlasmaEnergyIntensity;
  uniform float uPlasmaContrastBoost;
  uniform float uPlasmaTurbulence;
  
  // Timeshift uniforms
  uniform float uTimeshiftDistortion;
  uniform float uTimeshiftBlur;
  uniform float uTimeshiftFlow;
  uniform float uTimeshiftChromatic;
  uniform float uTimeshiftTurbulence;

  // Glitch uniforms
  uniform float uGlitchBlockSize;
  uniform float uGlitchIntensity;
  uniform float uGlitchScanlines;
  uniform float uGlitchColorShift;
  uniform float uGlitchSpeed;

  // Warp uniforms
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
    
    return mix(
      mix(noise(i), noise(i + vec2(1.0, 0.0)), f.x),
      mix(noise(i + vec2(0.0, 1.0)), noise(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  mat2 rotate2d(float angle){
    return mat2(cos(angle),-sin(angle),
                sin(angle),cos(angle));
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;
    for (int i = 0; i < 6; i++) {
        value += amplitude * smoothNoise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
  }


  float rand(vec2 uv) {
    float a = dot(uv, vec2(92., 80.));
    float b = dot(uv, vec2(41., 62.));
    float x = sin(a) + cos(b) * 51.;
    return fract(x);
  }

  vec4 glassEffect(vec2 uv, float progress) {
    float glassStrength = 0.08 * uGlassRefractionStrength * uDistortionStrength * uGlobalIntensity;
    float chromaticAberration = 0.02 * uGlassChromaticAberration * uGlobalIntensity;
    float waveDistortion = 0.025 * uDistortionStrength;
    float clearCenterSize = 0.3 * uGlassBubbleClarity;
    float surfaceRipples = 0.004 * uDistortionStrength;
    float liquidFlow = 0.015 * uGlassLiquidFlow * uSpeedMultiplier;
    float rimLightWidth = 0.05;
    float glassEdgeWidth = 0.025;
    
    float brightnessPhase = smoothstep(0.8, 1.0, progress);
    float rimLightIntensity = 0.08 * (1.0 - brightnessPhase) * uGlassEdgeGlow * uGlobalIntensity;
    float glassEdgeOpacity = 0.06 * (1.0 - brightnessPhase) * uGlassEdgeGlow;

    vec2 center = vec2(0.5, 0.5);
    vec2 p = uv * uResolution;
    
    vec2 uv1 = getCoverUV(uv, uTexture1Size);
    vec2 uv2_base = getCoverUV(uv, uTexture2Size);
    
    float maxRadius = length(uResolution) * 0.85;
    float bubbleRadius = progress * maxRadius;
    vec2 sphereCenter = center * uResolution;
    
    float dist = length(p - sphereCenter);
    float normalizedDist = dist / max(bubbleRadius, 0.001);
    vec2 direction = (dist > 0.0) ? (p - sphereCenter) / dist : vec2(0.0);
    float inside = smoothstep(bubbleRadius + 3.0, bubbleRadius - 3.0, dist);
    
    float distanceFactor = smoothstep(clearCenterSize, 1.0, normalizedDist);
    float time = progress * 5.0 * uSpeedMultiplier;
    
    vec2 liquidSurface = vec2(
      smoothNoise(uv * 100.0 + time * 0.3),
      smoothNoise(uv * 100.0 + time * 0.2 + 50.0)
    ) - 0.5;
    liquidSurface *= surfaceRipples * distanceFactor;

    vec2 distortedUV = uv2_base;
    if (inside > 0.0) {
      float refractionOffset = glassStrength * pow(distanceFactor, 1.5);
      vec2 flowDirection = normalize(direction + vec2(sin(time), cos(time * 0.7)) * 0.3);
      distortedUV -= flowDirection * refractionOffset;

      float wave1 = sin(normalizedDist * 22.0 - time * 3.5);
      float wave2 = sin(normalizedDist * 35.0 + time * 2.8) * 0.7;
      float wave3 = sin(normalizedDist * 50.0 - time * 4.2) * 0.5;
      float combinedWave = (wave1 + wave2 + wave3) / 3.0;
      
      float waveOffset = combinedWave * waveDistortion * distanceFactor;
      distortedUV -= direction * waveOffset + liquidSurface;

      vec2 flowOffset = vec2(
        sin(time + normalizedDist * 10.0),
        cos(time * 0.8 + normalizedDist * 8.0)
      ) * liquidFlow * distanceFactor * inside;
      distortedUV += flowOffset;
    }

    vec4 newImg;
    if (inside > 0.0) {
      float aberrationOffset = chromaticAberration * pow(distanceFactor, 1.2);
      
      vec2 uv_r = distortedUV + direction * aberrationOffset * 1.2;
      vec2 uv_g = distortedUV + direction * aberrationOffset * 0.2;
      vec2 uv_b = distortedUV - direction * aberrationOffset * 0.8;

      float r = texture2D(uTexture2, uv_r).r;
      float g = texture2D(uTexture2, uv_g).g;
      float b = texture2D(uTexture2, uv_b).b;
      newImg = vec4(r, g, b, 1.0);
    } else {
      newImg = texture2D(uTexture2, uv2_base);
    }

    if (inside > 0.0 && rimLightIntensity > 0.0) {
      float rim = smoothstep(1.0 - rimLightWidth, 1.0, normalizedDist) *
                  (1.0 - smoothstep(1.0, 1.01, normalizedDist));
      newImg.rgb += rim * rimLightIntensity;

      float edge = smoothstep(1.0 - glassEdgeWidth, 1.0, normalizedDist) *
                   (1.0 - smoothstep(1.0, 1.01, normalizedDist));
      newImg.rgb = mix(newImg.rgb, vec3(1.0), edge * glassEdgeOpacity);
    }
    
    newImg.rgb = mix(newImg.rgb, newImg.rgb * 1.2, (uColorEnhancement - 1.0) * 0.5);
    
    vec4 currentImg = texture2D(uTexture1, uv1);
    
    if (progress > 0.95) {
      vec4 pureNewImg = texture2D(uTexture2, uv2_base);
      float endTransition = (progress - 0.95) / 0.05;
      newImg = mix(newImg, pureNewImg, endTransition);
    }
    
    return mix(currentImg, newImg, inside);
  }

  vec4 frostEffect(vec2 uv, float progress) {
    vec4 currentImg = texture2D(uTexture1, getCoverUV(uv, uTexture1Size));
    vec4 newImg = texture2D(uTexture2, getCoverUV(uv, uTexture2Size));
    
    float effectiveIntensity = uFrostIntensity * uGlobalIntensity;
    float crystalScale = 80.0 / uFrostCrystalSize;
    float iceScale = 40.0 / uFrostCrystalSize;
    float temperatureEffect = uFrostTemperature;
    
    float frost1 = smoothNoise(uv * crystalScale * uFrostTexture);
    float frost2 = smoothNoise(uv * iceScale + 50.0) * 0.7;
    float frost3 = smoothNoise(uv * (crystalScale * 2.0) + 100.0) * 0.3;
    float frost = (frost1 + frost2 + frost3) / 2.0;
    
    float icespread = smoothNoise(uv * 25.0 / uFrostCrystalSize + 200.0);
    
    vec2 rnd = vec2(
      rand(uv + frost * 0.1), 
      rand(uv + frost * 0.1 + 0.5)
    );
    
    float clampedIceCoverage = clamp(uFrostIceCoverage, 0.1, 2.5);
    float size = mix(progress, sqrt(progress), 0.5) * 1.12 * clampedIceCoverage + 0.0000001;
    
    float lensY = clamp(pow(size, clamp(4.0, 1.5, 6.0)) / 2.0, size * 0.1, size * 8.0);
    vec2 lens = vec2(size, lensY);
    
    float dist = distance(uv, vec2(0.5, 0.5));
    float vignette = pow(1.0 - smoothstep(lens.x, lens.y, dist), 2.0);
    
    float frostyness = 0.8 * effectiveIntensity * uDistortionStrength;
    rnd *= frost * vignette * frostyness * (1.0 - floor(vignette));
    
    vec4 regular = newImg;
    vec4 frozen = texture2D(uTexture2, getCoverUV(uv + rnd * 0.06, uTexture2Size));
    
    float tempShift = clamp(temperatureEffect * 0.15, 0.0, 0.3);
    frozen *= vec4(
      clamp(0.85 + tempShift, 0.7, 1.2),
      clamp(0.9, 0.8, 1.0),
      clamp(1.2 - tempShift, 0.8, 1.3),
      1.0
    );
    float tempMixStrength = clamp(0.1 * temperatureEffect, 0.0, 0.25);
    frozen = mix(frozen, vec4(0.9, 0.95, 1.1, 1.0), tempMixStrength);
    
    float frostMask = smoothstep(icespread * 0.8, 1.0, pow(vignette, 1.5));
    vec4 frostResult = mix(frozen, regular, frostMask);
    
    float transitionStart = mix(0.85, 0.7, clamp(effectiveIntensity - 1.0, 0.0, 1.0));
    float colorTransition = smoothstep(transitionStart, 1.0, progress);
    vec4 finalFrost = mix(frostResult, regular, colorTransition);
    
    finalFrost.rgb = mix(finalFrost.rgb, finalFrost.rgb * 1.2, (uColorEnhancement - 1.0) * 0.5);
    
    float overallBlend = smoothstep(0.0, 1.0, progress);
    
    if (progress > 0.95) {
      float endTransition = (progress - 0.95) / 0.05;
      finalFrost = mix(finalFrost, newImg, endTransition * 0.5);
    }
    
    return mix(currentImg, finalFrost, overallBlend);
  }

  vec4 rippleEffect(vec2 uv, float progress) {
    vec4 currentImg = texture2D(uTexture1, getCoverUV(uv, uTexture1Size));
    vec4 newImg = texture2D(uTexture2, getCoverUV(uv, uTexture2Size));
    
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(uv, center);
    float maxDist = 0.8;
    
    float effectiveSpeed = uRippleWaveSpeed * uSpeedMultiplier;
    float effectiveAmplitude = uRippleAmplitude * uDistortionStrength * uGlobalIntensity;
    float effectiveDecay = uRippleDecay;
    
    float waveRadius = progress * maxDist * 1.5 * effectiveSpeed;
    
    float ripple1 = sin((dist - waveRadius) * uRippleFrequency) * exp(-abs(dist - waveRadius) * 8.0 * effectiveDecay);
    float ripple2 = sin((dist - waveRadius * 0.7) * uRippleFrequency * 1.3) * 
                   exp(-abs(dist - waveRadius * 0.7) * 6.0 * effectiveDecay) * 0.6 * uRippleRippleCount;
    float ripple3 = sin((dist - waveRadius * 0.4) * uRippleFrequency * 1.8) * 
                   exp(-abs(dist - waveRadius * 0.4) * 4.0 * effectiveDecay) * 0.3 * uRippleRippleCount;
    
    float combinedRipple = (ripple1 + ripple2 + ripple3) * effectiveAmplitude;
    
    vec2 normal = normalize(uv - center);
    vec2 distortedUV = getCoverUV(uv + normal * combinedRipple, uTexture2Size);
    
    vec4 distortedImg = texture2D(uTexture2, distortedUV);
    
    float fadeEdge = smoothstep(maxDist, maxDist * 0.9, dist);
    vec4 rippleResult = mix(newImg, distortedImg, fadeEdge);
    
    float mask = smoothstep(0.0, 0.3, progress) * (1.0 - smoothstep(0.7, 1.0, progress));
    rippleResult = mix(newImg, rippleResult, mask);
    
    rippleResult.rgb = mix(rippleResult.rgb, rippleResult.rgb * 1.2, (uColorEnhancement - 1.0) * 0.5);
    
    float transition = smoothstep(0.0, 1.0, progress);
    return mix(currentImg, rippleResult, transition);
  }

  vec3 plasmaColor(float intensity) {
      vec3 color1 = vec3(0.1, 0.0, 0.4); // Deep Blue/Purple
      vec3 color2 = vec3(1.0, 0.2, 0.5); // Magenta
      vec3 color3 = vec3(1.0, 0.9, 0.3); // Bright Yellow
      
      float t = smoothstep(0.0, 1.0, intensity);
      
      vec3 color = mix(color1, color2, smoothstep(0.0, 0.6, t));
      color = mix(color, color3, smoothstep(0.5, 1.0, t));
      
      return color;
  }

  vec4 plasmaEffect(vec2 uv, float progress) {
      vec4 currentImg = texture2D(uTexture1, getCoverUV(uv, uTexture1Size));
      vec4 newImg = texture2D(uTexture2, getCoverUV(uv, uTexture2Size));
      
      float time = progress * 6.0 * uPlasmaSpeed * uSpeedMultiplier;
      float transitionPhase = 1.0 - abs(progress - 0.5) * 2.0; // Peaks at 0.5
      transitionPhase = smoothstep(0.0, 1.0, transitionPhase);

      vec2 p = uv * 2.0;
      p = rotate2d(time * 0.1) * p;
      float fbmNoise = fbm(p * uPlasmaTurbulence + time * 0.1);
      
      float intensity = sin(fbmNoise * 8.0 + time) * 0.5 + 0.5;
      intensity = pow(intensity, 2.0);
      
      float distortionStrength = intensity * 0.03 * uDistortionStrength * uGlobalIntensity * transitionPhase;
      vec2 q = uv + time * 0.05;
      vec2 distortion = vec2(
          fbm(q * 4.0 * uPlasmaTurbulence) - 0.5,
          fbm(q * 4.0 * uPlasmaTurbulence + 5.2) - 0.5
      ) * distortionStrength;

      vec2 distortedUV1 = getCoverUV(uv + distortion, uTexture1Size);
      vec2 distortedUV2 = getCoverUV(uv - distortion, uTexture2Size);
      
      vec4 distortedOld = texture2D(uTexture1, distortedUV1);
      vec4 distortedNew = texture2D(uTexture2, distortedUV2);

      vec4 mixedImg = mix(distortedOld, distortedNew, progress);
      
      float glow = pow(intensity, 3.0) * uPlasmaEnergyIntensity * transitionPhase * 2.0;
      vec3 finalColor = mixedImg.rgb + plasmaColor(intensity) * glow;
      
      finalColor = (finalColor - 0.5) * (1.0 + uPlasmaContrastBoost * intensity * transitionPhase) + 0.5;

      finalColor = mix(finalColor, finalColor * 1.2, (uColorEnhancement - 1.0) * 0.5);

      vec4 plasmaResult = vec4(finalColor, 1.0);

      if (progress > 0.85) {
        float endFade = (progress - 0.85) / 0.15;
        plasmaResult = mix(plasmaResult, newImg, endFade);
      }
      
      return mix(currentImg, plasmaResult, smoothstep(0.0, 1.0, progress));
  }

  vec4 timeshiftEffect(vec2 uv, float progress) {
    vec2 uv1 = getCoverUV(uv, uTexture1Size);
    vec2 uv2_base = getCoverUV(uv, uTexture2Size);
    vec4 currentImg = texture2D(uTexture1, uv1);
    vec4 newImg = texture2D(uTexture2, uv2_base);
    
    float effectiveDistortion = uTimeshiftDistortion * uDistortionStrength * uGlobalIntensity;
    float effectiveBlur = uTimeshiftBlur * uGlobalIntensity;
    float effectiveFlow = uTimeshiftFlow * uSpeedMultiplier;
    float effectiveChromatic = uTimeshiftChromatic * uGlobalIntensity;
    float effectiveTurbulence = uTimeshiftTurbulence;
    
    vec2 center = vec2(0.5, 0.5);
    vec2 p = uv * uResolution;
    vec2 sphereCenter = center * uResolution;
    
    float maxRadius = length(uResolution) * 0.85;
    float circleRadius = progress * maxRadius;
    
    float dist = length(p - sphereCenter);
    float normalizedDist = dist / max(circleRadius, 0.001);
    
    float boundaryWidth = 0.2 * effectiveBlur;
    float inside = smoothstep(circleRadius + circleRadius * boundaryWidth, 
                             circleRadius - circleRadius * boundaryWidth, dist);
    
    vec4 finalColor = newImg;
    
    if (inside > 0.01 && inside < 0.99) {
      vec2 fromCenter = uv - center;
      float radius = length(fromCenter);
      vec2 direction = radius > 0.0 ? fromCenter / radius : vec2(0.0);
      
      float boundaryStrength = smoothstep(0.0, 0.3, inside) * smoothstep(1.0, 0.7, inside);
      
      float time = progress * 6.28 * effectiveFlow;
      
      float turb1 = smoothNoise(uv * 12.0 * effectiveTurbulence + time * 0.4);
      float turb2 = smoothNoise(uv * 20.0 * effectiveTurbulence - time * 0.5);
      float turb3 = smoothNoise(uv * 35.0 * effectiveTurbulence + time * 0.7);
      float turb4 = smoothNoise(uv * 55.0 * effectiveTurbulence - time * 0.4);
      
      vec2 turbulence = vec2(
        (turb1 - 0.5) * 1.2 + (turb2 - 0.5) * 0.8 + (turb3 - 0.5) * 0.4,
        (turb2 - 0.5) * 1.2 + (turb3 - 0.5) * 0.8 + (turb4 - 0.5) * 0.4
      );
      
      float displacementStrength = 0.18 * effectiveDistortion * boundaryStrength;
      vec2 displacement = turbulence * displacementStrength;
      
      float radialPull = sin(normalizedDist * 12.0 - time * 2.5) * 0.05 * effectiveDistortion;
      displacement += direction * radialPull * boundaryStrength;
      
      vec2 perpendicular = vec2(-direction.y, direction.x);
      float swirl = sin(time * 2.5 + normalizedDist * 10.0) * 0.06 * effectiveFlow;
      displacement += perpendicular * swirl * boundaryStrength;
      
      vec2 distortedUV1 = getCoverUV(uv + displacement, uTexture1Size);
      vec2 distortedUV2 = getCoverUV(uv + displacement, uTexture2Size);
      
      vec4 distortedOld = texture2D(uTexture1, distortedUV1);
      vec4 distortedNew = texture2D(uTexture2, distortedUV2);
      
      if (effectiveChromatic > 0.01) {
        float chromaticStr = boundaryStrength * 0.03 * effectiveChromatic;
        
        vec2 uv1_r = getCoverUV(uv + displacement + direction * chromaticStr * 2.0, uTexture1Size);
        vec2 uv1_b = getCoverUV(uv + displacement - direction * chromaticStr * 1.2, uTexture1Size);
        distortedOld = vec4(
          texture2D(uTexture1, uv1_r).r,
          distortedOld.g,
          texture2D(uTexture1, uv1_b).b,
          1.0
        );
        
        vec2 uv2_r = getCoverUV(uv + displacement + direction * chromaticStr * 2.0, uTexture2Size);
        vec2 uv2_b = getCoverUV(uv + displacement - direction * chromaticStr * 1.2, uTexture2Size);
        distortedNew = vec4(
          texture2D(uTexture2, uv2_r).r,
          distortedNew.g,
          texture2D(uTexture2, uv2_b).b,
          1.0
        );
      }
      
      finalColor = mix(distortedOld, distortedNew, inside);
      
      if (effectiveBlur > 0.5) {
        vec4 blurSample1 = texture2D(uTexture2, getCoverUV(uv + displacement + turbulence * 0.015, uTexture2Size));
        vec4 blurSample2 = texture2D(uTexture2, getCoverUV(uv + displacement - turbulence * 0.015, uTexture2Size));
        vec4 blurSample3 = texture2D(uTexture1, getCoverUV(uv + displacement + vec2(turbulence.y, -turbulence.x) * 0.015, uTexture1Size));
        
        float blurAmount = boundaryStrength * effectiveBlur * 0.6;
        finalColor = mix(finalColor, (finalColor + blurSample1 + blurSample2 + blurSample3) * 0.25, blurAmount);
      }
      
    } else if (inside >= 0.99) {
      finalColor = newImg;
    } else {
      finalColor = currentImg;
    }
    
    finalColor.rgb = mix(finalColor.rgb, finalColor.rgb * 1.2, (uColorEnhancement - 1.0) * 0.5);
    
    if (progress > 0.95) {
      float endTransition = (progress - 0.95) / 0.05;
      finalColor = mix(finalColor, newImg, endTransition);
    }
    
    return mix(currentImg, finalColor, smoothstep(0.0, 1.0, progress));
  }

  vec4 glitchEffect(vec2 uv, float progress) {
    vec4 currentImg = texture2D(uTexture1, getCoverUV(uv, uTexture1Size));
    vec4 newImg = texture2D(uTexture2, getCoverUV(uv, uTexture2Size));

    float time = progress * 15.0 * uGlitchSpeed * uSpeedMultiplier;
    
    float glitchPeak = sin(progress * 3.14159);
    float effectiveIntensity = uGlitchIntensity * uDistortionStrength * uGlobalIntensity * glitchPeak;

    float randomVal = rand(vec2(floor(time), 2.0));
    float hOffset = (randomVal - 0.5) * 0.1 * effectiveIntensity;
    
    float blockSize = mix(40.0, uGlitchBlockSize, uGlitchIntensity) / uResolution.y;
    vec2 blockUV = floor(uv / blockSize) * blockSize;
    float blockNoise = rand(blockUV + floor(time));
    vec2 blockOffset = vec2(0.0);
    if (blockNoise > 0.8) {
      blockOffset.x = (rand(blockUV + 10.0) - 0.5) * 0.2 * effectiveIntensity;
    }

    vec2 distortedUV = uv + vec2(hOffset, 0.0) + blockOffset;

    float textureMix = smoothstep(0.4, 0.6, progress);
    textureMix += (rand(uv + floor(time * 2.0)) - 0.5) * effectiveIntensity * 0.5;
    textureMix = clamp(textureMix, 0.0, 1.0);

    vec4 source1 = texture2D(uTexture1, getCoverUV(distortedUV, uTexture1Size));
    vec4 source2 = texture2D(uTexture2, getCoverUV(distortedUV, uTexture2Size));
    vec4 mixedTexture = mix(source1, source2, textureMix);

    float colorShift = uGlitchColorShift * effectiveIntensity * 0.05;
    float r = texture2D(uTexture2, getCoverUV(distortedUV + vec2(colorShift, 0.0), uTexture2Size)).r;
    float b = texture2D(uTexture1, getCoverUV(distortedUV - vec2(colorShift, 0.0), uTexture1Size)).b;
    vec4 finalColor = vec4(r, mixedTexture.g, b, 1.0);
    
    float scanlineY = uv.y * uResolution.y;
    float scanlineStrength = sin(scanlineY + time * 2.0) * 0.1 + (rand(vec2(floor(scanlineY), time)) - 0.5) * 0.2;
    float scanlineEffect = scanlineStrength * uGlitchScanlines * effectiveIntensity;
    finalColor.rgb -= scanlineEffect;

    float overallProgress = smoothstep(0.0, 1.0, progress);
    vec4 result = mix(currentImg, finalColor, overallProgress);
    
    if (progress > 0.95) {
        result = mix(result, newImg, (progress - 0.95) / 0.05);
    }
    
    finalColor.rgb = mix(finalColor.rgb, finalColor.rgb * 1.2, (uColorEnhancement - 1.0) * 0.5);

    return result;
  }

  vec4 warpEffect(vec2 uv, float progress) {
    vec4 currentImg = texture2D(uTexture1, getCoverUV(uv, uTexture1Size));
    vec4 newImg = texture2D(uTexture2, getCoverUV(uv, uTexture2Size));

    vec2 center = vec2(0.5, 0.5);
    vec2 toCenter = uv - center;
    float dist = length(toCenter);
    float time = progress * 8.0 * uWarpSpeed * uSpeedMultiplier;

    float warpPhase = 1.0 - abs(progress - 0.5) * 2.0;
    warpPhase = smoothstep(0.0, 1.0, warpPhase);

    float effectiveStrength = uWarpStrength * uDistortionStrength * uGlobalIntensity * warpPhase;
    float effectiveTwist = uWarpTwist * warpPhase;

    float turbulence = fbm(uv * 4.0 * uWarpTurbulence - time * 0.2) * 0.5;
    
    float distortion = pow(1.0 - smoothstep(0.0, uWarpRadius, dist), 2.0) * effectiveStrength;
    
    float angle = atan(toCenter.y, toCenter.x);
    angle += distortion * effectiveTwist + turbulence * 2.0;
    
    vec2 warpedUV = center + vec2(cos(angle), sin(angle)) * dist;

    // Unified warp field
    vec4 warpedOld = texture2D(uTexture1, getCoverUV(warpedUV, uTexture1Size));
    vec4 warpedNew = texture2D(uTexture2, getCoverUV(warpedUV, uTexture2Size));
    vec4 warpedResult = mix(warpedOld, warpedNew, progress);
    
    // Chromatic Aberration
    float chromaticStrength = distortion * 0.05 * uWarpChromaticAberration;
    vec2 toCenterWarped = warpedUV - center;
    vec2 radialDir = normalize(toCenterWarped);
    float r = texture2D(uTexture2, getCoverUV(warpedUV + radialDir * chromaticStrength, uTexture2Size)).r;
    float b = texture2D(uTexture1, getCoverUV(warpedUV - radialDir * chromaticStrength, uTexture1Size)).b;
    warpedResult.r = mix(warpedResult.r, r, progress);
    warpedResult.b = mix(warpedResult.b, b, 1.0 - progress);

    // Glowing portal reveal
    float portalRadius = progress * (uWarpRadius + 0.2);
    float portalEdgeWidth = 0.03 * warpPhase;
    float portalMask = smoothstep(portalRadius - portalEdgeWidth, portalRadius, dist);
    
    vec4 finalColor = mix(warpedResult, newImg, portalMask);
    
    // Shockwave / Glow
    float shockwave = smoothstep(portalRadius, portalRadius + 0.005, dist) * 
                      smoothstep(portalRadius + portalEdgeWidth + 0.005, portalRadius + portalEdgeWidth, dist);
    finalColor.rgb += shockwave * vec3(1.0, 0.9, 0.8) * warpPhase * 1.5;

    finalColor.rgb = mix(finalColor.rgb, finalColor.rgb * 1.2, (uColorEnhancement - 1.0) * 0.5);

    return mix(currentImg, finalColor, smoothstep(0.0, 1.0, progress));
  }


  void main() {
    vec4 effectColor;
    if (uEffectType == 0) {
      effectColor = glassEffect(vUv, uProgress);
    } else if (uEffectType == 1) {
      effectColor = frostEffect(vUv, uProgress);
    } else if (uEffectType == 2) {
      effectColor = rippleEffect(vUv, uProgress);
    } else if (uEffectType == 3) {
      effectColor = plasmaEffect(vUv, uProgress);
    } else if (uEffectType == 4) {
      effectColor = timeshiftEffect(vUv, uProgress);
    } else if (uEffectType == 5) {
      effectColor = glitchEffect(vUv, uProgress);
    } else if (uEffectType == 6) {
      effectColor = warpEffect(vUv, uProgress);
    } else {
      effectColor = texture2D(uTexture1, getCoverUV(vUv, uTexture1Size));
    }

    // Apply global vignette
    float vignette = 1.0 - smoothstep(0.8, 1.2, length(vUv - 0.5)) * uVignetteStrength * 0.5;
    effectColor.rgb *= vignette;

    // Apply global grain
    float grain = (rand(vUv + uProgress) - 0.5) * uGrainIntensity * 0.2;
    effectColor.rgb += grain;
    
    gl_FragColor = effectColor;
  }
`;