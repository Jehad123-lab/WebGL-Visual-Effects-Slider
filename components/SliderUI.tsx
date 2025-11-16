
import React from 'react';
import { motion } from 'framer-motion';
import { styles, theme } from '../styles';
import { slides } from '../constants/slideData';

interface SliderUIProps {
    currentSlideIndex: number;
    slideProgress: number;
    isMobile: boolean;
    mode: string;
    onNavigate: (index: number) => void;
}

export const SliderUI: React.FC<SliderUIProps> = ({ currentSlideIndex, slideProgress, isMobile, mode, onNavigate }) => {
    return (
        <>
            <span style={{...styles.slideNumber, ...(isMobile && styles.slideNumberMobile)}}>
                {String(currentSlideIndex + 1).padStart(2, '0')}
            </span>
            <span style={{...styles.slideTotal, ...(isMobile && styles.slideTotalMobile)}}>
                {String(slides.length).padStart(2, '0')}
            </span>
            <span id="help-text-span" style={{...styles.helpText, ...(isMobile && styles.helpTextMobile)}}>
                H: Settings • Space/→: Next • ←: Prev
            </span>
            <nav style={{...styles.slidesNavigation, ...(isMobile && styles.slidesNavigationMobile)}}>
                {slides.map((slide, index) => {
                    const navItemStyle = { ...styles.slideNavItem, ...(isMobile && styles.slideNavItemMobile) };
                    const titleStyle = { ...styles.slideNavTitle, ...(index === currentSlideIndex && styles.slideNavTitleActive) };
                    
                    return (
                        <motion.button key={index} style={navItemStyle} onClick={(e) => { e.stopPropagation(); onNavigate(index); }}>
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
                            <div style={{...styles.slideProgressLine, position: 'relative', zIndex: 1}}>
                                <div style={{...styles.slideProgressFill, width: index === currentSlideIndex ? (mode === 'auto' ? `${slideProgress}%` : '100%') : '0%'}}></div>
                            </div>
                            <div style={{...titleStyle, position: 'relative', zIndex: 1}}>{slide.title}</div>
                        </motion.button>
                    );
                })}
            </nav>
        </>
    );
};