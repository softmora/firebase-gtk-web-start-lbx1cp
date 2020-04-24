// Import stylesheets
import "./style.css";
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

import * as firebaseui from "firebaseui";

// Document elements
const startRsvpButton = document.getElementById("starSRVP");
const guestbookContainer = document.getElementById("guestbook-container");

const form = document.getElementById("leave-message");
const input = document.getElementById("message");
const guestbook = document.getElementById("guestbook");
const numberAttending = document.getElementById("number-attending");
const rsvpYes = document.getElementById("rsvp-yes");
const rsvpNo = document.getElementById("rsvp-no");

var rsvpListener = null;
var guestbookListener = null;

// Add Firebase project configuration object here
// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyD1x9DUjlBrFsPrd0AfWXjDMI9ewj3WPII",
  authDomain: "fir-web-codelab-f7b64.firebaseapp.com",
  databaseURL: "https://fir-web-codelab-f7b64.firebaseio.com",
  projectId: "fir-web-codelab-f7b64",
  storageBucket: "fir-web-codelab-f7b64.appspot.com",
  messagingSenderId: "132686391375",
  appId: "1:132686391375:web:14dec389bde255dde7a23a"
};

firebase.initializeApp(firebaseConfig);

// FirebaseUI config
const uiConfig = {
  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
  signInOptions: [
    // Email / Password Provider.
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      // Handle sign-in.
      // Return false to avoid redirect.
      return false;
    }
  }
};

const ui = new firebaseui.auth.AuthUI(firebase.auth());

startRsvpButton.addEventListener("click", () => {
  //verifica si el usuario esta logueado
  if (firebase.auth().currentUser) {
    //deslogue al usuario
    firebase.auth().signOut();
  } else {
    ui.start("#firebaseui-auth-container", uiConfig);
  }
});
//verificar si el estado del usuario cambio
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    startRsvpButton.textContent = "LOGOUT";
    guestbookContainer.style.display = "block";
  } else {
    startRsvpButton.textContent = "RSVP";
    guestbookContainer.style.display = "none";
  }
});

form.addEventListener("submit", e => {
  e.preventDefault();
  console.log('test');
  firebase
    .firestore()
    .collection("guestbook")
    .add({
      text: input.value,
      timestamp: Date.now(),
      name: firebase.auth().currentUser.displayName,
      userId: firebase.auth().currentUser.uid
    });
});


// Create query for messages
firebase.firestore().collection("guestbook")
.orderBy("timestamp","desc")
.onSnapshot((snaps) => {
// Reset page
guestbook.innerHTML = "";
// Loop through documents in database
snaps.forEach((doc) => {
// Create an HTML entry for each document and add it to the chat
const entry = document.createElement("p");
entry.textContent = doc.data().name + ": " + doc.data().text;
guestbook.appendChild(entry);
});
});



// ...
// Unsubscribe from guestbook updates
function unsubscribeGuestbook(){
if (guestbookListener != null)
{
guestbookListener();
guestbookListener = null;
}
};

// Listen to RSVP responses
rsvpYes.onclick = () => {
// Get a reference to the user's document in the attendees collection
const userDoc = firebase.firestore().collection('attendees').doc(firebase.auth().currentUser.uid);

// If they RSVP'd yes, save a document with attending: true
userDoc.set({
attending: true
}).catch(console.error)
}

rsvpNo.onclick = () => {
// Get a reference to the user's document in the attendees collection
const userDoc = firebase.firestore().collection('attendees').doc(firebase.auth().currentUser.uid);

// If they RSVP'd yes, save a document with attending: true
userDoc.set({
attending: false
}).catch(console.error)
}

// Listen for attendee list
firebase.firestore()
.collection('attendees')
.where("attending", "==", true)
.onSnapshot(snap => {
const newAttendeeCount = snap.docs.length;

numberAttending.innerHTML = newAttendeeCount+' people going';
})



function subscribeCurrentRSVP(user){
rsvpListener = firebase.firestore()
.collection('attendees')
.doc(user.uid)
.onSnapshot((doc) => {
if (doc && doc.data()){
const attendingResponse = doc.data().attending;

// Update css classes for buttons
if (attendingResponse){
rsvpYes.className="clicked";
rsvpNo.className="";
}
else{
rsvpYes.className="";
rsvpNo.className="clicked";
}
}
}); 
}