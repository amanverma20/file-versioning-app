// Use @tailwindcss/postcss if available (newer package name), otherwise fall back to tailwindcss
let tailwindPluginFn;
try {
  // newer package
  tailwindPluginFn = require('@tailwindcss/postcss');
} catch (e) {
  // fallback to classic tailwindcss package
  tailwindPluginFn = require('tailwindcss');
}

module.exports = {
  // Use array form so PostCSS consumes the plugin functions directly
  plugins: [
    tailwindPluginFn,
    require('autoprefixer'),
  ]
}
