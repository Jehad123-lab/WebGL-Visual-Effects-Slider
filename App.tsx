
import React, { useState, useRef, useEffect } from 'react';
import { useWebGLSlider } from './hooks/useWebGLSlider';
import { SliderUI } from './components/SliderUI';
import { styles } from './styles';
import { SLIDER_CONFIG } from './config/sliderConfig';

const App: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const [mode, setMode] = useState(SLIDER_CONFIG.settings.mode);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { navigateToSlide, stopAutoSlideTimer, quickResetProgress } = useWebGLSlider({
    canvasRef,
    onSlideChange: setCurrentSlideIndex,
    onProgressUpdate: setSlideProgress,
    onModeChange: setMode,
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={styles.body}>
        <main style={styles.sliderWrapper}>
            <canvas ref={canvasRef} style={styles.webglCanvas}></canvas>
            <SliderUI
                currentSlideIndex={currentSlideIndex}
                slideProgress={slideProgress}
                isMobile={isMobile}
                mode={mode}
                onNavigate={(index) => {
                    stopAutoSlideTimer();
                    quickResetProgress();
                    navigateToSlide(index);
                }}
            />
        </main>
    </div>
  );
};

export default App;