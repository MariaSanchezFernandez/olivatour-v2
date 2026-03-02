#!/bin/sh
npx expo export --platform web
cp -r public/. dist/
node -e "
const fs = require('fs');
let html = fs.readFileSync('dist/index.html', 'utf8');
html = html.replace('width=device-width, initial-scale=1, shrink-to-fit=no', 'width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover');
const inject = '<link rel=\"manifest\" href=\"/manifest.json\"><meta name=\"apple-mobile-web-app-capable\" content=\"yes\"><meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black-translucent\"><meta name=\"apple-mobile-web-app-title\" content=\"OlivaTour\"><link rel=\"apple-touch-icon\" href=\"/icon-512.png\">';
html = html.replace('</head>', inject + '</head>');
fs.writeFileSync('dist/index.html', html);
console.log('PWA + viewport-fit injected.');
"
