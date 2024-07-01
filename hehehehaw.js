let decoder = new TextDecoder();
let listPseudos;
let menuVisible = false;

// Create menu container
let menuContainer = document.createElement('div');
menuContainer.id = 'spectator-menu';
menuContainer.style.display = 'none';
menuContainer.style.position = 'absolute';
menuContainer.style.top = '50%';
menuContainer.style.left = '50%';
menuContainer.style.transform = 'translate(-50%, -50%)';
menuContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
menuContainer.style.padding = '20px';
menuContainer.style.borderRadius = '10px';
menuContainer.style.color = 'white';
menuContainer.style.fontFamily = 'Arial, sans-serif';
menuContainer.style.zIndex = '1000';
menuContainer.style.cursor = 'move';

// Create title
let title = document.createElement('h2');
title.textContent = 'Spectator Menu';
title.style.marginTop = '0';
title.style.marginBottom = '15px';
title.style.textAlign = 'center';
menuContainer.appendChild(title);

// Create select element
let select = document.createElement('select');
select.style.width = '100%';
select.style.padding = '5px';
select.style.marginBottom = '10px';
select.style.backgroundColor = '#333';
select.style.color = 'white';
select.style.border = 'none';
select.style.borderRadius = '5px';

// Create button container
let buttonContainer = document.createElement('div');
buttonContainer.style.display = 'flex';
buttonContainer.style.justifyContent = 'space-between';

// Create spectate button
let spectateButton = document.createElement('button');
spectateButton.textContent = 'Spectate';
spectateButton.style.padding = '5px 10px';
spectateButton.style.backgroundColor = '#4CAF50';
spectateButton.style.color = 'white';
spectateButton.style.border = 'none';
spectateButton.style.borderRadius = '5px';
spectateButton.style.cursor = 'pointer';

// Create close button
let closeButton = document.createElement('button');
closeButton.textContent = 'Close';
closeButton.style.padding = '5px 10px';
closeButton.style.backgroundColor = '#f44336';
closeButton.style.color = 'white';
closeButton.style.border = 'none';
closeButton.style.borderRadius = '5px';
closeButton.style.cursor = 'pointer';

buttonContainer.appendChild(spectateButton);
buttonContainer.appendChild(closeButton);

menuContainer.appendChild(select);
menuContainer.appendChild(buttonContainer);

document.body.appendChild(menuContainer);

function updatePlayerList() {
    if (Minecraft.$theWorld) {
        select.innerHTML = "";
        listPseudos = [];
        Minecraft.$theWorld.$playerEntities.$array1.data.forEach(element => {
            if (element) {
                listPseudos.push(decoder.decode(new Uint8Array(element.$getName().$characters.data)));
            }
        });
        listPseudos.forEach(element => {
            let option = document.createElement('option');
            option.innerText = element + ((listPseudos.indexOf(element) === 0) ? " (you)" : "");
            option.value = element;
            select.appendChild(option);
        });
        if (document.querySelector(`option[value="${Minecraft.$renderViewEntity.$getName()}"]`)) {
            document.querySelector(`option[value="${Minecraft.$renderViewEntity.$getName()}"]`).toggleAttribute('selected');
        }
    }
}

function spectatePlayer() {
    window.profile = Minecraft.$theWorld.$playerEntities.$array1.data.find(function (element) {
        if (element) {
            return element.$getName() == select.value;
        } else {
            return null;
        }
    });
    if (profile) {
        Minecraft.$renderViewEntity = profile;
        Minecraft.$gameSettings.$hideGUI = false;  // Always show UI
    }
}

function resetToOwnView() {
    Minecraft.$renderViewEntity = Minecraft.$thePlayer;
    Minecraft.$gameSettings.$hideGUI = false;  // Ensure UI is visible
}

spectateButton.addEventListener('click', spectatePlayer);

closeButton.addEventListener('click', function() {
    menuContainer.style.display = 'none';
    menuVisible = false;
    resetToOwnView();
});

document.addEventListener('keydown', function(e) {
    if (e.key === ']') {
        menuVisible = !menuVisible;
        if (menuVisible) {
            updatePlayerList();
            menuContainer.style.display = 'block';
        } else {
            menuContainer.style.display = 'none';
            resetToOwnView();
        }
    }
});

ModAPI.addEventListener("frame", () => {
    if (Minecraft.$theWorld && Minecraft.$theWorld.$playerEntities.$array1.data.length > 1) {
        // Menu visibility is now controlled by the ']' key
    } else {
        menuContainer.style.display = 'none';
        menuVisible = false;
    }
});

// Make the menu draggable
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

function dragStart(e) {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;

    if (e.target === menuContainer) {
        isDragging = true;
    }
}

function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;

    isDragging = false;
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, menuContainer);
    }
}

function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
}

menuContainer.addEventListener("mousedown", dragStart, false);
document.addEventListener("mouseup", dragEnd, false);
document.addEventListener("mousemove", drag, false);
