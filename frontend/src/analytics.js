// Google Analytics utility functions

// Track page views
export const trackPageView = (pageName) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-Y4980TRN7M', {
      page_title: pageName,
      page_location: window.location.href,
    });
  }
};

// Track custom events
export const trackEvent = (eventName, parameters = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Track feature usage
export const trackFeatureUsage = (featureName, action = 'used') => {
  trackEvent('feature_usage', {
    feature_name: featureName,
    action: action,
    page: window.location.pathname,
  });
};

// Track image analysis
export const trackImageAnalysis = (analysisType, success = true) => {
  trackEvent('image_analysis', {
    analysis_type: analysisType,
    success: success,
    timestamp: new Date().toISOString(),
  });
};

// Track photographer similarity
export const trackPhotographerSimilarity = (numImages, success = true) => {
  trackEvent('photographer_similarity', {
    num_images: numImages,
    success: success,
    timestamp: new Date().toISOString(),
  });
};

// Track crop suggestion
export const trackCropSuggestion = (success = true) => {
  trackEvent('crop_suggestion', {
    success: success,
    timestamp: new Date().toISOString(),
  });
};

// Track navigation
export const trackNavigation = (fromPage, toPage) => {
  trackEvent('navigation', {
    from_page: fromPage,
    to_page: toPage,
  });
};
