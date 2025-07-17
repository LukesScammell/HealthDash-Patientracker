#
# 📝 About This Project

This project was initially developed using ChatGPT in the browser to generate some of the website's foundational code and structure. Later, development was transitioned to GitHub Copilot in Visual Studio Code, which made adding new features, fixing bugs, and iterating on the design much easier and faster. Copilot's integration with VS Code provided a more streamlined workflow and improved productivity throughout the build process.
#
# 🧑‍💻 Seeded User Accounts

The following user accounts are seeded for testing and demo purposes:

| Email               | Password |
|---------------------|----------|
| alice@email.com     | test123  |
| bob@email.com       | test123  |
| luke@email.com      | test123  |
| provider1@email.com | test123  |

# HealthDash-Patientracker
I will be using Html and css to format the javascript i wrote for assement 2 sdv

## 🚀 Project Structure
```text
HealthDash-Patientracker/
├── client/                     # Frontend
│   ├── images/ 
│   │   ├── amoxicillin.png     # Static images    
│   │   ├── antihistamines.jpg                   
│   │   ├── antivirals.jpg                   
│   │   ├── ibuprofen.png                  
│   │   ├── inhaler.png                  
│   │   ├── insulin.png                 
│   │   ├── paracetamol.png                  
│   │   ├── ssri.jpg                   
│   │   ├── triptans.jpg                           
│   ├── pages/                  # HTML pages
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
│   └── assets/                 # Fonts, icons, etc.
├── server/                     # Backend
│   ├── data/
│   │   ├── patients.json
│   │   ├── providers.json
│   │   └── users.json
│   ├── routes/                 # (Optional) route handlers
│   ├── seed.js                 # MongoDB seed script
│   └── server.js               # Main Express server
│   └── public/                 # Served static assets (if needed)
│       └── (optional symlink to /client for Express.static)
├── LICENSE
├── README.md
├── package.json
├── package-lock.json
└── notes-things-to-add.text
```

### ⚙️ How to Run
```bash
# 1. Clone the repo
git clone <your‑repo‑url>
cd HealthDash-Patientracker

# 2. Install dependencies
npm install

# 3. Seed the database (ensure MongoDB is running)
node server/seed.js

# 4. Start the development server
npm run dev

# 5. Running on browser
Open your browser at http://localhost:3000 (or whichever port you configured).
```

# Website pages

| Pages | Image | 
|:------:|:------:|
| Index.html  | ![Index-image](<README images/Index-image.png>)|
| Login.html   |![Index-image](<README images/Login-image.png>)| 
| Register.html   |![Index-image](< README images/Register-image.png>)|  