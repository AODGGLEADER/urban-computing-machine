(function() {
    let decoder = new TextDecoder();
    let listPseudos;
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
        font-family: 'Minecraft', Arial, sans-serif;
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
    toggleButton.textContent = '👥';
    toggleButton.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        width: 40px;
        height: 40px;
        background-color: rgba(0, 0, 0, 0.7);
        border: 2px solid #4CAF50;
        border-radius: 50%;
        color: #ffffff;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: all 0.3s ease;
        z-index: 1001;
    `;

    // Create and append style element
    let style = document.createElement('style');
    style.textContent = `
        @font-face {
            font-family: 'Minecraft';
            src: url('https://cdn.jsdelivr.net/gh/South-Paw/typeface-minecraft@master/fonts/minecraft.woff2') format('woff2');
        }
        #player-selector-menu ul::-webkit-scrollbar {
            width: 8px;
        }
        #player-selector-menu ul::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.1);
        }
        #player-selector-menu ul::-webkit-scrollbar-thumb {
            background-color: #4CAF50;
            border-radius: 4px;
        }
        #player-selector-menu li {
            padding: 5px 10px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        #player-selector-menu li:hover {
            background-color: rgba(76, 175, 80, 0.3);
        }
        #player-selector-menu li.selected {
            background-color: rgba(76, 175, 80, 0.5);
        }
        #player-selector-toggle:hover {
            background-color: rgba(76, 175, 80, 0.5);
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(style);

    function safeGetPlayerName(entity) {
        try {
            if (entity && entity.$getName && typeof entity.$getName === 'function') {
                const nameObj = entity.$getName();
                if (nameObj && nameObj.$characters && nameObj.$characters.data) {
                    return decoder.decode(new Uint8Array(nameObj.$characters.data));
                }
            }
        } catch (error) {
            console.error("Error getting player name:", error);
        }
        return null;
    }

    function updatePlayerList() {
        if (Minecraft.$theWorld && Minecraft.$theWorld.$playerEntities && Minecraft.$theWorld.$playerEntities.$array1) {
            playerList.innerHTML = "";
            listPseudos = [];
            Minecraft.$theWorld.$playerEntities.$array1.forEach(entity => {
                const name = safeGetPlayerName(entity);
                if (name && !listPseudos.includes(name)) {
                    listPseudos.push(name);
                }
            });
            listPseudos.sort((a, b) => a.localeCompare(b));
            listPseudos.forEach(name => {
                let li = document.createElement('li');
                li.textContent = name + ((name === safeGetPlayerName(Minecraft.$thePlayer)) ? " (you)" : "");
                li.onclick = () => selectPlayer(name);
                if (currentProfile && safeGetPlayerName(currentProfile) === name) {
                    li.classList.add('selected');
                }
                playerList.appendChild(li);
            });
        }
    }

    function selectPlayer(name) {
        currentProfile = Minecraft.$theWorld.$playerEntities.$array1.find(element => safeGetPlayerName(element) === name);
        if (currentProfile) {
            Minecraft.$renderViewEntity = currentProfile;
            if (currentProfile === Minecraft.$thePlayer) {
                Minecraft.$gameSettings.$hideGUI = 0;
                Minecraft.$thePlayer.$inventory.$markDirty();
            } else {
                Minecraft.$gameSettings.$hideGUI = 0;
            }
            updatePlayerList();
        }
    }

    function updateSpectatorView() {
        if (currentProfile && currentProfile !== Minecraft.$thePlayer) {
            if (Minecraft.$renderViewEntity !== currentProfile) {
                Minecraft.$renderViewEntity = currentProfile;
                Minecraft.$thePlayer.$inventory.$markDirty();
            }
            if (currentProfile.$inventory && currentProfile.$inventory.$mainInventory && 
                Minecraft.$thePlayer.$inventory && Minecraft.$thePlayer.$inventory.$mainInventory) {
                for (let i = 0; i < 36; i++) {
                    Minecraft.$thePlayer.$inventory.$mainInventory.$array1.data[i] = 
                        currentProfile.$inventory.$mainInventory.$array1.data[i];
                }
                Minecraft.$thePlayer.$inventory.$currentItem = currentProfile.$inventory.$currentItem;
            }
        }
    }

    function toggleMenu() {
        menuVisible = !menuVisible;
        menu.style.display = menuVisible ? 'block' : 'none';
        if (menuVisible) {
            updatePlayerList();
        }
    }

    toggleButton.addEventListener('click', toggleMenu);

    ModAPI.addEventListener("frame", () => {
        if (Minecraft.$theWorld && Minecraft.$theWorld.$playerEntities && 
            Minecraft.$theWorld.$playerEntities.$array1 && 
            Minecraft.$theWorld.$playerEntities.$array1.length > 1) {
            updateSpectatorView();
            toggleButton.style.display = 'flex';
        } else {
            toggleButton.style.display = 'none';
        }
    });

    // Make the menu draggable
    function makeDraggable(element) {
        let isDragging = false;
        let dragOffsetX, dragOffsetY;

        element.addEventListener('mousedown', function(e) {
            isDragging = true;
            dragOffsetX = e.clientX - element.offsetLeft;
            dragOffsetY = e.clientY - element.offsetTop;
        });

        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                element.style.left = (e.clientX - dragOffsetX) + 'px';
                element.style.top = (e.clientY - dragOffsetY) + 'px';
            }
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
        });
    }

    makeDraggable(menu);
    makeDraggable(toggleButton);

    document.body.appendChild(menu);
    document.body.appendChild(toggleButton);
})();
