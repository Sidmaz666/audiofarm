export function isMobile() {
    if (typeof window === "undefined") return false;
  
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const width = window.innerWidth;
  
    // Basic screen width check for responsiveness
    const isSmallScreen = width <= 768;
  
    // Mobile/tablet detection from user agent
    const isTouchDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  
    return isTouchDevice || isSmallScreen;
  }
  