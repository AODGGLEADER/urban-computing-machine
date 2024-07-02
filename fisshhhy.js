ModAPI.require("player");

var timer;
var fishRodId = ModAPI.items.fishing_rod.getID();
var modEnabled = false;
var menuVisible = false;
var autoRecastDelay = 1000; // Default delay of 1 second (1000 ms)

// Auto-fishing logic
ModAPI.addEventListener("packetsoundeffect", (ev) => {
  if (ev.soundName === "random.splash" && modEnabled) {
    rightClick();
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
    timer = Math.floor(autoRecastDelay / 50); // Convert ms to ticks (assuming 20 ticks per second)
  }
});

function rightClick() {
  if (!ModAPI.player.inventory.mainInventory[ModAPI.player.inventory.currentItem] ||
      !ModAPI.player.inventory.mainInventory[ModAPI.player.inventory.currentItem].itemId === fishRodId) {
    return;
  }
  ModAPI.rightClickMouse();
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

// Add Auto-Recast Delay setting
let delayContainer = document.createElement('div');
delayContainer.style.marginBottom = '10px';

let delayLabel = document.createElement('span');
delayLabel.textContent = 'Auto-Recast Delay (ms): ';
delayContainer.appendChild(delayLabel);

let delayInput = document.createElement('input');
delayInput.type = 'number';
delayInput.value = autoRecastDelay;
delayInput.style.width = '60px';
delayInput.onchange = function() {
    autoRecastDelay = parseInt(delayInput.value);
};
delayContainer.appendChild(delayInput);

menuContainer.appendChild(delayContainer);

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
