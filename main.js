import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getFirestore, doc, collection, addDoc, setDoc, getDocs, getDoc, updateDoc, arrayUnion   } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';

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

const stockInfo = {
  "NVIDIA": "NVIDIA is a leading manufacturer of graphics processing units (GPUs) and AI solutions.",
  "Android": "Android is an open-source mobile operating system developed by Google.",
  "Apple": "Apple is a technology company known for its consumer electronics, software, and services.",
  "Microsoft": "Microsoft is a technology company known for its software products like Windows and Office.",
  "Amazon": "Amazon is an e-commerce company that also offers cloud computing services.",
  "Tesla": "Tesla is a company focused on electric vehicles, renewable energy, and energy storage.",
  "Alphabet": "Alphabet is the parent company of Google, involved in various technology and innovation sectors.",
  "Meta Platforms": "Meta Platforms (formerly Facebook) focuses on social media, virtual reality, and digital advertising.",
  "Broadcom": "Broadcom designs semiconductor and infrastructure software products.",
  "AMD": "AMD (Advanced Micro Devices) produces processors and graphics cards, competing with Intel and NVIDIA."
};

const cryptoInfo = {
  "Bitcoin": "Bitcoin is a decentralized digital currency, without a central bank or single administrator.",
  "Ethereum": "Ethereum is a decentralized platform that runs smart contracts and decentralized applications (DApps).",
  "Solana": "Solana is a high-performance blockchain supporting decentralized applications and crypto assets."
};



async function onLogin() {
  const clientData = [];
  const user = auth.currentUser;

  if (!user) {
    alert("Please log in first.");
    return;
  }
  try {
    const clientsRef = collection(db, 'clients');
    const querySnapshot = await getDocs(clientsRef);
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        const client = doc.data();

        if (client.userId === user.uid) {
          const clientDoc = {
            docRef: doc.ref,
            cryptoAssets: [],
            stockAssets: [],
            diffence: [],
          };
          if (Array.isArray(client.crypto)) {
            client.crypto.forEach((cryptoItem) => {
              const [name, price, quantity] = cryptoItem.split(',');
              clientDoc.cryptoAssets.push({
                type: 'Crypto',
                name,
                price: parseFloat(price),
                quantity,
              });
            });
          }
          if (Array.isArray(client.stocks)) {
            client.stocks.forEach((stockItem) => {
              const [name, price, quantity] = stockItem.split(',');
              clientDoc.stockAssets.push({
                type: 'Stock',
                name,
                price: parseFloat(price),
                quantity,
              });
            });
          }
          clientData.push(clientDoc);
        }
      });
    }
    const assetRef = collection(db, 'assets');
    const assetsquerySnapshot = await getDocs(assetRef);
    const globalAssets = [];
    if (!assetsquerySnapshot.empty) {
      assetsquerySnapshot.forEach((doc) => {
        const assets = doc.data();
        if (Array.isArray(assets.crypto)) {
          assets.crypto.forEach((cryptoItem) => {
            const [name, price] = cryptoItem.split(',');
            globalAssets.push({ type: 'Crypto', name, price: parseFloat(price) });
          });
        }
        if (Array.isArray(assets.shares)) {
          assets.shares.forEach((stockItem) => {
            const [name, price] = stockItem.split(',');
            globalAssets.push({ type: 'Stock', name, price: parseFloat(price) });
          });
        }
      });
    }
    clientData.forEach((client) => {
      client.cryptoAssets.forEach((cryptoAsset) => {
        const matchingGlobal = globalAssets.find(
          (globalAsset) => globalAsset.type === 'Crypto' && globalAsset.name === cryptoAsset.name
        );
        if (matchingGlobal) {
          const priceDifference = Math.abs(cryptoAsset.price - matchingGlobal.price);
          if (priceDifference >= 50) {
            client.diffence.push({
              name: cryptoAsset.name,
              oldPrice: cryptoAsset.price,
              newPrice: matchingGlobal.price,
            });
            cryptoAsset.price = matchingGlobal.price;
          }
        }
      });
      client.stockAssets.forEach((stockAsset) => {
        const matchingGlobal = globalAssets.find(
          (globalAsset) => globalAsset.type === 'Stock' && globalAsset.name === stockAsset.name
        );
        if (matchingGlobal) {
          const priceDifference = Math.abs(stockAsset.price - matchingGlobal.price);
          if (priceDifference >= 50) {
            client.diffence.push({
              name: stockAsset.name,
              oldPrice: stockAsset.price,
              newPrice: matchingGlobal.price,
            });
            stockAsset.price = matchingGlobal.price;
          }
        }
      });
    });
    const allDiffence = [];
    const firestoreUpdates = [];
    for (const client of clientData) {
      if (client.diffence.length > 0) {
        allDiffence.push(...client.diffence);
        const updatedCrypto = client.cryptoAssets.map(
          (crypto) => `${crypto.name},${crypto.price},${crypto.quantity}`
        );
        const updatedStocks = client.stockAssets.map(
          (stock) => `${stock.name},${stock.price},${stock.quantity}`
        );
        firestoreUpdates.push({
          docRef: client.docRef,
          updatedCrypto,
          updatedStocks,
        });
      }
    }
    if (allDiffence.length > 0) {
      console.table(allDiffence);
      const alertMessages = allDiffence.map(
        (d) => `Name: ${d.name}, Old Price: ${d.oldPrice}, New Price: ${d.newPrice}`
      ).join('\n');
      alert(`Assets with a price difference of 50 or more have been updated:\n${alertMessages}`);
      for (const { docRef, updatedCrypto, updatedStocks } of firestoreUpdates) {
        await updateDoc(docRef, {
          crypto: updatedCrypto,
          stocks: updatedStocks,
        });
      }
    }
  } catch (error) {
    console.error("Error fetching or updating client assets:", error.message);
  }
}



onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User is logged in:", user);
    await onLogin();
  } else {
    console.log("No user is logged in.");
  }
});


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
    await signInWithPopup(auth, provider).then(async () => {
      console.log("Login successful");
      await onLogin();
      window.location.href = 'mainwebpage.html'; 
    }).catch((error) => {
      console.error("Error during login:", error.message);
    });
    return clientAssets;
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
    .then(async (userCredential) => {
      console.log("User logged in:", userCredential.user);
      alert("Login successful");
      await onLogin();
      window.location.href = 'mainwebpage.html';
    })
    .catch((error) => {
      console.error("Login failed", error.message);
      alert("Login failed: " + error.message);
    });
    return clientAssets;

  }
);
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

  createUserWithEmailAndPassword(auth, email, password, name)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("User registered", user);
      alert("User has registered successfully");
      window.location.href = "mainwebpage.html";
    })
    .catch((error) => {
      if (error.code === 'auth/email-already-in-use') {
        alert("This email is already registered.");
      } else {
        console.error("Error during registration", error.message);
        alert("Registration failed" + error.message);
      }
    });
}



async function handleFormSubmit(e) {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to add clients");
    return;
  }
  const companyName = document.getElementById('managercompanies').value;
  const contactNumber = document.getElementById('contactnumber').value;
  if (!companyName || !contactNumber) {
    alert("Please fill in both Company Name and Contact Number.");
    return;
  } else {
    try {
      const assetsRef = collection(db, 'assets');
      const assetsSnapshot = await getDocs(assetsRef);
      if (assetsSnapshot.empty) {
        console.error("Assets data not found in Firestore");
        return;
      }
      const assetsDoc = assetsSnapshot.docs[0];
      const assetsData = assetsDoc.data();
      const createAssetList = (assetArray) => {
        return assetArray.map(assetStr => {
          const [name, price] = assetStr.split(',');
          return `${name},${price},0`;
        });
      };
      const cryptoAssets = createAssetList(assetsData.crypto);
      const stockAssets = createAssetList(assetsData.shares);
      const clientRef = doc(collection(db, 'clients'));
      await setDoc(clientRef, {
        managercompanies: companyName,
        contactnumber: contactNumber,
        userId: user.uid,
      });
      await updateDoc(clientRef, {
        crypto: arrayUnion(...cryptoAssets),
        stocks: arrayUnion(...stockAssets),
      });
      console.log("Client added successfully");
      statusMessage.textContent = "Client added successfully";
      statusMessage.style.display = 'block';
      managerForm.reset();
    } catch (error) {
      console.error("Error adding client", error);
      statusMessage.textContent = "Error adding client.";
      statusMessage.style.display = 'block';
    }
  }
}
const managerForm = document.getElementById('managerform');
if (managerForm) {
  managerForm.addEventListener('submit', handleFormSubmit);
}





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
      clientsContainer.innerHTML = '<p>Error loading clients.</p>';
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


const clientSelect = document.getElementById('clientSelect');
const purchaseStatus = document.getElementById('purchaseStatus');
const assetNameSelect = document.getElementById('assetName');
const assetPriceInput = document.getElementById('assetPrice');
const assetTypeSelect = document.getElementById('assetType');




if (purchaseForm) {
    async function fetchAssetPrices() {
        const assetPrices = {
            shares: {},
            crypto: {}
        };
        try {
            const assetsRef = collection(db, 'assets');
            const querySnapshot = await getDocs(assetsRef);
            querySnapshot.forEach((doc) => {
                const assets = doc.data();
                if (assets.shares) {
                    assets.shares.forEach((shares) => {
                        const [symbol, price] = shares.split(',');
                        assetPrices.shares[symbol.toLowerCase()] = price;
                    });
                }
                if (assets.crypto) {
                    assets.crypto.forEach((crypto) => {
                        const [symbol, price] = crypto.split(',');
                        assetPrices.crypto[symbol.toLowerCase()] = price;
                    });
                }
            });
        } catch (error) {
            console.error("Error fetching asset prices:", error);
        }
        return assetPrices;
    }
    async function updateAssetOptions() {
        const assetType = assetTypeSelect.value;
        assetNameSelect.innerHTML = '';
        let options = [];
        const assetPrices = await fetchAssetPrices();
        if (assetType === 'stocks') {
            options = Object.keys(assetPrices.shares);
        } else if (assetType === 'crypto') {
            options = Object.keys(assetPrices.crypto);
        }

        options.forEach(asset => {
            const option = document.createElement('option');
            option.value = asset;
            option.textContent = asset;
            assetNameSelect.appendChild(option);
        });
        if (options.length > 0) {
            const firstAsset = options[0];
            const price = assetType === 'stocks' ? assetPrices.shares[firstAsset] : assetPrices.crypto[firstAsset];
            assetPriceInput.value = price ? parseFloat(price).toFixed(2) : '';
        }
    }
    if (assetNameSelect) {
        assetNameSelect.addEventListener('change', async () => {
            const selectedAsset = assetNameSelect.value;
            const assetType = assetTypeSelect.value;
            const assetPrices = await fetchAssetPrices();
            let price = '';
            if (assetType === 'stocks' && assetPrices.shares[selectedAsset]) {
                price = assetPrices.shares[selectedAsset];
            } else if (assetType === 'crypto' && assetPrices.crypto[selectedAsset]) {
                price = assetPrices.crypto[selectedAsset];
            }
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
            purchaseStatus.textContent = "Error loading clients.";
            purchaseStatus.style.color = 'red';
        }
    }

    async function addAssetToClient(clientId, assetType, assetName, assetPrice, assetQuantity) {
        try {
            const clientRef = doc(db, 'clients', clientId);
            const clientSnap = await getDoc(clientRef);
            if (!clientSnap.exists()) {
                throw new Error("Client does not exist.");
            }
            const clientData = clientSnap.data();
            const assets = clientData[assetType] || [];
            let assetExists = false;
            const updatedAssets = assets.map((asset) => {
                const [name, price, quantity] = asset.split(',');
                if (name === assetName) {
                    assetExists = true;
                    const newQuantity = parseInt(quantity, 10) + assetQuantity;
                    return `${name},${price},${newQuantity}`;
                }
                return asset;
            });
            if (!assetExists) {
                updatedAssets.push(`${assetName},${assetPrice},${assetQuantity}`);
            }
            const updateData = {
                [assetType]: updatedAssets
            };
            await updateDoc(clientRef, updateData);
            return "Asset added successfully!";
        } catch (error) {
            console.error("Error adding asset:", error);
            throw new Error("Failed to add asset.");
        }
    }
    paypal.Buttons({
        createOrder: (data, actions) => {
            const assetPrice = parseFloat(assetPriceInput.value);
            const assetQuantity = parseInt(document.getElementById('assetQuantity').value, 10);
            const clientSelect = document.getElementById('clientSelect');
            const selectedClient = clientSelect.value;
            console.log(selectedClient)
            if (selectedClient == "") {
                throw new Error("No client selected");
            }
            if (isNaN(assetPrice) || isNaN(assetQuantity) || assetQuantity <= 0) {
                throw new Error("Invalid asset price or quantity or no client");
            }
            const totalAmount = (assetPrice * assetQuantity).toFixed(2);
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: totalAmount,
                    }
                }]
            });
        },

        onApprove: (data, actions) => {
            return actions.order.capture().then((details) => {
                const payerName = details.payer.name.given_name;
                purchaseStatus.textContent = `Payment successful! Thank you, ${payerName}.`;
                purchaseStatus.style.color = 'green';

                const clientId = clientSelect.value;
                const assetType = document.getElementById('assetType').value;
                const assetName = document.getElementById('assetName').value;
                const assetPrice = parseFloat(document.getElementById('assetPrice').value);
                const assetQuantity = parseInt(document.getElementById('assetQuantity').value, 10);

                if (clientId && assetType && assetName && !isNaN(assetPrice) && !isNaN(assetQuantity)) {
                    addAssetToClient(clientId, assetType, assetName, assetPrice, assetQuantity)
                        .then((message) => {
                            purchaseStatus.textContent += ` ${message}`;
                            purchaseForm.reset();
                        })
                        .catch((error) => {
                            console.error("Error updating client assets:", error);
                            purchaseStatus.textContent += "error updating client assets.";
                        });
                }
            });
        },

        onError: (err) => {
            console.error('PayPal Error:', err);
            purchaseStatus.textContent = "Invalid asset price or quantity";
            purchaseStatus.style.color = 'red';
        }
    }).render('#paypal-button-container');

    onAuthStateChanged(auth, (user) => {
        if (user) {
            fetchClientsForManager(user);
        } else {
            clientSelect.innerHTML = '<option value="">Please log in to view clients</option>';
        }
    });
}
//view predicted future prices 





//support from
const supportForm = document.getElementById('contactform');
if (supportForm) {
  supportForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to submit a for this page");
      return;
    }
    if (subject && message) {
      try {
        await addDoc(collection(db, "customersupport"), {
          subject: subject,
          message: message,
          userid: user.uid
        });
        alert('your form submitted successfully!');
        supportForm.reset();
      } catch (error) {
        console.error("Error adding document: ", error);
        alert('Failed to submit form');
      }
    } else {
      alert('Please fill in all fields.');
    }
  });
}

//review sForm
const reviewsForm = document.getElementById('reviewsForm');
if (reviewsForm) {
  reviewsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const rating = document.getElementById('rating').value;
    const reviewText = document.getElementById('reviews').value;

    if (rating && reviewText) {
      try {
        await addDoc(collection(db, "reviews"), {
          rating: rating,
          review: reviewText
        });
        alert('Review submitted successfully!');
        reviewsForm.reset();
      } catch (error) {
        console.error("Error adding document: ", error);
        alert('Failed to submit review');
      }
    } else {
      alert('Please fill in all fields.');
    }
  });
}



//information


const stockSelect = document.getElementById("stockName");
const cryptoSelect = document.getElementById("cryptoName");
const stockInfoDiv = document.getElementById("stockInfo");
const cryptoInfoDiv = document.getElementById("cryptoInfo");
if(stockSelect){
    stockSelect.addEventListener("change", function() {
      const selectedStock = stockSelect.value;
      if (selectedStock) {
        stockInfoDiv.textContent = stockInfo[selectedStock] || "No information available for this stock.";
      } else {
        stockInfoDiv.textContent = "";
      }
    });
    cryptoSelect.addEventListener("change", function() {
      const selectedCrypto = cryptoSelect.value;
      if (selectedCrypto) {
        cryptoInfoDiv.textContent = cryptoInfo[selectedCrypto] || "No information available for this cryptocurrency.";
      } else {
        cryptoInfoDiv.textContent = "";
      }
    });
  }