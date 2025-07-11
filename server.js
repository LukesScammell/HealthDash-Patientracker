const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

// Serve frontend files from /frontend folder
app.use(express.static(path.join(__dirname, "frontend")));
app.use(express.json());

// Get patients.json
app.get("/patients", (req, res) => {
  const filePath = path.join(__dirname, "patients.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).send("Failed to read patient data");
    res.json(JSON.parse(data));
  });
});

// Save a new patient
app.post("/patients", (req, res) => {
  const filePath = path.join(__dirname, "patients.json");
  const newPatient = req.body;
  newPatient.id = Date.now();

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).send("Read error");
    let patients = JSON.parse(data);
    patients.push(newPatient);
    fs.writeFile(filePath, JSON.stringify(patients, null, 2), (err) => {
      if (err) return res.status(500).send("Write error");
      res.status(201).json(newPatient);
    });
  });
});

// Delete a patient
app.delete("/patients/:id", (req, res) => {
  const filePath = path.join(__dirname, "patients.json");
  const id = parseInt(req.params.id);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).send("Read error");
    let patients = JSON.parse(data);
    const updated = patients.filter((p) => p.id !== id);
    fs.writeFile(filePath, JSON.stringify(updated, null, 2), (err) => {
      if (err) return res.status(500).send("Write error");
      res.sendStatus(204);
    });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
