// Coolest xray mod to ever exist!
(function () {
    var menuVisible = false;
    var targets = ["diamond_ore", "gold_ore", "iron_ore", "coal_ore", "emerald_ore", "redstone_ore", "lapis_ore"];
    var targetStates = Object.fromEntries(targets.map(target => [target, false]));

    // Create main button
    var mainButton = document.createElement('button');
    mainButton.textContent = 'X-Ray';
    Object.assign(mainButton.style, {
        position: 'fixed',
        top: '20px',
        left: '20px',
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontFamily: 'Arial, sans-serif',
        zIndex: '10000'
    });
    document.body.appendChild(mainButton);

    // Create menu
    var menu = document.createElement('div');
    menu.id = 'SCMM';
    Object.assign(menu.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'none',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '9999'
    });
    document.body.appendChild(menu);

    var menuContainer = document.createElement('div');
    Object.assign(menuContainer.style, {
        width: '80%',
        maxWidth: '800px',
        height: '80%',
        maxHeight: '600px',
        backgroundColor: '#444',
        borderRadius: '20px',
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
    });
    menu.appendChild(menuContainer);

    menuContainer.innerHTML = `
        <h1 style="color: #fff; font-size: 32px; margin-bottom: 20px;">X-Ray Menu</h1>
        <input type="text" placeholder="Search ores..." style="width: 100%; padding: 10px; marginBottom: 20px; borderRadius: 5px; border: none;">
        <div id="oreContainer"></div>
    `;

    var searchInput = menuContainer.querySelector('input');
    var oreContainer = document.getElementById('oreContainer');

    // Create checkboxes for each target
    targets.forEach(function(target) {
        var label = document.createElement('label');
        Object.assign(label.style, {
            display: 'block',
            marginBottom: '10px',
            color: '#fff',
            fontFamily: 'Arial, sans-serif'
        });

        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.marginRight = '10px';

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(target.replace('_ore', '').toUpperCase()));

        checkbox.addEventListener('change', function() {
            targetStates[target] = this.checked;
            update();
        });

        oreContainer.appendChild(label);
    });

    // Add search functionality
    searchInput.addEventListener('input', function() {
        var searchTerm = this.value.toLowerCase();
        Array.from(oreContainer.children).forEach(function(label) {
            label.style.display = label.textContent.toLowerCase().includes(searchTerm) ? 'block' : 'none';
        });
    });

    function update() {
        Object.keys(ModAPI.blocks).forEach(function(block) {
            if (targets.includes(block)) {
                if (targetStates[block]) {
                    ModAPI.blocks[block].forceRender = true;
                    ModAPI.blocks[block].tint = getTint(block);
                } else {
                    ModAPI.blocks[block].forceRender = false;
                    ModAPI.blocks[block].tint = undefined;
                }
                ModAPI.blocks[block].reload();
            }
        });

        ModAPI.reloadchunks();
    }

    function getTint(block) {
        const tints = {
            'diamond_ore': 0x00FFFF,
            'gold_ore': 0xFFD700,
            'iron_ore': 0xD3D3D3,
            'coal_ore': 0x36454F,
            'emerald_ore': 0x50C878,
            'redstone_ore': 0xFF0000,
            'lapis_ore': 0x4169E1
        };
        return tints[block] || undefined;
    }

    mainButton.addEventListener('click', toggleMenu);

    ModAPI.addEventListener("key", function(ev){
        if(ev.key == 16 && ev.shiftKey && !ev.ctrlKey && !ev.altKey){ // Right Shift key
            toggleMenu();
        }
    });

    function toggleMenu() {
        menuVisible = !menuVisible;
        menu.style.display = menuVisible ? 'flex' : 'none';
    }
})();
