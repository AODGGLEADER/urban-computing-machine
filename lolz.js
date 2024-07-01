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

    // Create buttons for each target
    targets.forEach(target => {
        var button = document.createElement('button');
        button.textContent = target.replace('_ore', '').toUpperCase();
        button.style.display = 'block';
        button.style.width = '100%';
        button.style.padding = '10px';
        button.style.marginBottom = '5px';
        button.style.backgroundColor = '#f44336';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.borderRadius = '3px';
        button.style.cursor = 'pointer';
        button.style.fontFamily = 'Arial, sans-serif';

        button.addEventListener('click', function() {
            targetStates[target] = !targetStates[target];
            this.style.backgroundColor = targetStates[target] ? '#4CAF50' : '#f44336';
            update();
        });

        menu.appendChild(button);
    });

    // Create "Toggle All" button
    var toggleAllButton = document.createElement('button');
    toggleAllButton.textContent = 'Toggle All';
    toggleAllButton.style.display = 'block';
    toggleAllButton.style.width = '100%';
    toggleAllButton.style.padding = '10px';
    toggleAllButton.style.marginTop = '10px';
    toggleAllButton.style.backgroundColor = '#2196F3';
    toggleAllButton.style.color = '#fff';
    toggleAllButton.style.border = 'none';
    toggleAllButton.style.borderRadius = '3px';
    toggleAllButton.style.cursor = 'pointer';
    toggleAllButton.style.fontFamily = 'Arial, sans-serif';

    toggleAllButton.addEventListener('click', function() {
        var allEnabled = targets.every(target => targetStates[target]);
        targets.forEach(target => {
            targetStates[target] = !allEnabled;
            menu.childNodes.forEach(button => {
                if (button.textContent === target.replace('_ore', '').toUpperCase()) {
                    button.style.backgroundColor = targetStates[target] ? '#4CAF50' : '#f44336';
                }
            });
        });
        update();
    });

    menu.appendChild(toggleAllButton);

    function update() {
        var activeTargets = targets.filter(target => targetStates[target]);
        var allblocks = Object.keys(ModAPI.blocks);

        allblocks.forEach(block => {
            if (activeTargets.includes(block)) {
                ModAPI.blocks[block].forceRender = true;
                ModAPI.blocks[block].reload();
            } else if (ModAPI.blocks[block] && ("noRender" in ModAPI.blocks[block])) {
                ModAPI.blocks[block].noRender = !activeTargets.includes(block);
                ModAPI.blocks[block].reload();
            }
        });

        ModAPI.reloadchunks();
        ModAPI.displayToChat({msg: activeTargets.length > 0 ? "X-ray Enabled!" : "X-ray Disabled!"});
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
