<p align="center">
  <a href="https://librechat.ai">
    <img src="frontend/src/logo.svg" height="256">
  </a>
  <h1 align="center">
    <a href="https://deco.lkx666.cn">Sober Up</a>
  </h1>
</p>

<p align="center">
  <a href="https://www.youtube.com/watch?v=qXgim7E87FI"> 
    <img
      src="https://img.shields.io/badge/YOUTUBE-red.svg?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&logoWidth=20">
  </a>
  <a href="https://onedrive.live.com/?authkey=%21ALWPljdaURF3qmw&id=B83B62E1C35F84FF%212391&cid=B83B62E1C35F84FF"> 
    <img
      src="https://img.shields.io/badge/DOCS-blue.svg?style=for-the-badge&logo=read-the-docs&logoColor=white&labelColor=000000&logoWidth=20">
  </a>
  <a href="https://github.com/lliukaixiang817/DECO3801/stargazers" target="_blank">
    <img
      src="https://img.shields.io/github/stars/lliukaixiang817/DECO3801?style=for-the-badge&logo=github&logoColor=white&labelColor=000000&logoWidth=20"
      alt="GitHub Stars">
  </a>
</p>

# Base file structure
This project include both frontend and backend.
<pre>
📂 DECO3801
├ 📂 backend
  ├ 📂 public
    └ 📄 index.php
  ├ 📂 src
    ├ 📂 config
      └ 📄 database.php
    ├ 📂 controllers
      ├ 📄 EventController.php
      ├ 📄 ProfileController.php
      └ 📄 UserController.php
    └ 📂 models
      ├ 📄 Event.php
      ├ 📄 Profile.php
      └ 📄 User.php
  ├ 📄 composer-setup.php
  ├ 📄 composer.json
  ├ 📄 composer.lock
  └ 📄 package-lock.json
├ 📂 frontend
  ├ 📂 public
    ├ 📂 assets
      ├ 📂 drinks_icon
        ├ 📄 beer-icon.svg
        ├ 📄 cocktail-icon.svg
        ├ 📄 sake-icon.svg
        ├ 📄 spirits-icon.svg
        └ 📄 wine-icon.svg
      ├ 📂 medal_imgs
        ├ 📄 1d.svg
        ├ 📄 1m.svg
        ├ 📄 1m_medal.png
        ├ 📄 1m_medal_transparent.png
        ├ 📄 1w.svg
        ├ 📄 1w_medal.png
        ├ 📄 1w_medal_transparent.png
        ├ 📄 1y.svg
        ├ 📄 3m_medal.png
        ├ 📄 3m_medal_transparent.png
        ├ 📄 6m.svg
        ├ 📄 6m_medal.png
        ├ 📄 6m_medal_transparent.png
        └ 📄 all.svg
      └ 📂 privacy_doc
        ├ 📄 privacy_statement.html
        ├ 📄 privacy_statement.md
        └ 📄 privacy_statement.txt
    ├ 📄 favicon.ico
    ├ 📄 index.html
    ├ 📄 logo192.png
    ├ 📄 logo512.png
    ├ 📄 manifest.json
    └ 📄 robots.txt
  ├ 📂 src
    ├ 📂 api
      └ 📄 apiClient.js
    ├ 📂 assets
      └ 📂 icons
        ├ 📄 bottle.svg
        └ 📄 left.svg
    ├ 📂 components
      ├ 📂 Event
        ├ 📄 EventBanner.js
        ├ 📄 EventCard.js
        ├ 📄 EventComponent.js
        ├ 📄 EventDetails.js
        ├ 📄 GoogleMap.js
        ├ 📄 api.js
        └ 📄 styles_event.css
      ├ 📂 HIstory
        ├ 📄 DatePicker.js
        ├ 📄 DrinkHIstory.js
        └ 📄 calendarStyle.css
      ├ 📄 BodyInfo.css
      ├ 📄 BodyInfo.js
      ├ 📄 Home.js
      ├ 📄 Login.js
      ├ 📄 MyInfo.css
      ├ 📄 MyInfo.js
      ├ 📄 Navigation.js
      ├ 📄 OOBE.js
      ├ 📄 PopWindow.js
      ├ 📄 PrivacyStatement.js
      ├ 📄 Profile.css
      ├ 📄 Profile.js
      ├ 📄 RecordDrinks.js
      ├ 📄 Registration.js
      ├ 📄 Reward.css
      ├ 📄 Reward.js
      ├ 📄 Settings.js
      └ 📄 styles.css
    ├ 📂 mocks
      ├ 📄 browser.js
      └ 📄 handlers.js
    ├ 📄 App.css
    ├ 📄 App.js
    ├ 📄 App.test.js
    ├ 📄 index.css
    ├ 📄 index.js
    ├ 📄 logo.svg
    ├ 📄 reportWebVitals.js
    └ 📄 setupTests.js
  ├ 📄 package-lock.json
  └ 📄 package.json
└ 📄 README.md
</pre>
> [!TIP]
> It is recommended to deploy it on the same machine.

> [!IMPORTANT]
> A .env profile is needed in the backend folder, and it is not provided on GitHub for other project's security reason.
> 
> When deploying locally, Sign in with apple and cloudflare captcha will not work because of the domain.
> 
> Cloudflare Captcha will also not work in the local deploy. If you want to enable it, you should generate your own API and keys from Cloudflare.

# Installation
Frontend and backend are installed independently of each other. Before installation, please make sure you have navigated to the `DECO3801` folder.
## Frontend

- Install dependence
```
cd frontend
npm install
```
- Adjust settings (If you want to test the backend and run the project locally)
  - Navigate to `/DECO3801/frontend/src/api/`
  - Open `apiClient.js`. Comment out the fourth line and uncomment the fifth line.
  - Make sure you uncomment line :`baseURL: 'http://localhost:8000/',`.

- Run `npm run dev`

- Visit `http://localhost:3000`

## Backend

- Install PHP From `https://www.php.net`

- Install dependence
  - Navigate to `/DECO3801/backend/`
  - Unzip the `Vendor.zip`

- Set the `.env` file
  - Example:
    - `MONGO_URI=mongodb+srv:EXAMPLEURI`
    - `MONGO_DB=EXAMPLENAME`

- Run `php -S 0.0.0.0:8000 -t public`

## iOS version (optional)

- Install Xcode From App Store

- Open project
  - Open `S2.xcodeproj` form `/Xcode/S2/`

- Set the domain and swap the `https://deco.lkx666.cn`
> [!TIP]
> Please remember that WebKit will not support HTTP and changes need to be made in Xcode if you are deploying it locally.
  
