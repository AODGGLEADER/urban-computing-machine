// Coalest xray mod to ever exist!

(function () {
    var menuVisible = false;
    var targets = ["diamond_ore", "gold_ore", "iron_ore", "coal_ore", "emerald_ore", "redstone_ore", "lapis_ore"];
    var targetStates = {};
    targets.forEach(target => targetStates[target] = false);

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
    menu.style.position = 'fixed';
    menu.style.top = '60px';
    menu.style.left = '20px';
    menu.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    menu.style.padding = '10px';
    menu.style.borderRadius = '5px';
    menu.style.display = 'none';
    document.body.appendChild(menu);

    // Create checkboxes for each target
    targets.forEach(target => {
        var label = document.createElement('label');
        label.style.display = 'block';
        label.style.marginBottom = '5px';
        label.style.color = '#fff';
        label.style.fontFamily = 'Arial, sans-serif';

        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.marginRight = '5px';

        var text = document.createTextNode(target.replace('_ore', '').toUpperCase());

        label.appendChild(checkbox);
        label.appendChild(text);

        checkbox.addEventListener('change', function() {
            targetStates[target] = this.checked;
            update();
        });

        menu.appendChild(label);
    });

    function update() {
        var allblocks = Object.keys(ModAPI.blocks);

        allblocks.forEach(block => {
            if (targets.includes(block)) {
                if (targetStates[block]) {
                    ModAPI.blocks[block].forceRender = true;
                    // Add highlight
                    switch(block) {
                        case 'diamond_ore':
                            ModAPI.blocks[block].tint = 0x00FFFF; // Light blue
                            break;
                        case 'gold_ore':
                            ModAPI.blocks[block].tint = 0xFFD700; // Gold
                            break;
                        case 'iron_ore':
                            ModAPI.blocks[block].tint = 0xD3D3D3; // Light gray
                            break;
                        case 'coal_ore':
                            ModAPI.blocks[block].tint = 0x36454F; // Charcoal
                            break;
                        case 'emerald_ore':
                            ModAPI.blocks[block].tint = 0x50C878; // Emerald green
                            break;
                        case 'redstone_ore':
                            ModAPI.blocks[block].tint = 0xFF0000; // Red
                            break;
                        case 'lapis_ore':
                            ModAPI.blocks[block].tint = 0x4169E1; // Royal blue
                            break;
                    }
                } else {
                    ModAPI.blocks[block].forceRender = false;
                    ModAPI.blocks[block].tint = undefined; // Remove highlight
                }
                ModAPI.blocks[block].reload();
            }
        });

        ModAPI.reloadchunks();
        var activeTargets = targets.filter(target => targetStates[target]);
    }

    mainButton.addEventListener('click', function() {
        menuVisible = !menuVisible;
        menu.style.display = menuVisible ? 'block' : 'none';
    });

    ModAPI.addEventListener("key", function(ev){
        if(ev.key == 16 && ev.shiftKey && !ev.ctrlKey && !ev.altKey){ // Right Shift key
            menuVisible = !menuVisible;
            menu.style.display = menuVisible ? 'block' : 'none';
        }
    });
})();
