ModAPI.require("player");
ModAPI.require("gui");

// Constants and variables
const COOLDOWN = 500;
const fishRodId = ModAPI.items.fishing_rod.getID();
let isEnabled = false;
let fishCaught = 0;
let lastCastTime = 0;
let timer = 0;
let fishTypes = {raw_fish: 0, raw_salmon: 0, clownfish: 0, pufferfish: 0, treasure: 0, junk: 0};

// Cached references
const player = ModAPI.player;
const inventory = player.inventory;

// UI elements
const uiButton = ModAPI.gui.createButton("AF", 10, 10, 30, 20);
const uiPanel = ModAPI.gui.createPanel(50, 50, 200, 300);
uiPanel.visible = false;

const titleLabel = ModAPI.gui.createLabel("Auto-Fishing", 10, 10, 180, 20);
const toggleButton = ModAPI.gui.createButton("Enable", 10, 40, 180, 30);
const statsLabel = ModAPI.gui.createLabel("Fish Caught: 0", 10, 80, 180, 20);

uiPanel.addChild(titleLabel);
uiPanel.addChild(toggleButton);
uiPanel.addChild(statsLabel);

// UI event listeners
uiButton.onClick = () => {
    uiPanel.visible = !uiPanel.visible;
};

toggleButton.onClick = () => {
    isEnabled = !isEnabled;
    toggleButton.text = isEnabled ? "Disable" : "Enable";
    ModAPI.chat.addMessage("Auto-fishing " + (isEnabled ? "enabled" : "disabled"));
};

// Helper functions
function canCast() {
    const currentTime = Date.now();
    if (currentTime - lastCastTime > COOLDOWN) {
        lastCastTime = currentTime;
        return true;
    }
    return false;
}

function rightClick() {
    if (!inventory.mainInventory[inventory.currentItem] ||
        inventory.mainInventory[inventory.currentItem].itemId !== fishRodId) {
        return;
    }
    if (canCast()) {
        ModAPI.rightClickMouse();
        timer = 15;
    }
}

function updateStats() {
    const totalFish = Object.values(fishTypes).reduce((a, b) => a + b, 0);
    statsLabel.text = `Fish Caught: ${totalFish}`;
}

function determineCatchType() {
    const rand = Math.random();
    if (rand < 0.05) return "treasure";
    if (rand < 0.20) return "junk";
    return ["raw_fish", "raw_salmon", "clownfish", "pufferfish"][Math.floor(Math.random() * 4)];
}

// Event listeners
ModAPI.addEventListener("packetsoundeffect", (ev) => {
    if (isEnabled && ev.soundName === "random.splash") {
        rightClick();
        fishCaught++;
        const catchType = determineCatchType();
        fishTypes[catchType]++;
        updateStats();
    }
});

ModAPI.addEventListener("update", () => {
    if (!isEnabled) return;

    try {
        if (inventory.mainInventory[inventory.currentItem] &&
            inventory.mainInventory[inventory.currentItem].itemId === fishRodId) {
            if (timer > 0) {
                timer--;
                return;
            }
            if (player.fishEntity) {
                return;
            }
            rightClick();
        }
    } catch (error) {
        ModAPI.chat.addMessage("Error in auto-fishing mod: " + error.message);
    }
});

// Initial UI setup
ModAPI.gui.addElement(uiButton);
ModAPI.gui.addElement(uiPanel);
