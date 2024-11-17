import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getFirestore, doc, collection, addDoc, setDoc, getDocs   } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';

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

document.addEventListener('DOMContentLoaded', () => {
  const clientsContainer = document.getElementById('clients-container');

  if (!clientsContainer) {
    console.error('clients-container not found in the DOM');
    return;
  }

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
            <h3>${client.managercompanies}</h3>
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
});
