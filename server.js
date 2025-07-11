const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const dataPath = path.join(__dirname, "patients.json");

app.get("/patients", (req, res) => {
  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) return res.status(500).send("Failed to read patient data");
    res.json(JSON.parse(data));
  });
});

app.post("/patients", (req, res) => {
  const newPatient = { ...req.body, id: Date.now() };
  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) return res.status(500).send("Read error");
    const patients = JSON.parse(data);
    patients.push(newPatient);
    fs.writeFile(dataPath, JSON.stringify(patients, null, 2), (err) => {
      if (err) return res.status(500).send("Write error");
      res.status(201).json(newPatient);
    });
  });
});

app.delete("/patients/:id", (req, res) => {
  const id = parseInt(req.params.id);
  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) return res.status(500).send("Read error");
    let patients = JSON.parse(data);
    const updated = patients.filter(p => p.id !== id);
    fs.writeFile(dataPath, JSON.stringify(updated, null, 2), (err) => {
      if (err) return res.status(500).send("Write error");
      res.sendStatus(204);
    });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
