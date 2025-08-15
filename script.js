/*const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};*/
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  

  
  const pollRef = db.ref("poll");
  
  pollRef.once("value", (snapshot) => {
    if (!snapshot.exists()) {
      pollRef.set({ option1: 0, option2: 0 });
    }
  });
  

  
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
  

  
  function applyBackgroundTheme(vote) {
    const body = document.body;

    body.classList.remove("default-bg", "bg-green", "bg-transport");
  
    if (vote === "option1") {
      body.classList.add("bg-green");
    } else if (vote === "option2") {
      body.classList.add("bg-transport");
    }
  }
  

  
  function getUserVote() {
    return localStorage.getItem("ecopulseVote");
  }
  
  // Save the user's vote in localStorage
  function setUserVote(vote) {
    localStorage.setItem("ecopulseVote", vote);
  }
  

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
  

  function castVote(newVote) {
    const previousVote = getUserVote();
    
    if (!previousVote) {
     
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
      
      alert("You have already voted for this option.");
    } else {

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
  
  const initialVote = getUserVote();
  if (initialVote) {
    applyBackgroundTheme(initialVote);
  }
  


