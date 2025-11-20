import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        // If there's a hash (anchor link), let the browser handle it
        if (hash) {
            // Small delay to ensure the element exists
            setTimeout(() => {
                const element = document.querySelector(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 0);
        } else {
            // No hash, scroll to top
            window.scrollTo(0, 0);
        }
    }, [pathname, hash]);

    return null;
}
