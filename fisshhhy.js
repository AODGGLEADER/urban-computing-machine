ModAPI.require("player");
ModAPI.require("gui");
ModAPI.require("rendering");
ModAPI.require("audio");

// Auto-fishing variables
var fishRodId = ModAPI.items.fishing_rod.getID();
var timer = 0;
var autoFishingEnabled = true;

// Statistics
var fishCaught = 0;
var rareCaught = 0;
var currentStreak = 0;
var bestStreak = 0;
var fishingStartTime = 0;

// UI variables
var uiVisible = false;
var uiSettings = {
    showStats: true,
    showTimer: true,
    playAlerts: true,
    showVisualIndicator: true
};

// Colors
const DARK_BLUE = 0x000033;
const LIGHT_BLUE = 0x3366CC;
const WHITE = 0xFFFFFF;

// Main auto-fishing logic
ModAPI.addEventListener("update", () => {
    if (!autoFishingEnabled) return;

    if (timer > 0) {
        timer--;
        return;
    }

    if (ModAPI.player.fishEntity) return;

    if (isHoldingFishingRod()) {
        rightClick();
    }
});

ModAPI.addEventListener("packetsoundeffect", (ev) => {
    if (ev.soundName === "random.splash" && autoFishingEnabled) {
        rightClick();
        updateStats();
    }
});

function rightClick() {
    if (!isHoldingFishingRod()) return;
    ModAPI.rightClickMouse();
    timer = 15;
}

function isHoldingFishingRod() {
    var heldItem = ModAPI.player.getHeldItem();
    return heldItem && heldItem.itemId === fishRodId;
}

function updateStats() {
    fishCaught++;
    currentStreak++;
    if (currentStreak > bestStreak) bestStreak = currentStreak;
    if (Math.random() < 0.1) {
        rareCaught++;
        if (uiSettings.playAlerts) playRareCatchSound();
    }
}

function playRareCatchSound() {
    ModAPI.audio.playSound("random.orb", 1.0, 1.0);
}

// UI Rendering
ModAPI.addEventListener("render", () => {
    if (uiVisible) renderUI();
    if (uiSettings.showVisualIndicator && isHoldingFishingRod()) {
        ModAPI.rendering.drawRect(10, 10, 30, 30, LIGHT_BLUE);
    }
    if (uiSettings.showStats) renderStats();
    if (uiSettings.showTimer) renderTimer();
});

function renderUI() {
    // Main UI background
    ModAPI.rendering.drawRect(100, 100, 300, 200, DARK_BLUE);
    
    // Title
    ModAPI.rendering.drawString("Auto-Fishing Settings", 120, 110, WHITE);
    
    // Settings options
    renderToggle("Enable Auto-Fishing", 120, 130, autoFishingEnabled, (val) => autoFishingEnabled = val);
    renderToggle("Show Statistics", 120, 150, uiSettings.showStats, (val) => uiSettings.showStats = val);
    renderToggle("Show Timer", 120, 170, uiSettings.showTimer, (val) => uiSettings.showTimer = val);
    renderToggle("Play Alerts", 120, 190, uiSettings.playAlerts, (val) => uiSettings.playAlerts = val);
    renderToggle("Visual Indicator", 120, 210, uiSettings.showVisualIndicator, (val) => uiSettings.showVisualIndicator = val);
    
    // Close button
    if (ModAPI.rendering.isMouseOver(350, 105, 40, 20)) {
        ModAPI.rendering.drawRect(350, 105, 40, 20, LIGHT_BLUE);
        if (ModAPI.input.isMouseButtonDown(0)) uiVisible = false;
    }
    ModAPI.rendering.drawString("Close", 355, 110, WHITE);
}

function renderToggle(label, x, y, value, callback) {
    ModAPI.rendering.drawString(label, x, y, WHITE);
    let toggleX = x + 150;
    let toggleColor = value ? LIGHT_BLUE : DARK_BLUE;
    ModAPI.rendering.drawRect(toggleX, y, 20, 10, toggleColor);
    if (ModAPI.rendering.isMouseOver(toggleX, y, 20, 10) && ModAPI.input.isMouseButtonDown(0)) {
        callback(!value);
    }
}

function renderStats() {
    ModAPI.rendering.drawString(`Fish: ${fishCaught} | Rare: ${rareCaught} | Streak: ${currentStreak} | Best: ${bestStreak}`, 10, ModAPI.gui.getScaledHeight() - 40, WHITE);
}

function renderTimer() {
    if (isHoldingFishingRod()) {
        if (fishingStartTime === 0) fishingStartTime = Date.now();
        let sessionTime = Math.floor((Date.now() - fishingStartTime) / 1000);
        ModAPI.rendering.drawString(`Fishing Time: ${sessionTime}s`, 10, ModAPI.gui.getScaledHeight() - 20, WHITE);
    } else {
        fishingStartTime = 0;
    }
}

// Key binding to open/close UI
ModAPI.addEventListener("keypress", (ev) => {
    if (ev.key === "R") { // 'R' key to toggle UI
        uiVisible = !uiVisible;
    }
});

// Initialize
ModAPI.chat.print("Auto-Fishing Mod loaded. Press 'R' to open settings.");
