// Coolest xray mod to ever exist!
(function () {
    var menuVisible = false;
    var targets = ["diamond_ore", "gold_ore", "iron_ore", "coal_ore", "emerald_ore", "redstone_ore", "lapis_ore"];
    var targetStates = {};
    targets.forEach(function(target) { targetStates[target] = false; });

    // Create main button
    var mainButton = new Button("X-Ray", 20, 20, 100, 20);
    mainButton.setBackgroundColor(0x007bff);
    mainButton.setTextColor(0xffffff);

    // Create menu
    var menu = new Container();
    menu.setSize(300, 200);
    menu.setBackgroundColor(0x444444);
    menu.setVisible(false);

    var menuHeader = new Label("X-Ray Menu");
    menuHeader.setPosition(10, 10);
    menu.add(menuHeader);

    // Create checkboxes for each target
    var yOffset = 40;
    targets.forEach(function(target) {
        var checkbox = new Checkbox(target.replace('_ore', '').toUpperCase());
        checkbox.setPosition(10, yOffset);
        checkbox.addClickListener(function() {
            targetStates[target] = checkbox.isChecked();
            update();
        });
        menu.add(checkbox);
        yOffset += 20;
    });

    function update() {
        targets.forEach(function(target) {
            if (targetStates[target]) {
                ModAPI.setBlockRenderType(target, "TRANSLUCENT");
                ModAPI.setBlockTint(target, getTint(target));
            } else {
                ModAPI.setBlockRenderType(target, "SOLID");
                ModAPI.setBlockTint(target, -1);
            }
        });
        ModAPI.reloadChunks();
    }

    function getTint(block) {
        switch(block) {
            case 'diamond_ore': return 0x00FFFF;
            case 'gold_ore': return 0xFFD700;
            case 'iron_ore': return 0xD3D3D3;
            case 'coal_ore': return 0x36454F;
            case 'emerald_ore': return 0x50C878;
            case 'redstone_ore': return 0xFF0000;
            case 'lapis_ore': return 0x4169E1;
            default: return -1;
        }
    }

    mainButton.addClickListener(function() {
        menuVisible = !menuVisible;
        menu.setVisible(menuVisible);
    });

    ModAPI.addEventListener("tick", function() {
        if (ModAPI.isKeyDown(16)) { // Right Shift key
            menuVisible = !menuVisible;
            menu.setVisible(menuVisible);
        }
    });

    // Add elements to the HUD
    ModAPI.displayHUD(mainButton);
    ModAPI.displayHUD(menu);
})();
