// Crate Coffee Co — Firebase bootstrap
// Uses the Firebase "compat" SDKs (loaded via <script> tags in each page)
// so this whole site runs from plain HTML/CSS/JS with no build step.

const firebaseConfig = {
  apiKey: "AIzaSyDLPAfokHz2ZHdRh8ppAEsdWHCkeloI1g0",
  authDomain: "doorskill-beff1.firebaseapp.com",
  databaseURL: "https://doorskill-beff1-default-rtdb.firebaseio.com",
  projectId: "doorskill-beff1",
  storageBucket: "doorskill-beff1.firebasestorage.app",
  messagingSenderId: "620272735898",
  appId: "1:620272735898:web:b35d24737ef79c01a67123",
  measurementId: "G-BNMTE2V0B2"
};

firebase.initializeApp(firebaseConfig);

// Analytics can fail silently if blocked by an ad blocker / offline — never
// let it break the rest of the app.
try { firebase.analytics(); } catch (e) { /* analytics unavailable, ignore */ }

const db = firebase.firestore();
const auth = firebase.auth();

// Firestore works offline-first with cached data when possible, which keeps
// the demo usable even on a flaky connection.
db.enablePersistence({ synchronizeTabs: true }).catch(() => {});

const COLLECTIONS = {
  products: 'products',
  orders: 'orders',
  settings: 'settings'
};
