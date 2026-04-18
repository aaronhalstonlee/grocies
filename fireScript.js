// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js"
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAea2B0_bvxYJH32l6e4sOzeXeR3KYc6Fg",
  authDomain: "grocies-8107a.firebaseapp.com",
  projectId: "grocies-8107a",
  storageBucket: "grocies-8107a.firebasestorage.app",
  messagingSenderId: "875489676901",
  appId: "1:875489676901:web:0f2bcd62c3335841db808c",
  measurementId: "G-2ESYQW7GN3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

//backup to cloud
async function saveToCloud() {
  const meals =   JSON.parse(localStorage.getItem('meals')) || [];
  const staples = JSON.parse(localStorage.getItem('staples')) || [];

  try {
    //save under a unique key
    await set(ref(db, 'userData/'), {meals, staples, timestamp: Date.now() });
    alert("Data safely backed up to FireBase!");
  } catch (error) {
    console.error("Firebase save error:", error);
    alert("Failed to save. Check console for details.");
  }
}

//sync from cloud
async function syncFromCloud() {
  try {
    const snapshot = await get(ref(db, "userData/"));
    if (!snapshot.exists()) {
      alert("No data found in the cloud.");
      return;
    }

    const cloudData = snapshot.val();
    const localMeals = JSON.parse(localStorage.getItem("meals")) || [];

    //check if cloud data is different than local
    if (JSON.stringify(cloudData.meals) == JSON.stringify(localMeals)) {
      alert("Your local data is already up to date.");
      return;
    }

    const confirmSync = confirm("Cloud data is different, overwrite current version with cloud version?");
    if (confirmSync) { 
      localStorage.setItem('meals', JSON.stringify(cloudData.meals));
      localStorage.setItem('staples', JSON.stringify(cloudData.staples));
      location.reload();
    }
  } catch (error) {
    console.error("Firebase sync error:", error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('btnSaveCloud');
  const syncBtn = document.getElementById('btnSyncCloud');
  
  if (saveBtn) saveBtn.addEventListener('click', saveToCloud);
  if (syncBtn) syncBtn.addEventListener('click', syncFromCloud);
});
