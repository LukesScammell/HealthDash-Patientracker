# website-upgrade-assesment-3
I will be using php and css to format the javascript i wrote for assement 2 sdv

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
cd website-upgrade-assessment‑3

# 2. Install dependencies
npm install

# 3. Seed the database (ensure MongoDB is running)
node server/seed.js

# 4. Start the development server
npm run dev

# 5. Running on browser
Open your browser at http://localhost:3000 (or whichever port you configured).
```
