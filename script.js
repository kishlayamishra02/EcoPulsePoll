
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
  
