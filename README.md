# website-upgrade-assesment-3
I will be using php and css to format the javascript i wrote for assement 2 sdv

website-upgrade-assessment-3/
├── client/                    # Frontend
│   ├── images/               # Static images
│   ├── pages/                # HTML pages
│   │   ├── forgot-password.html
│   │   ├── index.html
│   │   ├── login.html
│   │   ├── nav.html
│   │   ├── patient-profile.html
│   │   ├── patients.html
│   │   ├── provider-patients.html
│   │   ├── providers.html
│   │   ├── register.html
│   │   └── users.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   └── assets/               # Optional: for fonts, icons, etc.
│
├── server/                    # Backend
│   ├── data/
│   │   ├── patients.json
│   │   ├── providers.json
│   │   ├── users.json
│   ├── routes/                # Route handlers (optional split)
│   ├── seed.js                # Seed script for MongoDB
│   └── server.js              # Main Express server file
│
├── public/                    # Served static assets (if needed)
│   └── (optional symlink to /client for Express.static)
│
├── LICENSE
├── README.md
├── package.json
├── package-lock.json
└── notes-things-to-add.text

# how to run
to run the website put : npm run dev