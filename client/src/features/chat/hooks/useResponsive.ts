import { useEffect } from 'react';
import { useUIStore } from '../../../stores/uiStore';

const MOBILE_BREAKPOINT = 768;

/**
 * Hook to track mobile/tablet/desktop viewport
 */
export function useResponsive(): void {
  const setIsMobile = useUIStore((state) => state.setIsMobile);

  useEffect(() => {
    const checkMobile = (): void => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Initial check
    checkMobile();

    // Listen for resize
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [setIsMobile]);
}
