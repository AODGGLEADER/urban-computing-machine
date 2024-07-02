ModAPI.require("player");

var timer;
var fishRodId = ModAPI.items.fishing_rod.getID();
var modEnabled = false; // Start with the mod disabled
var menuVisible = false;

// Settings
var settings = {
    showStats: true,
    showTimer: true,
    showVisualIndicator: true
};

// Statistics
var fishCaught = 0;
var rareCaught = 0;
var currentStreak = 0;
var bestStreak = 0;
var fishingStartTime = 0;

// Auto-fishing logic
ModAPI.addEventListener("packetsoundeffect", (ev) => {
  if (ev.soundName === "random.splash" && modEnabled) {
    rightClick();
    updateStats();
  }
});

ModAPI.addEventListener("update", () => {
  if (!modEnabled) return;
  
  if (ModAPI.player.inventory.mainInventory[ModAPI.player.inventory.currentItem] &&
      ModAPI.player.inventory.mainInventory[ModAPI.player.inventory.currentItem].itemId === fishRodId) {
    if (timer > 0) {
      timer--;
      return;
    }
    if (ModAPI.player.fishEntity) {
      return;
    }
    rightClick();
  }
});

function rightClick() {
  if (!ModAPI.player.inventory.mainInventory[ModAPI.player.inventory.currentItem] ||
      !ModAPI.player.inventory.mainInventory[ModAPI.player.inventory.currentItem].itemId === fishRodId) {
    return;
  }
  ModAPI.rightClickMouse();
  timer = 15;
}

function updateStats() {
    fishCaught++;
    currentStreak++;
    if (currentStreak > bestStreak) bestStreak = currentStreak;
    if (Math.random() < 0.1) {
        rareCaught++;
    }
}

// Create menu
let menuContainer = document.createElement('div');
menuContainer.id = 'auto-fishing-menu';
menuContainer.style.display = 'none';
menuContainer.style.position = 'absolute';
menuContainer.style.top = '50%';
menuContainer.style.left = '50%';
menuContainer.style.transform = 'translate(-50%, -50%)';
menuContainer.style.backgroundColor = 'rgba(0, 0, 33, 0.8)';
menuContainer.style.padding = '20px';
menuContainer.style.borderRadius = '10px';
menuContainer.style.color = 'white';
menuContainer.style.fontFamily = 'Arial, sans-serif';
menuContainer.style.zIndex = '1000';

// Create title
let title = document.createElement('h2');
title.textContent = 'Auto-Fishing Menu';
title.style.marginTop = '0';
title.style.marginBottom = '15px';
title.style.textAlign = 'center';
menuContainer.appendChild(title);

// Create toggle button
let toggleButton = document.createElement('button');
toggleButton.textContent = modEnabled ? 'Disable' : 'Enable';
toggleButton.style.width = '100%';
toggleButton.style.padding = '10px';
toggleButton.style.marginBottom = '10px';
toggleButton.style.backgroundColor = modEnabled ? '#4CAF50' : '#f44336';
toggleButton.style.color = 'white';
toggleButton.style.border = 'none';
toggleButton.style.borderRadius = '5px';
toggleButton.style.cursor = 'pointer';

toggleButton.onclick = function() {
    modEnabled = !modEnabled;
    toggleButton.textContent = modEnabled ? 'Disable' : 'Enable';
    toggleButton.style.backgroundColor = modEnabled ? '#4CAF50' : '#f44336';
};

menuContainer.appendChild(toggleButton);

// Create settings toggles
function createSettingToggle(label, setting) {
    let container = document.createElement('div');
    container.style.marginBottom = '10px';

    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = settings[setting];
    checkbox.style.marginRight = '10px';

    let text = document.createElement('span');
    text.textContent = label;

    checkbox.onchange = function() {
        settings[setting] = checkbox.checked;
    };

    container.appendChild(checkbox);
    container.appendChild(text);
    menuContainer.appendChild(container);
}

createSettingToggle('Show Statistics', 'showStats');
createSettingToggle('Show Timer', 'showTimer');
createSettingToggle('Show Visual Indicator', 'showVisualIndicator');

// Create close button
let closeButton = document.createElement('button');
closeButton.textContent = 'Close';
closeButton.style.width = '100%';
closeButton.style.padding = '10px';
closeButton.style.backgroundColor = '#3366CC';
closeButton.style.color = 'white';
closeButton.style.border = 'none';
closeButton.style.borderRadius = '5px';
closeButton.style.cursor = 'pointer';

closeButton.onclick = function() {
    menuContainer.style.display = 'none';
    menuVisible = false;
};

menuContainer.appendChild(closeButton);

document.body.appendChild(menuContainer);

// Create menu toggle button
let menuToggleButton = document.createElement('button');
menuToggleButton.textContent = 'Menu';
menuToggleButton.style.position = 'absolute';
menuToggleButton.style.top = '10px';
menuToggleButton.style.right = '10px';
menuToggleButton.style.padding = '5px 10px';
menuToggleButton.style.backgroundColor = '#3366CC';
menuToggleButton.style.color = 'white';
menuToggleButton.style.border = 'none';
menuToggleButton.style.borderRadius = '5px';
menuToggleButton.style.cursor = 'pointer';

menuToggleButton.onclick = function() {
    menuVisible = !menuVisible;
    menuContainer.style.display = menuVisible ? 'block' : 'none';
};

document.body.appendChild(menuToggleButton);

// Render function for stats and visual indicator
ModAPI.addEventListener("render", () => {
    if (settings.showVisualIndicator && modEnabled && isHoldingFishingRod()) {
        ModAPI.rendering.drawRect(10, 10, 30, 30, 0x3366CC);
    }
    if (settings.showStats && modEnabled) {
        ModAPI.rendering.drawString(`Fish: ${fishCaught} | Rare: ${rareCaught} | Streak: ${currentStreak} | Best: ${bestStreak}`, 10, ModAPI.gui.getScaledHeight() - 40, 0xFFFFFF);
    }
    if (settings.showTimer && modEnabled) {
        if (isHoldingFishingRod()) {
            if (fishingStartTime === 0) fishingStartTime = Date.now();
            let sessionTime = Math.floor((Date.now() - fishingStartTime) / 1000);
            ModAPI.rendering.drawString(`Fishing Time: ${sessionTime}s`, 10, ModAPI.gui.getScaledHeight() - 20, 0xFFFFFF);
        } else {
            fishingStartTime = 0;
        }
    }
});

function isHoldingFishingRod() {
    return ModAPI.player.inventory.mainInventory[ModAPI.player.inventory.currentItem] &&
           ModAPI.player.inventory.mainInventory[ModAPI.player.inventory.currentItem].itemId === fishRodId;
}
