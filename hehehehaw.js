(function() {
    let decoder = new TextDecoder();
    let listPseudos;
    let menuVisible = false;
    let profile;

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

    // Create player select
    let select = document.createElement('select');
    select.style.cssText = `
        width: 100%;
        padding: 5px;
        margin-top: 10px;
        background-color: rgba(0, 0, 0, 0.7);
        color: #ffffff;
        border: 1px solid #4CAF50;
        border-radius: 5px;
    `;
    menu.appendChild(select);

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

    select.addEventListener('mousedown', function (e) {
        if (Minecraft.$theWorld) {
            select.innerHTML = "";
            listPseudos = [];
            Minecraft.$theWorld.$playerEntities.$array1.data.forEach(element => {
                if (element) {
                    listPseudos.push(decoder.decode(new Uint8Array(element.$getName().$characters.data)));
                }
            });
            listPseudos.forEach(element => {
                let option = document.createElement('option');
                option.innerText = element + ((listPseudos.indexOf(element) === 0)?" (you)":"");
                option.value = element;
                select.appendChild(option);
            });
            if (document.querySelector(`option[value="${Minecraft.$renderViewEntity.$getName()}"]`)) {
                document.querySelector(`option[value="${Minecraft.$renderViewEntity.$getName()}"]`).toggleAttribute('selected');
            }
        }
    });

    function keepLoadedPlayer() {
        if (profile !== Minecraft.$thePlayer) {
            Minecraft.$renderViewEntity = Minecraft.$thePlayer;
            setTimeout(function() {Minecraft.$renderViewEntity = profile;}, 0);
        }
    }

    select.addEventListener('change', function (e) {
        window.profile = Minecraft.$theWorld.$playerEntities.$array1.data.find(function (element) {
            if (element) {
                return element.$getName() == select.value;
            } else {
                return null;
            }
        });
        if (profile) {
            Minecraft.$renderViewEntity = profile;
            if (typeof(keepLoadedPlayerInterval) !== "undefined") {
                clearInterval(keepLoadedPlayerInterval);
            }
            if (profile === Minecraft.$thePlayer) {
                Minecraft.$gameSettings.$hideGUI = 0;
            } else {
                Minecraft.$gameSettings.$hideGUI = 0; // Changed to 0 to keep UI visible
                window.keepLoadedPlayerInterval = setInterval(keepLoadedPlayer, 1000);
            }
        }
    });

    function toggleMenu() {
        menuVisible = !menuVisible;
        menu.style.display = menuVisible ? 'block' : 'none';
        if (menuVisible) {
            select.dispatchEvent(new Event('mousedown'));
        }
    }

    toggleButton.addEventListener('click', toggleMenu);

    ModAPI.addEventListener("frame", () => {
        if (Minecraft.$theWorld && Minecraft.$theWorld.$playerEntities.$array1.data.length > 1) {
            toggleButton.style.display = "block";
        } else {
            toggleButton.style.display = "none";
        }
    });

    document.body.appendChild(menu);
    document.body.appendChild(toggleButton);
})();
