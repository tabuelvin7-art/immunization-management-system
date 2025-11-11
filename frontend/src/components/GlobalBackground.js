import { useEffect } from 'react';
import backgroundImage from '../assets/Authbackground.jpg';

const GlobalBackground = () => {
  useEffect(() => {
    // Set the background image as a CSS custom property for the entire app
    document.documentElement.style.setProperty('--global-background-image', `url(${backgroundImage})`);
    
    // Cleanup function to remove the custom property when component unmounts
    return () => {
      document.documentElement.style.removeProperty('--global-background-image');
    };
  }, []);

  return null; // This component doesn't render anything
};

export default GlobalBackground;