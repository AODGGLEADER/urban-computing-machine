// Coalest xray mod to ever exist!

(function () {
    var menuVisible = false;
    var targets = ["diamond_ore", "gold_ore", "iron_ore", "coal_ore", "emerald_ore", "redstone_ore", "lapis_ore"];
    var targetStates = {};
    targets.forEach(function(target) { targetStates[target] = false; });

    // Create main button
    var mainButton = document.createElement('button');
    mainButton.textContent = 'X-Ray';
    mainButton.style.position = 'fixed';
    mainButton.style.top = '20px';
    mainButton.style.left = '20px';
    mainButton.style.padding = '10px 20px';
    mainButton.style.backgroundColor = '#007bff';
    mainButton.style.color = '#fff';
    mainButton.style.border = 'none';
    mainButton.style.borderRadius = '5px';
    mainButton.style.cursor = 'pointer';
    mainButton.style.fontFamily = 'Arial, sans-serif';
    document.body.appendChild(mainButton);

    // Create menu
    var menu = document.createElement('div');
    menu.id = 'SCMM';
    menu.style.position = 'fixed';
    menu.style.top = '0';
    menu.style.left = '0';
    menu.style.width = '100vw';
    menu.style.height = '100vh';
    menu.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    menu.style.display = 'none';
    menu.style.justifyContent = 'center';
    menu.style.alignItems = 'center';
    menu.style.zIndex = '9999';
    document.body.appendChild(menu);

    var menuContainer = document.createElement('div');
    menuContainer.style.width = '80%';
    menuContainer.style.maxWidth = '800px';
    menuContainer.style.height = '80%';
    menuContainer.style.maxHeight = '600px';
    menuContainer.style.backgroundColor = '#444';
    menuContainer.style.borderRadius = '20px';
    menuContainer.style.padding = '30px';
    menuContainer.style.display = 'flex';
    menuContainer.style.flexDirection = 'column';
    menu.appendChild(menuContainer);

    var menuHeader = document.createElement('div');
    menuHeader.innerHTML = '<h1 style="color #fff; font-size 32px; margin-bottom 20px;">X-Ray Menu</h1>';
    menuContainer.appendChild(menuHeader);

    // Create search input
    var searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search ores...';
    searchInput.style.width = '100%';
    searchInput.style.padding = '10px';
    searchInput.style.marginBottom = '20px';
    searchInput.style.borderRadius = '5px';
    searchInput.style.border = 'none';
    menuContainer.appendChild(searchInput);

    // Create container for ore options
    var oreContainer = document.createElement('div');
    menuContainer.appendChild(oreContainer);

    // Create checkboxes for each target
    targets.forEach(function(target) {
        var label = document.createElement('label');
        label.style.display = 'block';
        label.style.marginBottom = '10px';
        label.style.color = '#fff';
        label.style.fontFamily = 'Arial, sans-serif';

        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.marginRight = '10px';

        var text = document.createTextNode(target.replace('_ore', '').toUpperCase());

        label.appendChild(checkbox);
        label.appendChild(text);

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
            var oreText = label.textContent.toLowerCase();
            label.style.display = oreText.includes(searchTerm) ? 'block' : 'none';
        });
    });

    function update() {
        var allblocks = Object.keys(ModAPI.blocks);

        allblocks.forEach(function(block) {
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
        var activeTargets = targets.filter(function(target) { return targetStates[target]; });
    }

    function getTint(block) {
        switch(block) {
            case 'diamond_ore' return 0x00FFFF;
            case 'gold_ore' return 0xFFD700;
            case 'iron_ore' return 0xD3D3D3;
            case 'coal_ore' return 0x36454F;
            case 'emerald_ore' return 0x50C878;
            case 'redstone_ore' return 0xFF0000;
            case 'lapis_ore' return 0x4169E1;
            default return undefined;
        }
    }

    mainButton.addEventListener('click', function() {
        menuVisible = !menuVisible;
        menu.style.display = menuVisible ? 'flex' : 'none';
    });

    ModAPI.addEventListener("key", function(ev){
        if(ev.key == 16 && ev.shiftKey && !ev.ctrlKey && !ev.altKey){ // Right Shift key
            menuVisible = !menuVisible;
            menu.style.display = menuVisible ? 'flex' : 'none';
        }
    });
})();
