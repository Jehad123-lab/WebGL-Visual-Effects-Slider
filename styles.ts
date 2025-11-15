
import type React from 'react';

export const theme = {
  fontMono: '"PPSupplyMono", monospace',
  fontSans: '"PP Neue Montreal", sans-serif',
  colorBg: '#000',
  colorText: '#fff',
  colorTextMuted: 'rgba(255, 255, 255, 0.8)',
  colorTextLight: 'rgba(255, 255, 255, 0.6)',
  colorAccent: '#fff',
  fontSizeMono: 'clamp(10px, 1.2vw, 12px)',
  spacingSm: '1rem',
  spacingMd: '2rem',
};

export const styles: { [key: string]: React.CSSProperties } = {
  body: {
    fontFamily: theme.fontSans,
    background: theme.colorBg,
    color: theme.colorText,
    cursor: 'pointer',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
  },
  sliderWrapper: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    transition: 'opacity 1.5s ease-in',
  },
  webglCanvas: {
    display: 'block',
    width: '100%',
    height: '100%',
  },
  slideNumber: {
    position: 'absolute',
    top: '50%',
    left: theme.spacingMd,
    transform: 'translateY(-50%)',
    fontFamily: theme.fontMono,
    fontSize: '12px',
    fontWeight: 600,
    color: theme.colorText,
    zIndex: 3,
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  slideNumberMobile: {
    left: theme.spacingSm,
  },
  slideTotal: {
    position: 'absolute',
    top: '50%',
    right: theme.spacingMd,
    transform: 'translateY(-50%)',
    fontFamily: theme.fontMono,
    fontSize: '12px',
    fontWeight: 600,
    color: theme.colorText,
    zIndex: 3,
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  slideTotalMobile: {
    right: theme.spacingSm,
  },
  slidesNavigation: {
    position: 'absolute',
    bottom: theme.spacingMd,
    left: theme.spacingMd,
    right: theme.spacingMd,
    display: 'flex',
    gap: 0,
    zIndex: 3,
    pointerEvents: 'all',
  },
  slidesNavigationMobile: {
    bottom: theme.spacingSm,
    left: theme.spacingSm,
    right: theme.spacingSm,
  },
  slideNavItem: {
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    padding: theme.spacingSm,
    flex: 1,
    border: 'none',
    background: 'none',
  },
  slideNavItemMobile: {
    padding: '0.75rem',
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
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: theme.colorTextMuted,
    fontWeight: 600,
    transition: 'color 0.3s ease',
  },
  slideNavTitleActive: {
    color: theme.colorText,
  },
  helpText: {
    position: 'absolute',
    top: theme.spacingMd,
    left: theme.spacingMd,
    fontFamily: theme.fontMono,
    fontSize: '11px',
    textTransform: 'uppercase',
    color: theme.colorTextMuted,
    zIndex: 3,
  },
  helpTextMobile: {
    top: theme.spacingSm,
    left: theme.spacingSm,
  },
};

export const tweakpaneStyles = `
  .tp-dfwv {
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    z-index: 1000 !important;
    max-width: 320px !important;
    background: rgba(0, 0, 0, 0.9) !important;
    backdrop-filter: blur(20px) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 8px !important;
  }

  .tp-dfwv .tp-btnv_b {
    background: rgba(255, 255, 255, 0.1) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    color: #ffffff !important;
    font-family: ${theme.fontMono} !important;
    border-radius: 4px !important;
  }

  .tp-dfwv .tp-btnv_b:hover {
    background: rgba(255, 255, 255, 0.2) !important;
  }

  @media (max-width: 600px) {
    .tp-dfwv {
      top: 10px !important;
      right: 10px !important;
      max-width: 280px !important;
    }
  }
`;
