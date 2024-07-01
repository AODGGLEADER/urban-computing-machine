(function() {
    let menuVisible = false;
    let currentProfile = null;

    // Create menu container
    let menu = document.createElement('div');
    menu.id = 'player-selector-menu';
    menu.style.cssText = `
        position: fixed;
        top: 50px;
        left: 50px;
        width: 200px;
        background-color: rgba(0, 0, 0, 0.8);
        border: 2px solid #4CAF50;
        border-radius: 10px;
        padding: 10px;
        font-family: Arial, sans-serif;
        color: #ffffff;
        display: none;
        z-index: 1000;
    `;

    // Create title
    let title = document.createElement('div');
    title.textContent = 'Player Selector';
    title.style.cssText = `
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
        text-align: center;
        border-bottom: 1px solid #4CAF50;
        padding-bottom: 5px;
    `;
    menu.appendChild(title);

    // Create player list
    let playerList = document.createElement('ul');
    playerList.style.cssText = `
        list-style-type: none;
        padding: 0;
        margin: 0;
        max-height: 300px;
        overflow-y: auto;
    `;
    menu.appendChild(playerList);

    // Create toggle button
    let toggleButton = document.createElement('button');
    toggleButton.id = 'player-selector-toggle';
    toggleButton.textContent = 'Players';
    toggleButton.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        padding: 5px 10px;
        background-color: rgba(0, 0, 0, 0.7);
        border: 2px solid #4CAF50;
        border-radius: 5px;
        color: #ffffff;
        font-size: 14px;
        cursor: pointer;
        z-index: 1001;
    `;

    function safeGetPlayerName(entity) {
        try {
            if (entity && entity.$getName && typeof entity.$getName === 'function') {
                const nameObj = entity.$getName();
                if (nameObj && nameObj.$characters && nameObj.$characters.data) {
                    return new TextDecoder().decode(new Uint8Array(nameObj.$characters.data));
                }
            }
        } catch (error) {
            console.error("Error getting player name:", error);
        }
        return null;
    }

    function updatePlayerList() {
        try {
            if (Minecraft.$theWorld && Minecraft.$theWorld.$playerEntities && Minecraft.$theWorld.$playerEntities.$array1) {
                playerList.innerHTML = "";
                Minecraft.$theWorld.$playerEntities.$array1.forEach(entity => {
                    if (entity) {
                        let name = safeGetPlayerName(entity);
                        if (name) {
                            let li = document.createElement('li');
                            li.textContent = name + ((entity === Minecraft.$thePlayer) ? " (you)" : "");
                            li.style.cssText = `
                                padding: 5px 10px;
                                cursor: pointer;
                                transition: background-color 0.3s;
                            `;
                            li.onmouseover = () => { li.style.backgroundColor = 'rgba(76, 175, 80, 0.3)'; };
                            li.onmouseout = () => { li.style.backgroundColor = ''; };
                            li.onclick = () => selectPlayer(entity);
                            if (currentProfile === entity) {
                                li.style.backgroundColor = 'rgba(76, 175, 80, 0.5)';
                            }
                            playerList.appendChild(li);
                        }
                    }
                });
            }
        } catch (error) {
            console.error("Error updating player list:", error);
        }
    }

    function selectPlayer(player) {
        try {
            if (player) {
                currentProfile = player;
                Minecraft.$renderViewEntity = player;
                Minecraft.$gameSettings.$hideGUI = 0; // Show UI
                updatePlayerList();
            }
        } catch (error) {
            console.error("Error selecting player:", error);
        }
    }

    function toggleMenu() {
        try {
            menuVisible = !menuVisible;
            menu.style.display = menuVisible ? 'block' : 'none';
            if (menuVisible) {
                updatePlayerList();
            }
        } catch (error) {
            console.error("Error toggling menu:", error);
        }
    }

    toggleButton.addEventListener('click', toggleMenu);

    document.body.appendChild(menu);
    document.body.appendChild(toggleButton);

    // Ensure the toggle button is always visible
    setInterval(() => {
        if (!document.body.contains(toggleButton)) {
            document.body.appendChild(toggleButton);
        }
    }, 1000);

    // Update player list periodically when menu is open
    setInterval(() => {
        if (menuVisible) {
            updatePlayerList();
        }
    }, 5000);
})();
