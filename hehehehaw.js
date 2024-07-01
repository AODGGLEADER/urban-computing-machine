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
    `;
    document.head.appendChild(style);

    function updatePlayerList() {
        if (Minecraft.$theWorld) {
            playerList.innerHTML = "";
            listPseudos = [];
            Minecraft.$theWorld.$playerEntities.$array1.data.forEach(entity => {
                if (entity && entity.$getName && typeof entity.$getName === 'function') {
                    let name = decoder.decode(new Uint8Array(entity.$getName().$characters.data));
                    if (!listPseudos.includes(name)) {
                        listPseudos.push(name);
                    }
                }
            });
            listPseudos.sort((a, b) => a.localeCompare(b));
            listPseudos.forEach(name => {
                let li = document.createElement('li');
                li.textContent = name + ((name === Minecraft.$thePlayer.$getName()) ? " (you)" : "");
                li.onclick = () => selectPlayer(name);
                if (currentProfile && currentProfile.$getName() === name) {
                    li.classList.add('selected');
                }
                playerList.appendChild(li);
            });
        }
    }

    function selectPlayer(name) {
        currentProfile = Minecraft.$theWorld.$playerEntities.$array1.data.find(element => {
            return element && element.$getName && element.$getName() === name;
        });
        if (currentProfile) {
            Minecraft.$renderViewEntity = currentProfile;
            if (currentProfile === Minecraft.$thePlayer) {
                Minecraft.$gameSettings.$hideGUI = 0;
                Minecraft.$thePlayer.$inventory.$markDirty();
            } else {
                Minecraft.$gameSettings.$hideGUI = 0;
            }
            updatePlayerList(); // Refresh the list to show the new selection
        }
    }

    function updateSpectatorView() {
        if (currentProfile && currentProfile !== Minecraft.$thePlayer) {
            if (Minecraft.$renderViewEntity !== currentProfile) {
                Minecraft.$renderViewEntity = currentProfile;
                Minecraft.$thePlayer.$inventory.$markDirty();
            }
            for (let i = 0; i < 36; i++) {
                Minecraft.$thePlayer.$inventory.$mainInventory.$array1.data[i] = currentProfile.$inventory.$mainInventory.$array1.data[i];
            }
            Minecraft.$thePlayer.$inventory.$currentItem = currentProfile.$inventory.$currentItem;
        }
    }

    function toggleMenu() {
        menuVisible = !menuVisible;
        menu.style.display = menuVisible ? 'block' : 'none';
        if (menuVisible) {
            updatePlayerList();
        }
    }

    ModAPI.addEventListener("frame", () => {
        if (Minecraft.$theWorld && Minecraft.$theWorld.$playerEntities.$array1.data.length > 1) {
            updateSpectatorView();
        }
    });

ModAPI.addEventListener("key", (event) => {
    // Check for both '=' and '+' keys
    if ((event.key === 187 || event.key === 61 || event.key === '=' || event.key === '+') && event.type === "keydown") {
        toggleMenu();
        event.preventDefault(); // Prevent default action
    }
});

    // Make the menu draggable
    let isDragging = false;
    let dragOffsetX, dragOffsetY;

    title.addEventListener('mousedown', function(e) {
        isDragging = true;
        dragOffsetX = e.clientX - menu.offsetLeft;
        dragOffsetY = e.clientY - menu.offsetTop;
    });

    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            menu.style.left = (e.clientX - dragOffsetX) + 'px';
            menu.style.top = (e.clientY - dragOffsetY) + 'px';
        }
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
    });

    document.body.appendChild(menu);
})();
