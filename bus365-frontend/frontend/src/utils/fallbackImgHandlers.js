import serviceFallback from './../assets/images/service_fallback.png';
import userFallback from './../assets/profile.jpge.webp';

export const addServiceImageFallback = (event) => {
  event.currentTarget.src = serviceFallback;
};

export const userImageFallback = (event) => {
  event.currentTarget.src = userFallback; 
};
