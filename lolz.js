// Coalest xray mod to ever exist!

(function () {
    var menuVisible = false;
    var targets = ["diamond_ore", "gold_ore", "iron_ore", "coal_ore", "emerald_ore", "redstone_ore", "lapis_ore"];
    var targetStates = {};
    targets.forEach(target => targetStates[target] = false);

    // UI setup
    var canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 300;
    canvas.style.position = 'absolute';
    canvas.style.left = '10px';
    canvas.style.top = '10px';
    canvas.style.display = 'none';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    function drawUI() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        targets.forEach((target, index) => {
            let y = 40 + index * 30;
            ctx.fillStyle = targetStates[target] ? '#4CAF50' : '#f44336';
            ctx.fillRect(10, y, 180, 25);
            
            // Highlight effect
            if (targetStates[target]) {
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.strokeRect(8, y - 2, 184, 29);
            }

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '16px Arial';
            ctx.fillText(target.replace('_ore', '').toUpperCase(), 15, y + 18);
        });

        // Toggle All button
        ctx.fillStyle = '#2196F3';
        ctx.fillRect(10, 10, 180, 25);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Toggle All', 15, 28);
    }

    canvas.addEventListener('click', function(event) {
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        if (y >= 10 && y <= 35 && x >= 10 && x <= 190) {
            var allEnabled = targets.every(target => targetStates[target]);
            targets.forEach(target => targetStates[target] = !allEnabled);
            update();
        } else {
            targets.forEach((target, index) => {
                let buttonY = 40 + index * 30;
                if (y >= buttonY && y <= buttonY + 25 && x >= 10 && x <= 190) {
                    targetStates[target] = !targetStates[target];
                    update();
                }
            });
        }
        drawUI();
    });

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

    ModAPI.addEventListener("key", function(ev){
        if(ev.key == 16 && ev.shiftKey && !ev.ctrlKey && !ev.altKey){ // Right Shift key
            menuVisible = !menuVisible;
            canvas.style.display = menuVisible ? 'block' : 'none';
            if (menuVisible) {
                drawUI();
            }
        }
    });

    // Initial UI draw (it won't be visible until Right Shift is pressed)
    drawUI();
})();
