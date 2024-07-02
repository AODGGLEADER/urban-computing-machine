ModAPI.require("player");
ModAPI.require("gui");

// Constants and variables
const COOLDOWN = 500;
const fishRodId = ModAPI.items.fishing_rod.getID();
let isEnabled = false;
let fishCaught = 0;
let lastCastTime = 0;
let timer = 0;
let durabilityCheck = true;
let antiAFK = true;
let afkTimer = 0;

// Cached references
const player = ModAPI.player;
const inventory = player.inventory;

// UI elements
const uiButton = ModAPI.gui.createButton("AF", 10, 10, 30, 20);
const uiPanel = ModAPI.gui.createPanel(50, 50, 200, 250);
uiPanel.visible = false;

const titleLabel = ModAPI.gui.createLabel("Auto-Fishing", 10, 10, 180, 20);
titleLabel.setFontSize(16);

const toggleButton = ModAPI.gui.createButton("Enable", 10, 40, 180, 30);
const durabilityCheckbox = ModAPI.gui.createCheckbox("Durability Check", 10, 80, 180, 20);
durabilityCheckbox.checked = true;
const antiAFKCheckbox = ModAPI.gui.createCheckbox("Anti-AFK", 10, 110, 180, 20);
antiAFKCheckbox.checked = true;
const statsLabel = ModAPI.gui.createLabel("Fish Caught: 0", 10, 140, 180, 20);
const cooldownSlider = ModAPI.gui.createSlider(500, 2000, 500, 10, 170, 180, 30);
const cooldownLabel = ModAPI.gui.createLabel("Cooldown: 500ms", 10, 210, 180, 20);

uiPanel.addChild(titleLabel);
uiPanel.addChild(toggleButton);
uiPanel.addChild(durabilityCheckbox);
uiPanel.addChild(antiAFKCheckbox);
uiPanel.addChild(statsLabel);
uiPanel.addChild(cooldownSlider);
uiPanel.addChild(cooldownLabel);

// UI event listeners
uiButton.onClick = () => {
    uiPanel.visible = !uiPanel.visible;
};

toggleButton.onClick = () => {
    isEnabled = !isEnabled;
    toggleButton.text = isEnabled ? "Disable" : "Enable";
    playNotificationSound();
    ModAPI.chat.addMessage("Auto-fishing " + (isEnabled ? "enabled" : "disabled"));
};

durabilityCheckbox.onCheck = (checked) => {
    durabilityCheck = checked;
};

antiAFKCheckbox.onCheck = (checked) => {
    antiAFK = checked;
};

cooldownSlider.onValueChanged = (value) => {
    COOLDOWN = value;
    cooldownLabel.text = `Cooldown: ${value}ms`;
};

// Helper functions
function playNotificationSound() {
    player.playSound("random.orb", 1.0, 1.0);
}

function checkRodDurability() {
    const rod = inventory.mainInventory[inventory.currentItem];
    return rod && rod.itemDamage < rod.maxDamage - 1;
}

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
    if (durabilityCheck && !checkRodDurability()) {
        ModAPI.chat.addMessage("Fishing rod is about to break!");
        return;
    }
    if (canCast()) {
        ModAPI.rightClickMouse();
        timer = 15;
    }
}

// Event listeners
ModAPI.addEventListener("packetsoundeffect", (ev) => {
    if (isEnabled && ev.soundName === "random.splash") {
        rightClick();
        fishCaught++;
        statsLabel.text = `Fish Caught: ${fishCaught}`;
        playNotificationSound();
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

        if (antiAFK) {
            afkTimer++;
            if (afkTimer > 6000) { // 5 minutes
                player.rotationYaw += 0.1;
                afkTimer = 0;
            }
        }
    } catch (error) {
        ModAPI.chat.addMessage("Error in auto-fishing mod: " + error.message);
    }
});

// Initial UI setup
ModAPI.gui.addElement(uiButton);
ModAPI.gui.addElement(uiPanel);
