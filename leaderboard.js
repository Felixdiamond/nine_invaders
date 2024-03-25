import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCpraJx7F3MlhEiq0mSm0Zy20CBJCxaGqE",
  authDomain: "nine-invaders.firebaseapp.com",
  projectId: "nine-invaders",
  storageBucket: "nine-invaders.appspot.com",
  messagingSenderId: "234584173436",
  appId: "1:234584173436:web:e4640932abf8235b9692f9",
};

// Initialize Firebase app (assuming you've replaced placeholders)
const app = initializeApp(firebaseConfig);

// Get a reference to the Firestore database
const db = getFirestore(app);

// Create a reference to your leaderboard collection
const leaderboardRef = collection(db, "leaderboard");

async function readData() {
  try {
    const q = query(leaderboardRef, orderBy("score", "desc"));
    const querySnapshot = await getDocs(q);

    const data = [];
    let rank = 1; // Track rank for each entry

    querySnapshot.forEach((doc) => {
      const documentData = doc.data();
      data.push({
        rank: rank++,
        name: documentData.name,
        score: documentData.score,
      });
    });

    const tbody = document.getElementById("leaderboard-data");
    tbody.innerHTML = ""; // Clear existing content

    data.forEach((player) => {
      const tableRow = document.createElement("tr");
      const rankCell = document.createElement("td");
      const nameCell = document.createElement("td");
      const scoreCell = document.createElement("td");

      rankCell.classList.add("rank");
      rankCell.textContent = player.rank;
      nameCell.textContent = player.name;
      scoreCell.textContent = player.score;

      tableRow.appendChild(rankCell);
      tableRow.appendChild(nameCell);
      tableRow.appendChild(scoreCell);

      tbody.appendChild(tableRow);
    });
  } catch (error) {
    console.error("Error retrieving data:", error);
  }
}

readData();
