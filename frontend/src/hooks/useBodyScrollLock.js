import { useEffect } from 'react';

/**
 * Bloque le scroll du body quand isLocked est true.
 * Empêche le défilement de la page en arrière-plan quand un modal est ouvert.
 */
const useBodyScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isLocked]);
};

export default useBodyScrollLock;
