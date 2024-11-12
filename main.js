import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getFirestore, doc, collection, addDoc, setDoc  } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';





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

const managerForm = document.getElementById('managerform');
if (managerForm) {
    managerForm.addEventListener('submit', addClient); 
}

managerForm.addEventListener('submit', async (e) => {
  e.preventDefault(); 

  const companyName = document.getElementById('managercompanies').value;
  const contactNumber = document.getElementById('contactnumber').value;
  //const contactEmail = document.getElementById('contactemail').value;

  try {
      const clientRef = collection(db, 'clients');

      await addDoc(clientRef, {
          managercompanies: companyName,
          contactnumber: contactNumber,
         // contactemail: contactEmail,
          //createdAt: new Date().toISOString() 
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
