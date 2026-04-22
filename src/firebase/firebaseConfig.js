// Import Firebase dependencies
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDQvZ1tR9X72HhAFUWyEltIirBhc0teTD4",
    authDomain: "aspirebrand-2f47a.firebaseapp.com",
    projectId: "aspirebrand-2f47a",
    storageBucket: "aspirebrand-2f47a.firebasestorage.app",
    messagingSenderId: "561081379745",
    appId: "1:561081379745:android:61e37959ffe9684d3ab9e0"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Export authentication instance
export const auth = getAuth(app);
export default app;