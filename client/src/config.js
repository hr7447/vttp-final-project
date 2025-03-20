// This file will be copied to the root of the application at runtime
(function(window) {
  // Get the URL of the current server
  var currentOrigin = window.location.origin;
  
  // Runtime configuration that can be injected by Railway
  window.AppConfig = {
    // If running on Railway: use relative URL, otherwise use default dev URL
    apiUrl: currentOrigin.includes('railway.app') ? '/api' : 'http://localhost:8080/api'
  };
  
  console.log('Runtime configuration loaded:', window.AppConfig);
})(window); 