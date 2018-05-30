# Progressive Web App - Weather

This app was built using [Your first Progressive Web App](https://codelabs.developers.google.com/codelabs/your-first-pwapp/)
code lab from Google.

* [Repository](https://github.com/profcase/pwapp-weather)
* [App](https://pwapp-weather.firebaseapp.com/)

## Prerequisites

* Git version control system
* Chrome web browser
* [Web Server for Chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb)
* The [sample code](https://github.com/googlecodelabs/your-first-pwapp/archive/master.zip)
* Visual Studio Code for editing
* Basic knowledge of HTML, CSS and JavaScript
* Favicon generator such as [RealFaviconGenerator](https://realfavicongenerator.net/)
* Node is required to deploy to Firebase

## To Run Locally

1. Open Chrome.
2. Open Apps / Web Server.
3. Set folder to this root folder on local machine.
4. Open browser to <http://127.0.0.1:8887/.>

## Deploy to Firebase

1. Create a Firebase account at <https://firebase.google.com/console/>
2. Install the most recent LTS (long-term support) version of Node.js.
3. On Windows, open PowerShell as Administrator and install Firebase tools: npm install -g firebase-tools
4. Login with a Google account: firebase login
5. Initialize your Firebase project: firebase init
6. At the prompts, select Hosting.
7. Enter . to select current directory for the public assets.
8. Select no when it asks to overwrite index.html.
9. Deploy with: firebase deploy

Project Console: <https://console.firebase.google.com/project/pwapp-weather/overview>
Hosting URL: <https://pwapp-weather.firebaseapp.com>

## Minimizing JavaScript

To speed up loading:

* Use [Ugify.js](http://lisperator.net/uglifyjs/).
* Use [only the Firebase you need](https://firebase.google.com/docs/web/setup).

Firebase automatically gzips text assets (html, css, js).

## Speed up Storage

HTML5's localStorage can be slow.

* Replace localStorage implementation with asynchronous storage IndexedDB (idb).
* Use [localForage](https://github.com/localForage/localForage) wrapper to idb.

## Recommendations

* Use [sw-precache](https://github.com/GoogleChrome/sw-precache) library for service workers.
* Read [cache-then-network](https://jakearchibald.com/2014/offline-cookbook/#cache-network-race) approach
