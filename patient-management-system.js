const readline = require('readline')
const fs = require('fs')

const PATIENT_FILE = 'patients.json';
const PROVIDER_FILE = 'providers.json';

// Read data from files
let patients = loadData(PATIENT_FILE);
let providers = loadData(PROVIDER_FILE);

let currentRole = ''; // "patient" or "provider"  

// Load JSON data from file or start with an empty array
function loadData(file) {
if (fs.existsSync(file)) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}
return [];
}

// Save JSON data to file
function saveData(file, data) {
fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Setup readline interface
const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
}); // allows the user to give an input 

// Start: Choose Role
function chooseRole() {
console.log('\n=== Welcome ===');
console.log('1. Patient');
console.log('2. Health Provider');
rl.question('Select your role (1 or 2): ', choice => { // depending on what the user chooses it will change the current role and will change the menus depending 
  // on what they choose
  if (choice === '1') {
    currentRole = 'patient';
    showPatientMenu();
  } else if (choice === '2') {
    currentRole = 'Health provider';
    showHealthProviderMenu();
  } else {
    console.log('Invalid choice.');
    chooseRole();
  }
});
}
// Patient Menu
function showPatientMenu() {
console.log('\n *** Patient records ***');
console.log('1. Add New Patient');
console.log('2. View All Patients');
console.log('3. Search Patient');
console.log('4. Delete Patient');
console.log('5. Exit');
rl.question('\nChoose an option (1-5): ', handlePatientMenu); // Prompt for choice
}
function handlePatientMenu(choice) {
switch (choice.trim()) {
  case '1': addPatient(); break;
  case '2': viewPatients(); break;
  case '3': searchPatients(); break;
  case '4': deletePatient(); break;
  case '5': console.log('Goodbye!'); rl.close(); break;
  default: showPatientMenu(); break; // Any other input just redisplays menu
}
}

// Provider Menu
function showHealthProviderMenu() { // This prints onto the console log 
console.log('\n *** Health Provider Menu ***');
console.log('1. Add Health Provider');
console.log('2. View All Providers');
console.log('3. View All Patients');
console.log('4. Search Providers');
console.log('5. Delete Provider');
console.log('6. Exit');
rl.question('\nChoose an option (1-6): ', handleHealthProviderMenu);
}

function handleHealthProviderMenu(choice) { // gives the choices shown with the console logs a use so the user can choose 
switch (choice.trim()) {
  case '1': addHealthProvider(); break;
  case '2': viewHealthProviders(); break;
  case '3': viewPatients2(); break;
  case '4': searchHealthProviders(); break;
  case '5': deleteHealthProvider(); break;
  case '6': rl.close(); break;
  default: showHealthProviderMenu(); break;
}
}
// Function to display the main menu and prompt the user for an option
function addPatient() {
rl.question('\nEnter First Name: ', first => {
  rl.question('Enter Last Name: ', last => {
    rl.question('Enter Disease: ', disease => {
      rl.question('Enter Medication: ', medication => {
        rl.question('Enter Description: ', description => {
          patients.push({ first, last, disease, medication, description }); // Pushes all of the data inputed by the user to the json files
          saveData(PATIENT_FILE, patients);
          console.log('Patient added!');
          showPatientMenu();
        });
      });
    });
  });
});
}
function printPatientTable() {
if (patients.length === 0) { // If there are no Patients
  console.log('\nNo Patients recorded.');
  return;
}
// Print table headers
console.log('\n# | First Name   | Last Name  | Disease  | Medication  | Description |');
console.log('--------------------------------------------------------------------');
// Print each Patient as a formatted row
patients.forEach((pat, idx) => {
  let row =
    String(idx + 1).padEnd(2) + '| ' +         // defines the first data as 1 and any data after that will go up by 1
    pat.first.padEnd(10) + ' | ' +             
    pat.last.padEnd(9) + ' | ' +             
    pat.disease.padEnd(8) + '| ' +   
    pat.medication.padEnd(8) + '| ' +           
    pat.description;                      
  console.log(row);
});
}
// Function to delete a patient from the list
function deletePatient() {
if (patients.length === 0) {
  console.log('\nNo Patients recorded.');
  return; // If there is no patients then it will bring the user back to the menu
}
printPatientTable()         
rl.question('\nEnter patient number to delete: ', num => { // Ask which patient to delete from the list
  let idx = parseInt(num) - 1;                // Convert user input to array index
  if (patients[idx]) {
    patients.splice(idx, 1);                  // Remove from array
    saveData(PATIENT_FILE, patients)                          // Save updated data to the json file
    console.log('Patient has been deleted from the list!');
    viewPatients();
  }                             
});  

}

// A function that adds a new Health providor to the provider array
function addHealthProvider() { 
rl.question('\nEnter Health Provider Name: ', name => {
  rl.question('Enter Specialty: ', specialty => {
    rl.question('Enter Contact Info: ', contact => {
      providers.push({ name, specialty, contact });
      saveData(PROVIDER_FILE, providers);
      console.log('Health Provider added!');
      showHealthProviderMenu();
    });
  });
});
}
// Allows the health providors to check all of the health providors
function printHealthProviders() {
if (providers.length === 0) {
  console.log('\nNo Health providers recorded.');
  return;
}
  console.log('\n# | Name        | Specialty     | Contact Info');
  console.log('-----------------------------------------------');
  providers.forEach((prov, idx) => {
    let provrow =
    String(idx + 1).padEnd(2) + '| ' +         // Defines the first data as 1 and any data after that will go up by 1
    prov.name.padEnd(10) + ' | ' +             
    prov.specialty.padEnd(9) + ' | ' +             
    prov.contact;                   
  console.log(provrow);
  });
}
// Deletes the health providor from the JSON File and list
function deleteHealthProvider() {
if (providers.length === 0){  
  console.log('\nNo Health providers recorded.');
  return;
}
printHealthProviders();
rl.question('\nEnter provider number to delete: ', num => {
  let idx = parseInt(num) - 1;
  if (providers[idx]) {
    providers.splice(idx, 1);
    saveData(PROVIDER_FILE, providers);
    console.log('Provider has been deleted.');
    viewHealthProviders();
  }
});
}

// Search patients by keyword (searches all fields) and filters all of the relevent patients at the top
function searchPatients() {
rl.question('\nEnter search keyword for the info you would like to sort the list by: ', keyword => {
  const kw = keyword.toLowerCase();
  const results = patients.filter(pat =>
    pat.first.toLowerCase().includes(kw) ||
    pat.last.toLowerCase().includes(kw) ||
    pat.disease.toLowerCase().includes(kw) ||
    pat.medication.toLowerCase().includes(kw) ||
    pat.description.toLowerCase().includes(kw)
  );
  if (results.length === 0) {
    console.log('No matching patients found.');
    return;
  } 
    // Print table headers
  console.log('\n# | First Name   | Last Name  | Disease  | Medication  | Description |');
  console.log('--------------------------------------------------------------------');
// Print each expense as a formatted row
results.forEach((pat, idx) => {
  let row =
    String(idx + 1) + '| ' +       
    pat.first.padEnd(10) + ' | ' +            
    pat.last.padEnd(9) + ' | ' +             
    pat.disease.padEnd(8) + '| ' +   
    pat.medication.padEnd(8) + '| ' +           
    pat.description;                        
  console.log(row);
});
  showPatientMenu();
});
}

// Search health providers by keyword (searches all fields)
function searchHealthProviders() {
rl.question('\nEnter search keyword for Health Providers: ', keyword => {
  const kw = keyword.toLowerCase(); // checks through all of the info and will bring all of the Health providors with that word given by the user to the top
  // of the list
  const results = providers.filter(prov => // filters through all of the data to find the keyword
    prov.name.toLowerCase().includes(kw) ||
    prov.specialty.toLowerCase().includes(kw) ||
    prov.contact.toLowerCase().includes(kw)
  );
  if (results.length === 0) { // If the keyword given is invalid it will
    console.log('No matching Health providers found.');
  } else {
    console.log('\n# | Name       | Specialty    | Contact Info');
    console.log('--------------------------------------------');
    results.forEach((prov, idx) => {
      console.log(
        `${idx + 1} | ${prov.name.padEnd(10)} | ${prov.specialty.padEnd(12)} | ${prov.contact}`
      );
    });
  }
  showHealthProviderMenu();
});
}
// A function that prints out the patient table then after it prints the menu so it lets the user go to the next action
function viewPatients(){
printPatientTable();
showPatientMenu();
}
// A function that prints out the Health Provider table then after it prints the menu so it lets the user go to the next action
function viewHealthProviders(){
printHealthProviders();
showHealthProviderMenu();
}
// this seperates the other view patients function so that the health provider can also see the patients info
function viewPatients2(){
printPatientTable();
showHealthProviderMenu();
}

// Start the application by displaying the choice to look at the patient menu or the Health provider menu
chooseRole();