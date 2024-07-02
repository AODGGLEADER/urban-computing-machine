ModAPI.require("player");
ModAPI.require("gui");
ModAPI.require("world");

// Constants and variables
const COOLDOWN = 500;
const INVENTORY_SIZE = 36;
const fishRodId = ModAPI.items.fishing_rod.getID();
let isEnabled = false;
let fishCaught = 0;
let lastCastTime = 0;
let timer = 0;
let durabilityCheck = true;
let antiAFK = true;
let afkTimer = 0;
let compatibilityMode = false;
let antiDetectionMode = true;
let fishTypes = {raw_fish: 0, raw_salmon: 0, clownfish: 0, pufferfish: 0, treasure: 0, junk: 0};
let startTime, endTime;
let fishingRate = 0;
let longestSession = 0;
let totalCatches = 0;
let lastCatchTime = 0;
let totalTimeBetweenCatches = 0;
let averageTimeBetweenCatches = 0;

// Cached references
const player = ModAPI.player;
const inventory = player.inventory;

// UI elements
const uiButton = ModAPI.gui.createButton("AF", 10, 10, 30, 20);
const uiPanel = ModAPI.gui.createPanel(50, 50, 200, 420);
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
const compatibilityModeCheckbox = ModAPI.gui.createCheckbox("Compatibility Mode", 10, 240, 180, 20);
const antiDetectionModeCheckbox = ModAPI.gui.createCheckbox("Anti-Detection", 10, 270, 180, 20);
antiDetectionModeCheckbox.checked = true;

const graphCanvas = ModAPI.gui.createCanvas(180, 100);
const graphData = new Array(180).fill(0);

const avgTimeLabel = ModAPI.gui.createLabel("Avg time between catches: N/A", 10, 380, 180, 20);

uiPanel.addChild(titleLabel);
uiPanel.addChild(toggleButton);
uiPanel.addChild(durabilityCheckbox);
uiPanel.addChild(antiAFKCheckbox);
uiPanel.addChild(statsLabel);
uiPanel.addChild(cooldownSlider);
uiPanel.addChild(cooldownLabel);
uiPanel.addChild(compatibilityModeCheckbox);
uiPanel.addChild(antiDetectionModeCheckbox);
uiPanel.addChild(graphCanvas);
uiPanel.addChild(avgTimeLabel);

// Advanced statistics labels
const fishTypeLabels = Object.keys(fishTypes).map((type, index) => {
    const label = ModAPI.gui.createLabel(`${type}: 0`, 10, 300 + index * 20, 180, 20);
    uiPanel.addChild(label);
    return label;
});

// UI event listeners
uiButton.onClick = () => {
    uiPanel.visible = !uiPanel.visible;
};

toggleButton.onClick = () => {
    isEnabled = !isEnabled;
    toggleButton.text = isEnabled ? "Disable" : "Enable";
    if (isEnabled) {
        startTime = Date.now();
    } else {
        endTime = Date.now();
        const sessionLength = (endTime - startTime) / 60000; // in minutes
        if (sessionLength > longestSession) {
            longestSession = sessionLength;
            ModAPI.chat.addMessage(`New longest session: ${longestSession.toFixed(2)} minutes!`);
        }
    }
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

compatibilityModeCheckbox.onCheck = (checked) => {
    compatibilityMode = checked;
};

antiDetectionModeCheckbox.onCheck = (checked) => {
    antiDetectionMode = checked;
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

function updateStats() {
    const totalFish = Object.values(fishTypes).reduce((a, b) => a + b, 0);
    const sessionTime = (Date.now() - startTime) / 60000; // in minutes
    fishingRate = totalFish / sessionTime;
    statsLabel.text = `Total: ${totalFish} | Rate: ${fishingRate.toFixed(2)}/min`;
    
    Object.entries(fishTypes).forEach(([type, count], index) => {
        fishTypeLabels[index].text = `${type}: ${count} (${((count / totalCatches) * 100).toFixed(1)}%)`;
    });

    avgTimeLabel.text = `Avg time between catches: ${averageTimeBetweenCatches.toFixed(2)}s`;
}

function addRandomDelay() {
    return antiDetectionMode ? Math.random() * 500 + 500 : 0; // Random delay between 500ms and 1000ms if enabled
}

function updateGraph() {
    graphData.push(fishingRate);
    graphData.shift();
    graphCanvas.clear();
    graphCanvas.setColor(255, 255, 255);
    for (let i = 0; i < graphData.length; i++) {
        const height = graphData[i] * 5; // Scale the height based on fishing rate
        graphCanvas.drawLine(i, 100, i, 100 - height);
    }
}

function manageInventory() {
    if (!ModAPI.player.inventory || !ModAPI.player.inventory.mainInventory) {
        console.log("Inventory management not supported in this API version");
        return;
    }

    for (let i = 0; i < INVENTORY_SIZE; i++) {
        const item = ModAPI.player.inventory.mainInventory[i];
        if (item) {
            if (item.itemId === ModAPI.items.raw_fish.getID() ||
                item.itemId === ModAPI.items.raw_salmon.getID() ||
                item.itemId === ModAPI.items.clownfish.getID() ||
                item.itemId === ModAPI.items.pufferfish.getID()) {
                // Move fish to the end of the inventory
                ModAPI.player.inventory.moveItemToSlot(i, INVENTORY_SIZE - 1);
            } else if (item.itemId !== fishRodId) {
                // Discard non-fish items (except fishing rods)
                ModAPI.player.inventory.discardItem(i);
            }
        }
    }
}

function determineCatchType() {
    const rand = Math.random();
    let cumulativeProbability = 0;

    // Calculate probabilities based on previous catches
    const probabilities = Object.fromEntries(
        Object.entries(fishTypes).map(([type, count]) => [type, (count + 1) / (totalCatches + Object.keys(fishTypes).length)])
    );

    for (const [type, probability] of Object.entries(probabilities)) {
        cumulativeProbability += probability;
        if (rand < cumulativeProbability) {
            return type;
        }
    }

    // Fallback to raw_fish if something goes wrong
    return "raw_fish";
}

function updateTimeBetweenCatches() {
    const currentTime = Date.now();
    if (lastCatchTime !== 0) {
        const timeSinceLastCatch = (currentTime - lastCatchTime) / 1000; // in seconds
        totalTimeBetweenCatches += timeSinceLastCatch;
        averageTimeBetweenCatches = totalTimeBetweenCatches / totalCatches;
    }
    lastCatchTime = currentTime;
}

// Event listeners
ModAPI.addEventListener("packetsoundeffect", (ev) => {
    if (isEnabled && ev.soundName === "random.splash") {
        setTimeout(() => {
            rightClick();
            fishCaught++;
            totalCatches++;
            
            const catchType = determineCatchType();
            fishTypes[catchType]++;
            
            updateTimeBetweenCatches();
            updateStats();
            updateGraph();
            playNotificationSound();
            
            if (compatibilityMode) {
                // Add extra delay in compatibility mode
                setTimeout(manageInventory, Math.random() * 1000 + 1000);
            } else {
                manageInventory();
            }
        }, addRandomDelay());
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

        // Update graph every second
        if (ModAPI.world.getWorldTime() % 20 === 0) {
            updateGraph();
        }

    } catch (error) {
        ModAPI.chat.addMessage("Error in auto-fishing mod: " + error.message);
    }
});

// Initial UI setup
ModAPI.gui.addElement(uiButton);
ModAPI.gui.addElement(uiPanel);
