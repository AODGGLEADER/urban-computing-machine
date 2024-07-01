(function() {
    let decoder = new TextDecoder();
    let listPseudos;

    // Create and style the select element
    let select = document.createElement('select');
    select.id = 'player-selector';
    select.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        padding: 5px 10px;
        font-family: 'Minecraft', Arial, sans-serif;
        font-size: 16px;
        color: #ffffff;
        background-color: rgba(0, 0, 0, 0.7);
        border: 2px solid #ffffff;
        border-radius: 5px;
        cursor: pointer;
        outline: none;
        z-index: 1000;
        transition: all 0.3s ease;
    `;

    // Create a style element for custom styles
    let style = document.createElement('style');
    style.textContent = `
        @font-face {
            font-family: 'Minecraft';
            src: url('https://cdn.jsdelivr.net/gh/South-Paw/typeface-minecraft@master/fonts/minecraft.woff2') format('woff2');
        }
        #player-selector option {
            background-color: rgba(0, 0, 0, 0.8);
            color: #ffffff;
        }
        #player-selector:hover {
            background-color: rgba(0, 0, 0, 0.9);
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }
    `;
    document.head.appendChild(style);

    select.addEventListener('mousedown', function (e) {
        if (Minecraft.$theWorld) {
            select.innerHTML = "";
            listPseudos = [];
            // Get all players in the world
            Minecraft.$theWorld.$loadedEntityList.$array1.data.forEach(entity => {
                if (entity && entity.$getName && typeof entity.$getName === 'function') {
                    let name = decoder.decode(new Uint8Array(entity.$getName().$characters.data));
                    if (!listPseudos.includes(name)) {
                        listPseudos.push(name);
                    }
                }
            });
            listPseudos.sort((a, b) => a.localeCompare(b)); // Sort alphabetically
            listPseudos.forEach(element => {
                let option = document.createElement('option');
                option.innerText = element + ((element === Minecraft.$thePlayer.$getName()) ? " (you)" : "");
                option.value = element;
                select.appendChild(option);
            });
            if (document.querySelector(`option[value="${Minecraft.$renderViewEntity.$getName()}"]`)) {
                document.querySelector(`option[value="${Minecraft.$renderViewEntity.$getName()}"]`).selected = true;
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
        window.profile = Minecraft.$theWorld.$loadedEntityList.$array1.data.find(function (element) {
            if (element && element.$getName && typeof element.$getName === 'function') {
                return element.$getName() == select.value;
            }
            return false;
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

    ModAPI.addEventListener("frame", () => {
        if (Minecraft.$theWorld && Minecraft.$theWorld.$loadedEntityList.$array1.data.length > 1) {
            select.style.display = "block";
        } else {
            select.style.display = "none";
        }
    });

    document.body.appendChild(select);
})();
