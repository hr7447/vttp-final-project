(function(window) {
  window.env = window.env || {};
  // Environment variables
  window.env.apiUrl = 'https://server-production-e157.up.railway.app/api';
  // Log configuration load and timestamp
  console.log('[ENV.JS] Loaded at ' + new Date().toISOString());
  console.log('[ENV.JS] API URL set to: ' + window.env.apiUrl);
})(this); 