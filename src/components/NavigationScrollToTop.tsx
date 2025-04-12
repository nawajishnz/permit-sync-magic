import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to top of the page when route changes
 */
export const NavigationScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [pathname]);

  return null;
};

export default NavigationScrollToTop; 