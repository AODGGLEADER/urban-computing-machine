// Epic X-Ray Mod v4.1
(function () {
    var menuVisible = false;
    var customBlocks = JSON.parse(localStorage.getItem('xrayCustomBlocks')) || {};
    var currentTheme = localStorage.getItem('xrayTheme') || 'default';

    // Inject custom CSS
    var style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');
        
        .xray-button {
            position: fixed;
            top: 20px;
            left: 20px;
            padding: 10px 20px;
            background: linear-gradient(45deg, #007bff, #00bcd4);
            color: #fff;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-family: 'Roboto', sans-serif;
            font-weight: 700;
            font-size: 16px;
            text-transform: uppercase;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
        }
        .xray-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(0,0,0,0.15);
        }
        .xray-menu {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 100000;
            backdrop-filter: blur(5px);
        }
        .xray-container {
            width: 80%;
            max-width: 800px;
            height: 80%;
            max-height: 600px;
            background: linear-gradient(135deg, #2a2a2a, #3a3a3a);
            border-radius: 20px;
            padding: 30px;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            box-shadow: 0 10px 20px rgba(0,0,0,0.3);
            animation: slideIn 0.5s ease-out;
            position: relative;
        }
        @keyframes slideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .xray-title {
            color: #fff;
            font-size: 36px;
            margin-bottom: 20px;
            font-family: 'Roboto', sans-serif;
            font-weight: 700;
            text-align: center;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .xray-search {
            width: 100%;
            padding: 12px;
            margin-bottom: 20px;
            border-radius: 25px;
            border: none;
            background-color: rgba(255,255,255,0.1);
            color: #fff;
            font-family: 'Roboto', sans-serif;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        .xray-search:focus {
            outline: none;
            background-color: rgba(255,255,255,0.2);
            box-shadow: 0 0 0 2px #007bff;
        }
        .xray-ore-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
        }
        .xray-ore-label {
            display: flex;
            align-items: center;
            padding: 10px;
            background-color: rgba(255,255,255,0.1);
            border-radius: 15px;
            color: #fff;
            font-family: 'Roboto', sans-serif;
            font-size: 14px;
            transition: all 0.3s ease;
        }
        .xray-ore-label:hover {
            background-color: rgba(255,255,255,0.2);
        }
        .xray-checkbox {
            margin-right: 10px;
            appearance: none;
            width: 20px;
            height: 20px;
            border: 2px solid #007bff;
            border-radius: 5px;
            outline: none;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .xray-checkbox:checked {
            background-color: #007bff;
            position: relative;
        }
        .xray-checkbox:checked::before {
            content: '✔';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #fff;
            font-size: 14px;
        }
        .xray-color-circle {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            margin-left: 10px;
            cursor: pointer;
        }
        .xray-add-button {
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-family: 'Roboto', sans-serif;
            font-size: 16px;
            margin-top: 20px;
            transition: background-color 0.3s;
        }
        .xray-add-button:hover {
            background-color: #45a049;
        }
        .xray-tooltip {
            position: fixed;
            background-color: #333;
            color: #fff;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 12px;
            z-index: 1000000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .xray-settings-button, .xray-exit-button {
            position: absolute;
            padding: 5px 10px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-family: 'Roboto', sans-serif;
            font-size: 14px;
            transition: background-color 0.3s;
        }
        .xray-settings-button { top: 10px; right: 50px; }
        .xray-exit-button { top: 10px; right: 10px; }
        .xray-settings-button:hover, .xray-exit-button:hover {
            background-color: #45a049;
        }
        .xray-settings-menu {
            position: absolute;
            background-color: rgba(0, 0, 0, 0.8);
            padding: 20px;
            border-radius: 10px;
            color: white;
            font-family: 'Roboto', sans-serif;
            z-index: 10001;
            display: none;
        }
        .xray-settings-menu { top: 50px; right: 10px; }
        
        .xray-settings-menu button {
            display: block;
            width: 100%;
            padding: 5px;
            margin-bottom: 5px;
            background-color: #555;
            color: #fff;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        .xray-settings-menu button:hover {
            background-color: #666;
        }

        /* UwU Theme - Crazy Edition */
        @keyframes rainbow-bg {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0.5); }
            50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes wobble {
            0%, 100% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        .uwu-theme {
            background: linear-gradient(124deg, #ff2400, #e81d1d, #e8b71d, #e3e81d, #1de840, #1ddde8, #2b1de8, #dd00f3, #dd00f3);
            background-size: 1800% 1800%;
            animation: rainbow-bg 18s ease infinite;
            font-family: 'Comic Sans MS', cursive !important;
        }
        .uwu-theme::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🌈</text></svg>') 0 0 / 100px 100px;
            opacity: 0.1;
            animation: bounce 2s infinite;
        }
        .uwu-theme .xray-title {
            color: #FF69B4 !important;
            text-shadow: 2px 2px 4px #FFF, -2px -2px 4px #FFF, 2px -2px 4px #FFF, -2px 2px 4px #FFF !important;
            animation: wobble 2s infinite;
        }
        .uwu-theme .xray-search,
        .uwu-theme .xray-ore-label,
        .uwu-theme .xray-add-button,
        .uwu-theme .xray-settings-button,
        .uwu-theme .xray-exit-button {
            background-color: rgba(255, 182, 193, 0.7) !important;
            color: #FF1493 !important;
            border: 3px solid #FF69B4 !important;
            box-shadow: 0 0 10px #FF69B4, 0 0 20px #FF69B4, 0 0 30px #FF69B4;
            transition: all 0.3s ease;
        }
        .uwu-theme .xray-search:focus,
        .uwu-theme .xray-ore-label:hover,
        .uwu-theme .xray-add-button:hover,
        .uwu-theme .xray-settings-button:hover,
        .uwu-theme .xray-exit-button:hover {
            transform: scale(1.05);
            box-shadow: 0 0 15px #FF69B4, 0 0 30px #FF69B4, 0 0 45px #FF69B4;
        }
        .uwu-theme .xray-checkbox {
            border-color: #FF69B4 !important;
        }
        .uwu-theme .xray-checkbox:checked {
            background-color: #FF69B4 !important;
        }
        .uwu-theme .xray-checkbox:checked::before {
            content: '💖';
            font-size: 16px;
        }
        .uwu-theme .xray-settings-menu {
            background-color: rgba(255, 192, 203, 0.9) !important;
            border: 3px solid #FF69B4;
            box-shadow: 0 0 20px #FF69B4;
        }
        .uwu-theme .xray-settings-menu button {
            background-color: #FFB6C1 !important;
            color: #FF1493 !important;
            border: 2px solid #FF69B4;
            transition: all 0.3s ease;
        }
        .uwu-theme .xray-settings-menu button:hover {
            background-color: #FF69B4 !important;
            color: #FFF !important;
            transform: scale(1.1);
        }
        .uwu-theme .xray-color-circle {
            animation: sparkle 1.5s infinite;
        }
        .uwu-theme .xray-ore-container {
            animation: bounce 4s infinite;
        }
        .uwu-theme::after {
            content: "UwU";
            position: fixed;
            bottom: 10px;
            right: 10px;
            font-size: 24px;
            color: #FF69B4;
            text-shadow: 2px 2px 4px #FFF;
            animation: wobble 3s infinite;
        }
    `;
    document.head.appendChild(style);

    // Create main button
    var mainButton = document.createElement('button');
    mainButton.textContent = 'X-Ray';
    mainButton.className = 'xray-button';
    document.body.appendChild(mainButton);

    // Create menu
    var menu = document.createElement('div');
    menu.className = 'xray-menu';
    document.body.appendChild(menu);

    var menuContainer = document.createElement('div');
    menuContainer.className = 'xray-container';
    menu.appendChild(menuContainer);

    menuContainer.innerHTML = `
        <h1 class="xray-title">X-Ray Control Panel</h1>
        <input type="text" placeholder="Search blocks..." class="xray-search">
        <div class="xray-ore-container"></div>
        <button class="xray-add-button">Add Block</button>
        <button class="xray-settings-button">⚙️</button>
        <button class="xray-exit-button">❌</button>
        <div class="xray-settings-menu">
            <button class="xray-theme-toggle">Toggle UwU Theme</button>
        </div>
    `;

    var searchInput = menuContainer.querySelector('.xray-search');
    var oreContainer = menuContainer.querySelector('.xray-ore-container');
    var addButton = menuContainer.querySelector('.xray-add-button');
    var settingsButton = menuContainer.querySelector('.xray-settings-button');
    var exitButton = menuContainer.querySelector('.xray-exit-button');
    var settingsMenu = menuContainer.querySelector('.xray-settings-menu');
    var themeToggle = menuContainer.querySelector('.xray-theme-toggle');

    function createBlockElement(textureName, customName, color, enabled) {
        var label = document.createElement('label');
        label.className = 'xray-ore-label';
        label.setAttribute('data-texture', textureName);

        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'xray-checkbox';
        checkbox.checked = enabled;

        var colorCircle = document.createElement('div');
        colorCircle.className = 'xray-color-circle';
        colorCircle.style.backgroundColor = color || '#FFFFFF';

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(customName || textureName));
        label.appendChild(colorCircle);

        checkbox.addEventListener('change', function() {
            updateBlock(textureName, this.checked, colorCircle.style.backgroundColor);
        });

        colorCircle.addEventListener('click', function(e) {
            e.stopPropagation();
            var newColor = prompt('Enter a new color (e.g., #FF0000, rgb(255,0,0), or rgba(255,0,0,1)):', colorCircle.style.backgroundColor);
            if (newColor) {
                colorCircle.style.backgroundColor = newColor;
                updateBlock(textureName, checkbox.checked, newColor);
            }
        });

        label.addEventListener('mouseover', function(e) {
            showTooltip(e, 'CTRL + Click to edit or remove');
        });

        label.addEventListener('mouseout', hideTooltip);

        label.addEventListener('click', function(e) {
            if (e.ctrlKey) {
                e.preventDefault();
                editBlock(textureName, customName, colorCircle.style.backgroundColor);
            }
        });

        return label;
    }

    function updateBlock(textureName, enabled, color) {
        console.log(`Updating ${textureName}: enabled=${enabled}, color=${color}`);
        if (enabled) {
            ModAPI.blocks[textureName].forceRender = true;
            ModAPI.blocks[textureName].tint = hexToRgb(color);
            ModAPI.blocks[textureName].renderType = "TRANSLUCENT";
        } else {
            ModAPI.blocks[textureName].forceRender = false;
            ModAPI.blocks[textureName].tint = undefined;
            ModAPI.blocks[textureName].renderType = "SOLID";
        }
        ModAPI.blocks[textureName].reload();
        ModAPI.reloadchunks();

        customBlocks[textureName] = { 
            customName: customBlocks[textureName]?.customName || textureName, 
            color: color,
            enabled: enabled
        };
        localStorage.setItem('xrayCustomBlocks', JSON.stringify(customBlocks));
    }

    function editBlock(textureName, customName, color) {
        var action = prompt('Enter "edit" to modify or "remove" to delete this block:', 'edit');
        if (action === 'edit') {
            var newCustomName = prompt('Enter a new custom name:', customName);
            var newColor = prompt('Enter a new color:', color);
            if (newCustomName && newColor) {
                customBlocks[textureName] = { 
                    customName: newCustomName, 
                    color: newColor,
                    enabled: customBlocks[textureName]?.enabled || false
                };
                localStorage.setItem('xrayCustomBlocks', JSON.stringify(customBlocks));
                refreshBlocks();
            }
        } else if (action === 'remove') {
            delete customBlocks[textureName];
            localStorage.setItem('xrayCustomBlocks', JSON.stringify(customBlocks));
            refreshBlocks();
        }
    }

    function refreshBlocks() {
        oreContainer.innerHTML = '';
        Object.entries(customBlocks).forEach(([textureName, blockInfo]) => {
            oreContainer.appendChild(createBlockElement(
                textureName, 
                blockInfo.customName, 
                blockInfo.color,
                blockInfo.enabled
            ));
            // Ensure the block's state is updated in the game
            updateBlock(textureName, blockInfo.enabled, blockInfo.color);
        });
    }

    addButton.addEventListener('click', function() {
        var textureName = prompt('Enter the texture name (e.g., diamond_ore):');
        if (textureName) {
            var customName = prompt('Enter a custom name for this block:');
            var color = prompt('Enter a color for this block (e.g., #FF0000):');
            if (customName && color) {
                customBlocks[textureName] = { 
                    customName: customName, 
                    color: color,
                    enabled: false
                };
                localStorage.setItem('xrayCustomBlocks', JSON.stringify(customBlocks));
                refreshBlocks();
            }
        }
    });

    searchInput.addEventListener('input', function() {
        var searchTerm = this.value.toLowerCase();
        Array.from(oreContainer.children).forEach(function(label) {
            var blockName = label.textContent.toLowerCase();
            var textureName = label.getAttribute('data-texture').toLowerCase();
            label.style.display = blockName.includes(searchTerm) || textureName.includes(searchTerm) ? 'flex' : 'none';
        });
    });

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    var tooltipTimeout;
    function showTooltip(event, text) {
        hideTooltip();
        var tooltip = document.createElement('div');
        tooltip.className = 'xray-tooltip';
        tooltip.textContent = text;
        document.body.appendChild(tooltip);

        var rect = event.target.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.bottom + 5) + 'px';

        setTimeout(() => tooltip.style.opacity = 1, 0);

        tooltipTimeout = setTimeout(hideTooltip, 2000);
    }

    function hideTooltip() {
        clearTimeout(tooltipTimeout);
        var tooltip = document.querySelector('.xray-tooltip');
        if (tooltip) {
            tooltip.style.opacity = 0;
            setTimeout(() => tooltip.remove(), 300);
        }
    }

    function toggleMenu() {
        menuVisible = !menuVisible;
        menu.style.display = menuVisible ? 'flex' : 'none';
        if (menuVisible) {
            menuContainer.style.animation = 'none';
            menuContainer.offsetHeight;
            menuContainer.style.animation = null;
            refreshBlocks();
            searchInput.focus();
            searchInput.select();
        } else {
            // When closing the menu, ensure all blocks are in their correct state
            Object.entries(customBlocks).forEach(([textureName, blockInfo]) => {
                updateBlock(textureName, blockInfo.enabled, blockInfo.color);
            });
        }
    }

    mainButton.addEventListener('click', toggleMenu);

    searchInput.addEventListener('focus', function(e) {
        e.stopPropagation();
    });

    searchInput.addEventListener('keydown', function(e) {
        e.stopPropagation();
    });

    settingsButton.addEventListener('click', function(e) {
        e.stopPropagation();
        settingsMenu.style.display = settingsMenu.style.display === 'block' ? 'none' : 'block';
    });

    exitButton.addEventListener('click', toggleMenu);

    themeToggle.addEventListener('click', function() {
        currentTheme = currentTheme === 'default' ? 'uwu' : 'default';
        localStorage.setItem('xrayTheme', currentTheme);
        applyTheme();
    });

    function applyTheme() {
        if (currentTheme === 'uwu') {
            menuContainer.classList.add('uwu-theme');
        } else {
            menuContainer.classList.remove('uwu-theme');
        }
    }
    
    // Initial setup
    (function initializeXRay() {
        applyTheme();
        refreshBlocks();
    })();
})();
