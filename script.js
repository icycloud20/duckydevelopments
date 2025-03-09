/*******************************************
 * 1) Universe IDs for Your Games
 *******************************************/
const GAME_IDS = [
    7293135862,
    // Add more Universe IDs here...
  ];
  
  // Global totals
  let totalActivePlayers = 0;
  let totalVisits = 0;
  
  /*******************************************
   * 2) On Page Load, Fetch Game Data
   *******************************************/
  window.addEventListener("load", () => {
    loadAllGames();
  });
  
  /*******************************************
   * 3) Load All Games, Sum Stats
   *******************************************/
  function loadAllGames() {
    // Create an array of Promises
    const fetchPromises = GAME_IDS.map(id => fetchGameDataAndIcon(id));
  
    Promise.all(fetchPromises)
      .then(results => {
        results.forEach(result => {
          if (result.success) {
            const { data, iconUrl } = result;
            addGameCard(data, iconUrl);
            totalActivePlayers += data.playing;
            totalVisits += data.visits;
          }
        });
        // Update the totals in the hero
        document.getElementById("totalPlayers").textContent = formatNumber(totalActivePlayers);
        document.getElementById("totalVisits").textContent = formatNumber(totalVisits);
      })
      .catch(error => {
        console.error("Error loading games:", error);
      });
  }
  
  /*******************************************
   * 4) Fetch Game Data & Icon
   *******************************************/
  function fetchGameDataAndIcon(universeId) {
    const gameDataUrl = `https://game-api.glitch.me/data?id=${universeId}`;
    const iconUrl = `https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=512x512&format=Png&isCircular=false`;
  
    const fetchGameData = fetchAllOrigins(gameDataUrl);
    const fetchIconData = fetchAllOrigins(iconUrl);
  
    return Promise.all([fetchGameData, fetchIconData])
      .then(([gameDataResponse, iconDataResponse]) => {
        const gameDataParsed = JSON.parse(gameDataResponse.contents);
        const iconDataParsed = JSON.parse(iconDataResponse.contents);
  
        if (!gameDataParsed.success) {
          return { success: false };
        }
  
        let icon = "";
        if (iconDataParsed.data && iconDataParsed.data.length > 0) {
          icon = iconDataParsed.data[0].imageUrl || "";
        }
  
        return {
          success: true,
          data: gameDataParsed.data,
          iconUrl: icon
        };
      })
      .catch(err => {
        console.error("Error fetching data/icon:", err);
        return { success: false };
      });
  }
  
  /*******************************************
   * 5) AllOrigins Helper for CORS
   *******************************************/
  function fetchAllOrigins(url) {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    return fetch(proxyUrl).then(r => r.json());
  }
  
  /*******************************************
   * 6) Create & Display a Game Card
   *******************************************/
  function addGameCard(gameData, iconUrl) {
    const gamesContainer = document.getElementById("gamesContainer");
    const card = document.createElement("div");
    card.className = "game-card";
  
    // Fallback if icon is missing
    // const fallbackIcon = `https://www.roblox.com/asset-thumbnail/image?assetId=${gameData.id}&width=420&height=420&format=png`;
    // const finalIconUrl = iconUrl || fallbackIcon;
  
    card.innerHTML = `
      <img src="${iconUrl}" alt="${gameData.name}" />
      <div class="game-info">
        <h3 class="game-title">${gameData.name}</h3>
        <div class="game-stats">
          <p>${formatNumber(gameData.playing)} active players</p>
          <p>${formatNumber(gameData.visits)} visits</p>
        </div>
      </div>
    `;
  
    gamesContainer.appendChild(card);
  }
  
  /*******************************************
   * 7) Format Large Numbers
   *******************************************/
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  
  /*******************************************
   * 8) Contact Form Submission via EmailJS
   *******************************************/
  function sendEmail(e) {
    e.preventDefault();
  
    // 'contactForm' is the form ID in index.html
    emailjs.sendForm("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", "#contactForm")
      .then(response => {
        console.log("SUCCESS!", response.status, response.text);
        document.getElementById("formStatus").textContent = "Message sent successfully!";
        document.getElementById("formStatus").style.color = "limegreen";
        // Optionally reset the form
        e.target.reset();
      })
      .catch(err => {
        console.error("FAILED...", err);
        document.getElementById("formStatus").textContent = "Failed to send message. Please try again later.";
        document.getElementById("formStatus").style.color = "red";
      });
  }
  