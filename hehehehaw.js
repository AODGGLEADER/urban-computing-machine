(function() {
    let decoder = new TextDecoder();
    let listPseudos;
    let isDragging = false;
    let dragOffsetX, dragOffsetY;

    // Create and style the select element
    let select = document.createElement('select');
    select.id = 'player-selector';
    select.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        padding: 8px 12px;
        font-family: 'Minecraft', Arial, sans-serif;
        font-size: 16px;
        color: #ffffff;
        background-color: rgba(0, 0, 0, 0.7);
        border: 2px solid #4CAF50;
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
            padding: 5px;
        }
        #player-selector:hover {
            background-color: rgba(0, 0, 0, 0.9);
            box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
        }
    `;
    document.head.appendChild(style);

    select.addEventListener('mousedown', function (e) {
        if (Minecraft.$theWorld) {
            select.innerHTML = "";
            listPseudos = [];
            // Get all players in the server
            Minecraft.$theWorld.$playerEntities.$array1.data.forEach(entity => {
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

    let lastRenderViewEntity = null;
    function updateSpectatorView() {
        if (profile && profile !== Minecraft.$thePlayer) {
            if (Minecraft.$renderViewEntity !== profile) {
                Minecraft.$renderViewEntity = profile;
                // Force update of inventory
                Minecraft.$thePlayer.$inventory.$markDirty();
            }
            // Copy inventory contents
            for (let i = 0; i < 36; i++) {
                Minecraft.$thePlayer.$inventory.$mainInventory.$array1.data[i] = profile.$inventory.$mainInventory.$array1.data[i];
            }
            // Update held item
            Minecraft.$thePlayer.$inventory.$currentItem = profile.$inventory.$currentItem;
        }
        lastRenderViewEntity = Minecraft.$renderViewEntity;
    }

    select.addEventListener('change', function (e) {
        window.profile = Minecraft.$theWorld.$playerEntities.$array1.data.find(function (element) {
            if (element && element.$getName && typeof element.$getName === 'function') {
                return element.$getName() == select.value;
            }
            return false;
        });
        if (profile) {
            Minecraft.$renderViewEntity = profile;
            if (profile === Minecraft.$thePlayer) {
                Minecraft.$gameSettings.$hideGUI = 0;
                Minecraft.$thePlayer.$inventory.$markDirty();
            } else {
                Minecraft.$gameSettings.$hideGUI = 0;
            }
        }
    });

    ModAPI.addEventListener("frame", () => {
        if (Minecraft.$theWorld && Minecraft.$theWorld.$playerEntities.$array1.data.length > 1) {
            select.style.display = "block";
            updateSpectatorView();
        } else {
            select.style.display = "none";
        }
    });

    // Make the selector draggable
    select.addEventListener('mousedown', function(e) {
        isDragging = true;
        dragOffsetX = e.clientX - select.offsetLeft;
        dragOffsetY = e.clientY - select.offsetTop;
    });

    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            select.style.left = (e.clientX - dragOffsetX) + 'px';
            select.style.top = (e.clientY - dragOffsetY) + 'px';
        }
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
    });

    document.body.appendChild(select);
})();
