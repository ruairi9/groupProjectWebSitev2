import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getFirestore, doc, collection, addDoc, setDoc, getDocs, updateDoc, arrayUnion   } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyAPwFQsM5H9GNe1nEB4Xgx86h3zYOG7_r8",
  authDomain: "groupprojecttest12331.firebaseapp.com",
  projectId: "groupprojecttest12331",
  storageBucket: "groupprojecttest12331.firebasestorage.app",
  messagingSenderId: "117617683043",
  appId: "1:117617683043:web:3efe98987e6d5a453e2656"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);  
const provider = new GoogleAuthProvider();

const modal = document.getElementById('loginModal');
const openPopup = document.getElementById('openPopup');
const closePopup = document.getElementById('closePopup');
const toLogin = document.getElementById('loginGoogle');
const statusMessage = document.getElementById('statusMessage');

const apiUrl = 'https://kangaroo-pleased-notably.ngrok-free.app/stock=';
const stocks = {
  "nvda": 700,
  "andr": 500,
  "appl": 145,
  "msfc": 300,
  "amzn": 3300,
  "tsla": 275,
  "goog": 2750,
  "meta": 350,
  "bcm": 500,
  "amd": 120
};

const crypto = {
  "btc": 35000,
  "eth": 1800,
  "sol": 150
};

if (openPopup) {
  openPopup.onclick = function() {
    modal.style.display = 'block';
  };
}

if (closePopup) {
  closePopup.onclick = function() {
    modal.style.display = 'none';
    statusMessage.style.display = 'none';
  };
}

if (toLogin) {
  toLogin.onclick = async function() {
    statusMessage.style.display = 'block';
    statusMessage.textContent = 'Attempting to log in';
    await signInWithPopup(auth, provider).then(() => {
      window.location.href = 'mainwebpage.html';
    });
  };
}

window.onclick = function(event) {
  if (event.target === modal) {
    modal.style.display = 'none';
    statusMessage.style.display = 'none';
  }
};

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("User logged in:", userCredential.user);
        alert("Login successful");
        window.location.href = 'mainwebpage.html'; 
      })
      .catch((error) => {
        console.error("Login failed", error.message);
        alert("Login failed" + error.message);
      });
  });
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', registerUser);
}

function registerUser(event) {
  event.preventDefault();

  const name = document.getElementById('nameRegister').value;
  const email = document.getElementById('loginEmailRegister').value;
  const password = document.getElementById('userPasswordRegister').value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("User registered", user);
      alert("User has registered successfully");
      window.location.href = "mainwebpage.html";
    })
    .catch((error) => {
      if (error.code === 'auth/email-already-in-use') {
        alert("This email is already registered. Please use another email or log in");
      } else {
        console.error("Error during registration", error.message);
        alert("Registration failed" + error.message);
      }
    });
}

document.addEventListener('DOMContentLoaded', () => {
  const managerForm = document.getElementById('managerform');
  if (managerForm) {
    managerForm.addEventListener('submit', async (e) => {
      e.preventDefault(); 

      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to add clients");
        return;
      }
      const companyName = document.getElementById('managercompanies').value;
      const contactNumber = document.getElementById('contactnumber').value;

      try {
        const clientRef = collection(db, 'clients');
        await addDoc(clientRef, {
            managercompanies: companyName,
            contactnumber: contactNumber,
            userId: user.uid,
        });

        console.log("Client added successfully");
        statusMessage.textContent = "Client added successfully";
        statusMessage.style.display = 'block';
        managerForm.reset(); 
      } catch (error) {
        console.error("Error adding client", error);
        statusMessage.textContent = "Error adding client. Please try again";
        statusMessage.style.display = 'block';
      }
    });
  }
});

const clientsContainer = document.getElementById('clients-container');
if (clientsContainer) {
  async function fetchClients(user) {
    try {
      if (!user) {
        clientsContainer.innerHTML = '<p>Please log in to view your clients.</p>';
        return;
      }

      const clientsRef = collection(db, 'clients');
      const querySnapshot = await getDocs(clientsRef);

      clientsContainer.innerHTML = '';

      querySnapshot.forEach((doc) => {
        const client = doc.data();

        if (client.userId === user.uid) {
          const clientElement = document.createElement('div');
          clientElement.classList.add('client-card');
          clientElement.innerHTML = `
            <p><strong>Company Name:</strong> ${client.managercompanies}</p>
            <p><strong>Contact Number:</strong> ${client.contactnumber}</p>
          `;
          clientsContainer.appendChild(clientElement);
        }
      });
    } catch (error) {
      console.error("Error fetching clients:", error);
      clientsContainer.innerHTML = '<p>Error loading clients. Please try again later.</p>';
    }
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchClients(user);
    } else {
      clientsContainer.innerHTML = '<p>Please log in to view your clients.</p>';
    }
  });
}


//uikkkkkkkkkkkkk
const purchaseForm = document.getElementById('purchaseForm');
const clientSelect = document.getElementById('clientSelect');
const purchaseStatus = document.getElementById('purchaseStatus');
const assetNameSelect = document.getElementById('assetName');
const assetPriceInput = document.getElementById('assetPrice');
const assetTypeSelect = document.getElementById('assetType');

function updateAssetOptions() {
  const assetType = assetTypeSelect.value;
  assetNameSelect.innerHTML = '';

  let options = [];

  if (assetType === 'stocks') {
    options = Object.keys(stocks);
  } else if (assetType === 'crypto') {
    options = Object.keys(crypto);
  }

  options.forEach(asset => {
    const option = document.createElement('option');
    option.value = asset;
    option.textContent = asset;
    option.setAttribute('data-price', assetType === 'stocks' ? stocks[asset] : crypto[asset]);
    assetNameSelect.appendChild(option);
  });

  if (options.length > 0) {
    assetPriceInput.value = assetNameSelect.options[0].getAttribute('data-price');
  }
}
if (assetNameSelect) {
  assetNameSelect.addEventListener('change', () => {
    const selectedOption = assetNameSelect.options[assetNameSelect.selectedIndex];
    const price = selectedOption.getAttribute('data-price');
    assetPriceInput.value = price ? parseFloat(price).toFixed(2) : '';
  });
  }

assetTypeSelect.addEventListener('change', updateAssetOptions);

updateAssetOptions();

async function fetchClientsForManager(user) {
  try {
    const clientsRef = collection(db, 'clients');
    const querySnapshot = await getDocs(clientsRef);

    clientSelect.innerHTML = '<option value="">Select a client</option>';

    querySnapshot.forEach((doc) => {
      const client = doc.data();
      if (client.userId === user.uid) {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = client.managercompanies;
        clientSelect.appendChild(option);
      }
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    purchaseStatus.textContent = "Error loading clients. Please try again later.";
    purchaseStatus.style.color = 'red';
  }
}

async function addAssetToClient(clientId, assetType, assetName, assetPrice, assetQuantity) {
  try {
    const clientRef = doc(db, 'clients', clientId);

    const assetString = `${assetName},${assetPrice},${assetQuantity}`;

    const updateData = {};
    if (assetType === 'crypto') {
      updateData.crypto = arrayUnion(assetString);
    } else if (assetType === 'stocks') {
      updateData.stocks = arrayUnion(assetString);
    }

    await updateDoc(clientRef, updateData);

    return "Asset added successfully!";
  } catch (error) {
    console.error("Error adding asset:", error);
    throw new Error("Failed to add asset. Please try again.");
  }
}

purchaseForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const clientId = clientSelect.value;
  const assetType = document.getElementById('assetType').value;
  const assetName = document.getElementById('assetName').value;
  const assetPrice = parseFloat(document.getElementById('assetPrice').value);
  const assetQuantity = parseInt(document.getElementById('assetQuantity').value, 10);

  if (!clientId) {
    purchaseStatus.textContent = "Please select a client.";
    purchaseStatus.style.color = 'red';
    return;
  }

  try {
    const message = await addAssetToClient(clientId, assetType, assetName, assetPrice, assetQuantity);
    purchaseStatus.textContent = message;
    purchaseStatus.style.color = 'green';
    purchaseForm.reset();
  } catch (error) {
    purchaseStatus.textContent = error.message;
    purchaseStatus.style.color = 'red';
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    fetchClientsForManager(user);
  } else {
    clientSelect.innerHTML = '<option value="">Please log in to view clients</option>';
  }
});


//nrnj

const displayClientData = async (userId) => {
  const clientContainer = document.getElementById("clientData");

  try {
    const clientsSnapshot = await db.collection('clients')
      .where('userId', '==', userId)
      .get();

    clientsSnapshot.forEach(async (doc) => {
      const clientData = doc.data();

      const clientDiv = document.createElement('div');
      clientDiv.classList.add('client');
      clientDiv.innerHTML = `<h3>Client: ${doc.id}</h3>`;

      const cryptoAssets = clientData.crypto;
      const stocks = clientData.stocks;

      let cryptoHtml = '<h4>Cryptocurrencies:</h4><ul>';
      for (const asset of cryptoAssets) {
        const [symbol, price] = asset.split(',');
        const prediction = await getPrediction(symbol);
        cryptoHtml += `<li>${symbol} - Price: $${price}, Prediction: ${prediction}</li>`;
      }
      cryptoHtml += '</ul>';
      clientDiv.innerHTML += cryptoHtml;

      let stocksHtml = '<h4>Stocks:</h4><ul>';
      for (const asset of stocks) {
        const [symbol, price] = asset.split(',');
        const prediction = await getPrediction(symbol);
        stocksHtml += `<li>${symbol} - Price: $${price}, Prediction: ${prediction}</li>`;
      }
      stocksHtml += '</ul>';
      clientDiv.innerHTML += stocksHtml;

      clientContainer.appendChild(clientDiv);
    });
  } catch (error) {
    console.error('Error retrieving client data: ', error);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const userId = "PB4FuxRYqTga80ydxYDggz6iGEt1";
  displayClientData(userId);
});
