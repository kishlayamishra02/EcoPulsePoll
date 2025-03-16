//////////////////////////////////////////
// 1. Firebase Configuration
//////////////////////////////////////////
// Replace these values with your actual Firebase config.
const firebaseConfig = {
    apiKey: "AIzaSyDbkch3tEIbcecmakhCpggDkQimfKD6XFk",
    authDomain: "community-poll.firebaseapp.com",
    databaseURL: "https://community-poll-default-rtdb.firebaseio.com",
    projectId: "community-poll",
    storageBucket: "community-poll.firebasestorage.app",
    messagingSenderId: "535353009519",
    appId: "1:535353009519:web:da7a102056bfdf7826349a",
    measurementId: "G-80SR9GT34R"
  };
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  
  //////////////////////////////////////////
  // 2. Poll Reference and Initial Setup
  //////////////////////////////////////////
  
  const pollRef = db.ref("poll");
  
  // Initialize poll counts if not present
  pollRef.once("value", (snapshot) => {
    if (!snapshot.exists()) {
      pollRef.set({ option1: 0, option2: 0 });
    }
  });
  
  //////////////////////////////////////////
  // 3. Real-time Results Update
  //////////////////////////////////////////
  
  function updateResults() {
    pollRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        document.getElementById("resultsText").innerHTML = `
          Expand Green Spaces: ${data.option1} vote(s)<br>
          Improve Public Transportation: ${data.option2} vote(s)
        `;
      }
    });
  }
  updateResults();
  
  //////////////////////////////////////////
  // 4. Dynamic Background Change
  //////////////////////////////////////////
  
  function applyBackgroundTheme(vote) {
    const body = document.body;
    // Remove any previous theme classes (default, green, transport)
    body.classList.remove("default-bg", "bg-green", "bg-transport");
    // Apply new theme based on vote
    if (vote === "option1") {
      body.classList.add("bg-green");
    } else if (vote === "option2") {
      body.classList.add("bg-transport");
    }
  }
  
  //////////////////////////////////////////
  // 5. Vote Storage & UI Updates
  //////////////////////////////////////////
  
  // Get the user's current vote from localStorage
  function getUserVote() {
    return localStorage.getItem("ecopulseVote");
  }
  
  // Save the user's vote in localStorage
  function setUserVote(vote) {
    localStorage.setItem("ecopulseVote", vote);
  }
  
  // Update the vote message on the UI
  function refreshVoteUI() {
    const voteMsg = document.getElementById("voteMsg");
    const currentVote = getUserVote();
    if (currentVote) {
      voteMsg.textContent = `Your current vote: ${currentVote === "option1" ? "Expand Green Spaces" : "Improve Public Transportation"}. Click the other option to change your vote.`;
    } else {
      voteMsg.textContent = "";
    }
  }
  refreshVoteUI();
  
  //////////////////////////////////////////
  // 6. Vote Handlers (Allow Vote Change)
  //////////////////////////////////////////
  
  function castVote(newVote) {
    const previousVote = getUserVote();
    
    if (!previousVote) {
      // No previous vote: simply increment the chosen option
      pollRef.child(newVote).transaction((currentValue) => {
        return (currentValue || 0) + 1;
      }, (error, committed) => {
        if (!error && committed) {
          setUserVote(newVote);
          applyBackgroundTheme(newVote);
          refreshVoteUI();
        }
      });
    } else if (previousVote === newVote) {
      // Same vote selected, notify the user
      alert("You have already voted for this option.");
    } else {
      // Changing vote: decrement previous vote and increment new vote
      pollRef.child(previousVote).transaction((currentValue) => {
        return (currentValue || 0) - 1;
      }, (err, committed) => {
        if (!err && committed) {
          pollRef.child(newVote).transaction((currentValue) => {
            return (currentValue || 0) + 1;
          }, (error, committedNew) => {
            if (!error && committedNew) {
              setUserVote(newVote);
              applyBackgroundTheme(newVote);
              refreshVoteUI();
            }
          });
        }
      });
    }
  }
  
  document.getElementById("option1").addEventListener("click", () => {
    castVote("option1");
  });
  
  document.getElementById("option2").addEventListener("click", () => {
    castVote("option2");
  });
  
  // On page load, if a vote already exists, apply its background theme
  const initialVote = getUserVote();
  if (initialVote) {
    applyBackgroundTheme(initialVote);
  }
  