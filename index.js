import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyBL_2nfEkNycBr_VlF3K2sqLxUkk6bKpzc",
  authDomain: "group-project-af653.firebaseapp.com",
  projectId: "group-project-af653",
  storageBucket: "group-project-af653.appspot.com",
  messagingSenderId: "217879299324",
  appId: "1:217879299324:web:5263f3dff4358bd0650379",
  measurementId: "G-SL1TS9GSCB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new GoogleAuthProvider();

const modal = document.getElementById('loginModal');
const openPopup = document.getElementById('openPopup');
const closePopup = document.getElementById('closePopup');
const toLogin = document.getElementById('login');
const statusMessage = document.getElementById('statusMessage');




openPopup.onclick = function() {
  modal.style.display = 'block';
};

closePopup.onclick = function() {
  modal.style.display = 'none';
  statusMessage.style.display = 'none';
};

toLogin.onclick = async function() {
  statusMessage.style.display = 'block';
  statusMessage.textContent = 'Attempting to log in';

  
  await signInWithPopup(auth, provider).then(() => {
    window.location.href = 'main_webpage.html';
})
};
 


window.addEventListener('load', function() {
    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', registerUser);
});



function registerUser(event) {
    event.preventDefault(); 
    const name = document.getElementById('nameRegister').value;
    const email = document.getElementById('loginEmailRegister').value;
    const password = document.getElementById('userPasswordRegister').value;

    createUserWithEmailAndPassword(auth,email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            
        })
        .then(() => {
            alert("User has registered");

            window.location.href = "main_webpage.html";
        })
}
