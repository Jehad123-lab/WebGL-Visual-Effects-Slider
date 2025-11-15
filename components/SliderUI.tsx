import React from 'react';
import { styles } from '../styles';
import { slides } from '../constants/slideData';

interface SliderUIProps {
    currentSlideIndex: number;
    slideProgress: number;
    isMobile: boolean;
    onNavigate: (index: number) => void;
}

export const SliderUI: React.FC<SliderUIProps> = ({ currentSlideIndex, slideProgress, isMobile, onNavigate }) => {
    return (
        <>
            <span style={{...styles.slideNumber, ...(isMobile && styles.slideNumberMobile)}}>
                {String(currentSlideIndex + 1).padStart(2, '0')}
            </span>
            <span style={{...styles.slideTotal, ...(isMobile && styles.slideTotalMobile)}}>
                {String(slides.length).padStart(2, '0')}
            </span>
            <span id="help-text-span" style={{...styles.helpText, ...(isMobile && styles.helpTextMobile)}}>
                H: Settings • Space/→: Next • ←: Prev • Click/Scroll to Advance
            </span>
            <nav style={{...styles.slidesNavigation, ...(isMobile && styles.slidesNavigationMobile)}}>
                {slides.map((slide, index) => {
                    const navItemStyle = { ...styles.slideNavItem, ...(isMobile && styles.slideNavItemMobile) };
                    const titleStyle = { ...styles.slideNavTitle, ...(index === currentSlideIndex && styles.slideNavTitleActive) };
                    
                    return (
                        <div key={index} style={navItemStyle} onClick={(e) => { e.stopPropagation(); onNavigate(index); }}>
                            <div style={styles.slideProgressLine}>
                                <div style={{...styles.slideProgressFill, width: index === currentSlideIndex ? `${slideProgress}%` : '0%'}}></div>
                            </div>
                            <div style={titleStyle}>{slide.title}</div>
                        </div>
                    );
                })}
            </nav>
        </>
    );
};