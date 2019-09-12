var countClick = 0,
    timer,
    time = {},
    hours = 0,
    minutes = 0,
    seconds = 0,
    moveCounter = 0,
    renderFinish = false,
    startSelected = false,
    pathSelected = false,
    finishConverting = false,
    ownerSaved = false,
    vrView = false,
    pathArray = [],
    availablePathsArray = [],
    activePathArray = [],
    labyrinthArray = [],
    disableIfSelected = [],
    validPathOptions = [],
    validGridOptions = [],
    validPaths = [],
    countSelectedBlocks = 0,
    finalArray = [],
    newArr = [],
    mapArray = [],
    lastClicked,
    applyLabyrinth,
    newCreatedMap,
    newCreatedMapIndex,
    maps = [],
    loadMap = JSON.parse(localStorage.getItem('maps')) ? JSON.parse(localStorage.getItem('maps')) : [];

/* === Usefull functions === */
Date.prototype.getDateString = function () {
    var dd = String(this.getDate()).padStart(2, '0'),
        mm = String(this.getMonth() + 1).padStart(2, '0'),
        yyyy = String(this.getFullYear()).padStart(2, '0');

    return dd + '.' + mm + '.' + yyyy;
};

function getRandomId() {
    var random = function () {
        return (((1+Math.random()) * 0x10000)|0).toString(16).substring(1);
    };
    return (random()+random()+"-"+random()+"-"+random()+"-"+random()+"-"+random()+random()+random());
}
function getSeconds(timeObject) {
    if (typeof timeObject === 'undefined') {
       return 0;
    }
    return ((timeObject.hours * 60) * 60) + (timeObject.minutes * 60) + timeObject.seconds
}
function getCloseButton(targetModal) {
    var fragment = document.createDocumentFragment(),
        closeBtnTemplate = document.createElement('div'),
        firstLine = document.createElement('div'),
        secondLine = document.createElement('div');

    firstLine.classList.add('first-line');
    secondLine.classList.add('second-line');
    closeBtnTemplate.classList.add('close-btn');
    closeBtnTemplate.appendChild(firstLine);
    closeBtnTemplate.appendChild(secondLine);
    fragment.appendChild(closeBtnTemplate);

    closeBtnTemplate.addEventListener('click', function () {
        targetModal.classList.add('hidden');
        targetModal.removeChild(closeBtnTemplate);
        document.querySelector('.editor').classList.remove('blury');
    });

    return fragment;
}
function modalFunction(modalElements) {
    for (element in modalElements) {
        modalElements[element].addEventListener('click', function (e) {
            var el = e.target,
                target = document.getElementById(el.dataset.target);

            target.classList.remove('hidden');
            target.prepend(getCloseButton(target));
            document.querySelector('.editor').classList.add('blury');
        });
    }
}

/* === Timer === */
function countTime() {
    var timerValue = document.getElementById('timer');
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
            minutes = 0;
            hours++;
        }
    }
    var fullTime = String(hours).padStart(2, '0') + ":" + String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0');
    time = {
        seconds: seconds,
        minutes: minutes,
        hours: hours,
        stringTime: fullTime,
        owner: {}
    };
    timerValue.setAttribute('value', fullTime);
    count();
}

function count() {
    timer = setTimeout(countTime, 1000);
}
/* === Show valid options after selecting path === */
function showValidOptions(pathIndex) {
    var activePaths = availablePathsArray;
    
    countSelectedBlocks = countSelectedBlocks + 1;

    Array.from(validPathOptions[pathIndex]).forEach(function (option) {
        var rest = activePaths.indexOf(parseFloat(option));
        // validPathOption looks like [clicked element, right, left, bottom, top]
        var pathOption;
        if (vrView) {
            pathOption = document.getElementsByClassName('grid-path')[option];
        } else {
            pathOption = document.getElementsByClassName('path')[option];
        }
        lastClicked = pathIndex;

        if (rest > -1) {
            activePaths.splice(rest, 1);
        }

        // mark path to use, but not already disabled blocks
        if (activePathArray[option] && !pathOption.classList.contains('disabled')) {
            labyrinthArray[pathIndex].selected = true;
            activePathArray[pathIndex] = false;

            pathOption.style.pointerEvents = 'auto';
            pathOption.classList.add('to-use');
            if (vrView && !pathOption.classList.contains('selected') && !pathOption.classList.contains('start-selected') && !pathOption.classList.contains('start-selected')) {
                pathOption.setAttribute('color', '#ec902e');
                pathOption.classList.add('clickable');
            }
        }
    });
    /* === Disable block - create wall === */
    Object.keys(disableIfSelected[pathIndex]).map(function (position) {
        var disOption = disableIfSelected[pathIndex][position],
            pathElement;
            if (vrView) {
                pathElement = document.getElementsByClassName('grid-path')[disOption.disable];
            } else {
                pathElement = document.getElementsByClassName('path')[disOption.disable];
            }
        var countDisabled = 0,
            checkSelected = Array.from(disOption.options).forEach(function (opt) {
            if (labyrinthArray[opt].selected) {
                countDisabled = countDisabled + 1;
                if (disOption.options.length === countDisabled) {
                    countDisabled = 0;
                    pathElement.classList.remove('to-use');
                    pathElement.classList.add('disabled');
                    if (vrView) {
                        pathElement.setAttribute('color', '#333333');
                    }
                    pathElement.style.pointerEvents = 'none';
                    labyrinthArray[disOption.disable].active = false;
                    document.getElementsByClassName('js-clock');
                    document.querySelector(".js-clock");
                    document.getElementsByTagName('h1');
                }
            }
        });
    });
    /* === Show selected paths / adding class to selected === */
    var paths = Array.from(pathArray).forEach(function (item) {
        var thisItem;
        if (vrView) {
            thisItem = document.getElementsByClassName('grid-path')[item];
        } else {
            thisItem = document.getElementsByClassName('path')[item];
        }
        Array.from(activePaths).forEach(function (ap) {
            if (item === ap) {
                thisItem.style.pointerEvents = 'none';
                thisItem.classList.remove('to-use');
            }
        });
        if (!activePathArray[item]) {
            thisItem.style.pointerEvents = 'none';
            thisItem.classList.remove('to-use');
        }
    });
}
/* === Selecting start function === */
function selectStart(element, index) {
    var clickable = document.querySelectorAll('.clickable');
    Array.from(clickable).forEach(function (clickableElement) {
        clickableElement.classList.remove('clickable');
    });

    if (renderFinish) {
        countClick = 1;
        labyrinthArray[index].option = 2;
        element.classList.add('start-selected');
        if (vrView) {
            element.setAttribute('color', '#fd2929');
        }
        startSelected = true;
        showValidOptions(index);
    }
}
/* === Selecting path function === */
function selectPath(element, index) {
    if (startSelected && renderFinish && labyrinthArray.length !== 0) {
        element.classList.add('selected');
        if (vrView) {
            element.setAttribute('color', '#1ace65');
        }
        showValidOptions(index);
    }
}
/* === Labyrinth creator function - based on click counting (recognize which is start, witch is path) === */
function selectLabyrinthPath(event) {
    var element = event.target,
        pathId = parseFloat(element.dataset.pathIndex);

    switch (countClick) {
        case 0:
            selectStart(element, pathId);
            break;
        case 1:
            selectPath(element, pathId);
            break;
        default:
            return false;
    }
}
/* === Setting rest nonechoosed options to disabled (Walls) === */
function setRestToDisabled() {
    var disableBlock = Object.keys(labyrinthArray).map(function (block) {
        var pathElement = document.getElementsByClassName('path')[block];
        if (!labyrinthArray[block].selected) {
            labyrinthArray[block].active = false;
            pathElement.classList.remove('to-use');
            pathElement.classList.remove('clickable');
            pathElement.classList.add('disabled');
            pathElement.style.pointerEvents = 'none';
        }
    });
}
/* Update labyrinth array and set choosen path option to 1 (selected green path):
    labyrinthArray = [
        0: {active: false, selected: false, pathId: 0, option: 0}
    ]
*/
function convertBlocks() {
    labyrinthArray[lastClicked].option = 3;
    document.getElementsByClassName('path')[lastClicked].classList.remove('to-use');
    document.getElementsByClassName('path')[lastClicked].classList.add('finish');
    var convert = Object.keys(labyrinthArray).map(function (path) {
        if (labyrinthArray[path].active && labyrinthArray[path].selected && labyrinthArray[path].option === 0) {
            labyrinthArray[path].option = 1;
        }
    });
    finishConverting = true;
}
/* Create final array to save - will be used to generate 3D blocks:
    finalArray = [0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1, 2, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]
    0 - define wall
    1 - define path
    2 - define start
    3 - define finish
*/
function createArrayToSave() {
    Object.keys(labyrinthArray).map(function (path) {
        finalArray.push(parseFloat(labyrinthArray[path].option));
    });
}
/* === Render 2D view (finalArray and map array) to 3D blocks === */
function generate3DBlocks(map, final) {
    var scene = document.getElementById('labyrinth-scene');
    var container = document.createDocumentFragment();

    mapArray = typeof map !== 'undefined' ? map : mapArray;
    finalArray = typeof final !== 'undefined' ? final : finalArray;

    Array.from(mapArray).forEach(function (n, x) {
        Array.from(mapArray).forEach(function (a, z) {
            var blockHtml = document.createElement('a-box');
            blockHtml.setAttribute('rotation', "0 0 0");
            blockHtml.setAttribute('color', "#0e7ef6");
            blockHtml.setAttribute('position', `${x} 0.5 ${z}`);
            /* Render finish block (blue) */
            if (finalArray[mapArray[x][z]] === 3) {
                blockHtml.setAttribute('color', "blue");
                blockHtml.setAttribute('data-name', "finish");
                blockHtml.setAttribute('option', "3");
                blockHtml.setAttribute('height', "0.1");
                blockHtml.setAttribute('width', "0.90");
                blockHtml.setAttribute('depth', "0.90");
                blockHtml.setAttribute('position', `${x} 0.1 ${z}`);
            }
            /* Render start block (red) */
            if (finalArray[mapArray[x][z]] === 2) {
                blockHtml.setAttribute('color', "#ff2c2c");
                blockHtml.setAttribute('data-name', "start");
                blockHtml.setAttribute('option', "2");
                blockHtml.setAttribute('height', "0.1");
                blockHtml.setAttribute('width', "0.90");
                blockHtml.setAttribute('depth', "0.90");
                blockHtml.setAttribute('position', `${x} 0.1 ${z}`);
            }
            /* Render path block (green) */
            if (finalArray[mapArray[x][z]] === 1) {
                blockHtml.setAttribute('color', "#1ace65");
                blockHtml.setAttribute('data-name', "path");
                blockHtml.setAttribute('option', "1");
                blockHtml.setAttribute('height', "0.1");
                blockHtml.setAttribute('width', "0.90");
                blockHtml.setAttribute('depth', "0.90");
                blockHtml.setAttribute('position', `${x} 0.1 ${z}`);
            }
            /* Render wall block (0) */
            if (finalArray[mapArray[x][z]] === 0) {
                blockHtml.setAttribute('color', "#333333");
                blockHtml.setAttribute('data-name', "wall");
                blockHtml.setAttribute('option', "0");
                blockHtml.setAttribute('height', "5");
            }
            container.appendChild(blockHtml);
        });
    });
    document.getElementById('timer').setAttribute('visible', true);
    scene.appendChild(container);
}
/* === Setting player position === */
function setPlayerPosition() {
    var start = document.querySelector('a-box[option="2"]');
    var player = document.getElementById('player');

    if (!AFRAME.components['get-start-position']) {
        AFRAME.registerComponent('get-start-position', {
            init: function () {
                var position = this.el.object3D.position;
                player.setAttribute('position', {
                    x: position.x,
                    y: 0.5,
                    z: position.z
                });
                player.setAttribute('rotation', "0 180 0");
                document.querySelector('a-scene').enterVR();
            }
        });
    }
    
    start.setAttribute('get-start-position', '');
}
/* === Logic for saving best time / hiscore and his owner === */
function saveBestTimeOwner(map, index) {
    var ownerPanel = document.getElementById('hiscore-owner'),
        saveButton = document.getElementById('save-owner'),
        ownerName = document.getElementById('owner-name');

    document.querySelector('a-scene').exitVR();
    var randomId = getRandomId();

    if (map && typeof index === 'number' || map && typeof index === 'string') {
        if (loadMap[index].id === map) {
            if (getSeconds(loadMap[index].time) > getSeconds(time) || getSeconds(loadMap[index].time) === 0 || Number.isNaN(getSeconds(loadMap[index].time))) {
                ownerPanel.classList.remove('hidden');
                saveButton.addEventListener('click', function () {
                    if (newCreatedMap && newCreatedMapIndex !== '') {
                        map = newCreatedMap.id;
                        index = newCreatedMapIndex;
                    }
                    if (ownerName.value !== '') {
                        ownerSaved = true;

                        loadMap[index].time = time;
                        loadMap[index].time.owner.id = randomId;
                        loadMap[index].time.owner.name = ownerName.value;
                        loadMap[index].time.owner.date = new Date().getDateString();
                        /* Save new hiscore to localstorage */
                        localStorage.setItem('maps', JSON.stringify(loadMap));
                        resetStats();
                    }
                });
            } else {
                resetStats();
            }
        }
    }
}
/* === Reset all stats function === */
function resetStats() {
    var loadedMaps = document.getElementById('loadedMaps');
    var scene = document.querySelector('a-scene');

    document.querySelector('.preview').classList.add('hidden');
    document.querySelector('.editor').classList.remove('hidden');
    document.querySelector('[cursor]').setAttribute('visible', true);
    document.getElementById('loadedMaps').classList.remove('hidden');
    document.getElementById('grid-settings').value = '';
    document.getElementById('owner-name').value = '';
    document.getElementById('grid-settings').removeAttribute('disabled');
    document.getElementById('accept-settings').removeAttribute('disabled');
    document.getElementById('settings-place').classList.remove('hidden');
    document.getElementById('hiscore-owner').classList.add('hidden');
    document.getElementById('timer').setAttribute('value', '00:00:00');
    renderFinish = false;
    countClick = 0;
    countClick = 0;
    time = {};
    hours = 0;
    minutes = 0;
    seconds = 0;
    moveCounter = 0;
    renderFinish = false;
    startSelected = false;
    pathSelected = false;
    finishConverting = false;
    ownerSaved = false;
    vrView = false;
    pathArray = [];
    availablePathsArray = [];
    activePathArray = [];
    labyrinthArray = [];
    disableIfSelected = [];
    validPathOptions = [];
    validGridOptions = [];
    validPaths = [];
    countSelectedBlocks = 0;
    finalArray = [];
    newArr = [];
    mapArray = [];
    maps = [];
    newCreatedMap = undefined;
    newCreatedMapIndex = '';
    Array.from(scene.children).forEach(function (el) {
        if (typeof el !== 'undefined') {
            if (el.tagName !== 'CANVAS' && !el.classList.contains('a-loader-title') && !el.classList.contains('a-enter-vr') && !el.classList.contains('a-orientation-modal') && el.tagName !== "A-ENTITY") {
                scene.removeChild(el);
            }
        }
    });
    document.getElementById('render-grid').innerHTML = '';
    Array.from(loadedMaps.children).forEach(function (el) {
        if (typeof el !== 'undefined') {
            if (!el.classList.contains('close-btn')) {
                loadedMaps.removeChild(el);
            }
        }
    });
    loadMap = JSON.parse(localStorage.getItem('maps')) ? JSON.parse(localStorage.getItem('maps')) : [];
    document.getElementById('creator-name').value = '';
    document.getElementById('render-grid').value = '';
    loadMapsPreview(loadMap);
}
/* === Player control - moving function === */
function movePlayer(mapId, mapIndex) {
    var player = document.getElementById('player');
    var pathBoxes = document.querySelectorAll('a-box[option="1"], a-box[option="3"]');

    if (!AFRAME.components['movement']) {
        AFRAME.registerComponent('movement', {
            init: function () {
                var position = this.el.object3D.position;
                
                this.el.addEventListener('click', function (evt) {
                    /* Count will start after teleporting to first block */
                    if (moveCounter === 0) {
                        moveCounter = 1;
                        count();
                    }
                    /* Triggering finish block */
                    if (evt.target.dataset.name === 'finish') {
                        clearTimeout(timer);
                        if (newCreatedMapIndex) {
                            saveBestTimeOwner(newCreatedMap.id, newCreatedMapIndex);
                        } else {
                            saveBestTimeOwner(mapId, mapIndex);
                        }
                    }
                    /* Set new color on path block for a 20sec (something like footsteps) */
                    if (evt.target.dataset.name === 'path') {
                        evt.target.setAttribute('color', "#e68815");
                    }
                    setTimeout(function () {
                        evt.target.setAttribute('color', "#1ace65");
                    }, 20000);
                    player.setAttribute('position', {
                        x: position.x,
                        y: 0.5,
                        z: position.z
                    });
                });
            }
        });
    }
    
    Array.from(pathBoxes).forEach(function (e, i) {
        pathBoxes[i].setAttribute('movement', '');
    });
}

function renderLabyrinth(loadedLab, indexMap) {
    if (!loadedLab && !indexMap) {
        var errorMsg = document.getElementsByClassName('apply-error')[0],
            message = '';
        /* Validation for selected blocks - "how much have you still to select" */
        if (labyrinthArray.length === 0 && !vrView) {
            message = 'Please define your map first, or load a created one, before you can start';
            errorMsg.style.display = 'block';
        } else if ((labyrinthArray.length / 3) - 5 <= countSelectedBlocks || vrView) {
            errorMsg.innerHTML = '';
            errorMsg.style = '';
            setRestToDisabled();
            convertBlocks();
        } else {
            errorMsg.innerHTML = 'Please select more blocks. <br> <b>Blocks to select:</b> ' + Math.round((labyrinthArray.length / 3) - countSelectedBlocks) + '<br> <b>Selected Blocks: </b>' + countSelectedBlocks;
            errorMsg.style.display = 'block';
        }
        errorMsg.innerHTML = message;
    } else {
        finishConverting = true;
        renderFinish = true;
        startSelected = true;
    }
    if (renderFinish && startSelected && finishConverting) {
        var preview3D = document.querySelector('.preview'),
            editor = document.querySelector('.editor');

        /* New or loaded maps */
        if (typeof loadedLab !== 'undefined' && indexMap) {
            generate3DBlocks(loadedLab.map, loadedLab.final);
            setPlayerPosition();
            movePlayer(loadedLab.id, indexMap);
        } else {
            createArrayToSave();
            /* loadMap is an Array, that will be saved in localstorage, with all data like:
                - person that created map
                - finalArray to render correct places (wall, start, path, finish)
                - mapArray (3x3 example): [
                    [0, 1, 2, 3, 4],
                    [5, 6, 7, 8, 9],
                    [10, 11, 12, 13, 14],
                    [15, 16, 17, 18, 19],
                    [20, 21, 22, 23, 24]
                ]
                - best time (owner, time, date)
            */
            loadMap.push({
                id: getRandomId(),
                creator: {
                    id: getRandomId(),
                    name: document.getElementById('creator-name').value,
                    date: new Date().getDateString()
                },
                final: finalArray.reverse(),
                map: mapArray.reverse(),
                time: time
            });

            newCreatedMap = loadMap[loadMap.length - 1];
            newCreatedMapIndex = loadMap.length - 1;

            localStorage.setItem('maps', JSON.stringify(loadMap));

            generate3DBlocks(loadMap[Object.keys(loadMap).length - 1].map, loadMap[Object.keys(loadMap).length - 1].final);
            setPlayerPosition();
            movePlayer(loadMap[loadMap.length - 1].id, loadMap.length - 1);
        }

        preview3D.classList.remove('hidden');
        editor.classList.add('hidden');
        document.getElementById('loadedMaps').classList.add('hidden');
        document.getElementById('creator-place').innerHTML = '';
    }
}
/* === Load saved maps function === */
function loadMapsPreview(m) {
    var container = document.createDocumentFragment(),
        loadedMaps = document.getElementById('loadedMaps');
        
    if (!loadedMaps.classList.contains('hidden')) {
        loadedMaps.classList.add('hidden');
    }
    m.forEach(function (mapObject, mapIndex) {
        var final = mapObject.final,
            mapBox = document.createElement('div'),
            creatorDiv = document.createElement('p'),
            placeWidth = Math.sqrt(final.length) * (25 + 2) + 20,
            creatorName = typeof mapObject.creator !== 'undefined' ? mapObject.creator.name : 'NotDefined',
            validName = typeof mapObject.time !== 'undefined' && typeof mapObject.time.owner !== 'undefined' && typeof mapObject.time.owner.name !== 'undefined' ? mapObject.time.owner.name : 'Not played yet',
            validTime = typeof mapObject.time !== 'undefined' ? mapObject.time.stringTime : '00:00:00',
            validDate = typeof mapObject.time !== 'undefined' && typeof mapObject.time.owner !== 'undefined' && typeof mapObject.time.owner.date !== 'undefined' ? mapObject.time.owner.date : '-';

        mapBox.classList.add('map-preview');
        mapBox.setAttribute('style', `min-width: ${placeWidth}px; width: ${placeWidth}px`);
        mapBox.dataset.index = mapIndex;

        for (var i = 0; i < final.length; i++) {
            var mapElement = document.createElement('div');

            mapElement.dataset.pathIndex = i;
            switch (final[i]) {
                case 0:
                    mapElement.classList.add('path', 'disabled');
                    break;
                case 1:
                    mapElement.classList.add('path', 'selected');
                    break;
                case 2:
                    mapElement.classList.add('path', 'start-selected');
                    break;
                case 3:
                    mapElement.classList.add('path', 'finish');
                    break;
            }
            mapBox.appendChild(mapElement);
        }
        
        creatorDiv.classList.add('creator-name');
        creatorDiv.innerHTML  += '<span>Created by: <br></span>' + creatorName;
        mapBox.innerHTML += `
            <div class="hiscore-box">
                <p class="hi-score-owner"><span>Name:</span> <br> ${validName}</p>
                <p class="hi-score"><span>Best time:</span> <br> ${validTime}</p>
                <p class="hi-score-date"><span>Date:</span> <br> ${validDate}</p>
            </div>
        `;
        mapBox.prepend(creatorDiv);
        container.appendChild(mapBox);
    });
    document.getElementById('loadedMaps').appendChild(container);
    Array.from(document.querySelectorAll('.map-preview')).forEach(function (clickedMap) {
        clickedMap.addEventListener('click', function (e) {
            if (e.target.tagName !== 'P') {
                renderLabyrinth(loadMap[e.target.dataset.index], e.target.dataset.index);
            }
        });
    });
}

window.onload = function () {
    var acceptButton = document.getElementById('accept-settings'),
        loaded = document.getElementById('loadedMaps'),
        preview3D = document.querySelector('.preview'),
        loadMaps = this.loadMap,
        lastChange = 0;

    preview3D.classList.add('hidden');
    loaded.classList.add('hidden');
    applyLabyrinth = document.getElementById('apply');
    document.getElementById('timer').setAttribute('visible', false);
    
    document.querySelector('a-entity').setAttribute('test-new', '');
    
    function render2DPlane(value) {
        var gridSettingsNumber;
        if (vrView) {
            gridSettingsNumber = parseFloat(value);
        } else {
            gridSettingsNumber = parseFloat(document.getElementById('grid-settings').value);
        }
        var roundWalls = gridSettingsNumber + 2,
            sumOfPaths = roundWalls * roundWalls,
            vrInfo = document.getElementById('vr-info');
        var place;
            if (vrView) {
                place = document.getElementById('render-grid');
            } else {
                place = document.getElementById('creator-place');
            }
        var placeWidth = roundWalls * (25 + 2),
            fragment = document.createDocumentFragment();

        document.getElementById('timer').setAttribute('visible', false);

        if (gridSettingsNumber > 0) {
            if (lastChange !== gridSettingsNumber) {
                place.innerHTML = '';
            }

            lastChange = parseFloat(gridSettingsNumber);

            for (var p = 0; p < sumOfPaths; p++) {
                var path;
                if (value) {
                    path = document.createElement('a-plane');
                    path.classList.add('grid-path');
                    path.setAttribute('data-path-index', p);
                } else {
                    path = document.createElement('div');
                    path.classList.add('path');
                    path.dataset.pathIndex = p;
                }
                pathArray.push(p);

                fragment.appendChild(path);
            }
            place.appendChild(fragment);

            place.style.width = placeWidth + 'px';
            renderFinish = true;
        }
        
        for (var p = 0; p < pathArray.length; p = p+roundWalls) {
            newArr.push(pathArray[p]);
        }
        if (renderFinish) {
            var prev = 0,
                outer = Array.from(pathArray).forEach(function (item) {
                var pathItem;
                if (vrView) {
                    pathItem = place.querySelectorAll('.grid-path')[item];
                } else {
                    pathItem = place.querySelectorAll('.path')[item];
                }
                var pathIndex = parseFloat(pathItem.dataset.pathIndex),
                    isOutside = pathItem.dataset.pathIndex <= roundWalls
                    || pathItem.dataset.pathIndex - prev === roundWalls
                    || pathItem.dataset.pathIndex > sumOfPaths - roundWalls
                    && pathItem.dataset.pathIndex < sumOfPaths + 1,
                    rightSide = pathItem.dataset.pathIndex - prev === roundWalls - 1;

                if (isOutside) {
                    prev = pathItem.dataset.pathIndex;
                }
                if (isOutside || rightSide) {
                    pathItem.classList.add('disabled');
                }
                if (pathItem.className.indexOf('disabled') < 0) {
                    var right = pathIndex + 1,
                        left = pathIndex - 1,
                        bottom = pathIndex + parseFloat(roundWalls),
                        top = pathIndex - parseFloat(roundWalls),
                        bottomRight = pathIndex + parseFloat(roundWalls) + 1,
                        bottomLeft = pathIndex + parseFloat(roundWalls) - 1,
                        topRight = pathIndex - parseFloat(roundWalls) + 1,
                        topLeft = pathIndex - parseFloat(roundWalls) - 1;

                    /* Generate next choosable option */
                    validPathOptions[pathIndex] = [pathIndex, right, left, bottom, top];
                    /* Generate possible walls array for every block index */
                    disableIfSelected[pathIndex] = {
                        TopLeft: {
                            options: [pathIndex, right, topRight],
                            disable: top
                        },
                        TopRight: {
                            options: [pathIndex, left, topLeft],
                            disable: top
                        },
                        BottomLeft: {
                            options: [pathIndex, left, bottomLeft],
                            disable: bottom
                        },
                        BottomRight: {
                            options: [pathIndex, right, bottomRight],
                            disable: bottom
                        },
                        LeftTop: {
                            options: [pathIndex, top, topLeft],
                            disable: left
                        },
                        LeftBottom: {
                            options: [pathIndex, bottom, bottomLeft],
                            disable: left
                        },
                        RightTop: {
                            options: [pathIndex, top, topRight],
                            disable: right
                        },
                        RightBottom: {
                            options: [pathIndex, bottom, bottomRight],
                            disable: right
                        }
                    };
                    availablePathsArray.push(pathIndex);
                    activePathArray[pathIndex] = true;
                    /* Create standard option in labyrinthArray for choosable blocks */
                    labyrinthArray.push({
                        active: true,
                        selected: false,
                        pathId: pathIndex,
                        option: 0
                    });
                } else {
                    activePathArray[pathIndex] = false;
                    /* Create standard option in labyrinthArray for not choosable blocks */
                    labyrinthArray.push({
                        active: false,
                        selected: false,
                        pathId: pathIndex,
                        option: 0
                    });
                }
                if (vrView) {
                    if (!AFRAME.components['selectblock']) {
                        AFRAME.registerComponent('selectblock', {
                            init: function () {
                                var scene = document.getElementById('labyrinth-scene');
                                var selectedElement = this.el.object3D,
                                    index = this.el.dataset.pathIndex,
                                    el = this.el;
                                
                                this.el.addEventListener('click', function (evt) {
                                    if (labyrinthArray[index].active && el.classList.contains('clickable')) {
                                        selectLabyrinthPath(evt);
                                    }
                                });
                            }
                        });
                    }
                } else {
                    pathItem.onclick = function (event) {
                        if (labyrinthArray[pathIndex].active) {
                            selectLabyrinthPath(event);
                        }
                    };
                }
            });
            document.getElementById('grid-settings').setAttribute('disabled', true);
            acceptButton.setAttribute('disabled', true);

            mapArray = [...Array(roundWalls).keys()].reduce((prev, curr) => {
                return [...prev,  pathArray.slice(roundWalls * curr, roundWalls * curr + roundWalls)];
            }, []);

            if (vrView && value) {
                mapArray.forEach(function (e, x) {
                    mapArray.forEach(function (a, y) {
                        var planes = document.querySelectorAll('.grid-path'),
                            index = mapArray[x][y];
                            // planes[index].setAttribute('animation', 'easing: easeOutElastic; from: 0 0 0; to: 0.7 0.7 1; property: scale; dur: 2500; elasticity: 600;');
                            planes[index].setAttribute('scale', '0.7 0.7 1');
                            planes[index].setAttribute('rotate', '0 0 0');
                            planes[index].setAttribute('color', '#af71db');
                            if (labyrinthArray[index].active && countClick === 0) {
                                planes[index].classList.add('clickable');
                            }
                            if (planes[index].classList.contains('disabled')) {
                                planes[index].setAttribute('color', '#333333');
                            }
                            planes[index].setAttribute('position', `${x} ${y} -1`);
                    });
                });
                var gridPath = document.querySelectorAll('.grid-path');
                Array.from(gridPath).forEach(function (e, i) {
                    gridPath[i].setAttribute('selectblock', '');
                });
                vrInfo.setAttribute('value','Create your own labyrinth');
                vrInfo.setAttribute('animation','property: position; from: 0 2.7 -1.4; to: 0 -20 -1.4; easing: easeInQuart; delay: 2000; dur: 1000');
            }
            document.getElementById('render-grid').setAttribute('animation', `easing: easeOutElastic; from: -${Math.round(value / 2)} 0 -20; to: -${Math.round(value / 2)} 0 -28; property: position; dur: 1500`);
            document.getElementById('settings-place').classList.add('hidden');
        }
        if (vrView) {
            var gridValue = document.querySelectorAll('.get-grid-value');
            if (!AFRAME.components['rendergrid']) {
                AFRAME.registerComponent('rendergrid', {
                    init: function () {
                        var selectedElement = this.el.object3D,
                            value = this.el.dataset.value;
                        this.el.addEventListener('click', function (evt) {
                            render2DPlane(value);
                            Array.from(gridValue).forEach(function (ele) {
                                ele.setAttribute('visible', false);
                                ele.setAttribute('position', '0 -20 5');
                            });
                        });
                    }
                });
            }
            if (!AFRAME.components['startgame']) {
                AFRAME.registerComponent('startgame', {
                    init: function () {
                        this.el.addEventListener('click', function () {
                            renderLabyrinth();
                            document.getElementById('render-vr').setAttribute('visible', false);
                        });
                    }
                });
            }
            document.getElementById('start-game').setAttribute('startgame', '');

            if (!AFRAME.components['togglecursor']) {
                AFRAME.registerComponent('togglecursor', {
                    init: function () {
                        var cursor = document.querySelector('[cursor]'),
                            visible = true;
                        this.el.addEventListener('click', function (e) {
                            if (visible) {
                                cursor.setAttribute('visible', false);
                                visible = false;
                            } else {
                                cursor.setAttribute('visible', true);
                                visible = true;
                            }
                        });
                    }
                });
            }
            document.getElementById('toggle-cursor').setAttribute('togglecursor', '');
            
            Array.from(gridValue).forEach(function (e, i) {
                gridValue[i].setAttribute('rendergrid', '');
            });
            preview3D.classList.remove('hidden');
        } else {
            /* open vr creator */
            document.getElementById('vr-creator').addEventListener('click', function () {
                var gridValue = document.querySelectorAll('.get-grid-value');
                vrView = true;
                document.getElementById('render-vr').setAttribute('visible', true);
                document.getElementById('player').setAttribute('position', "0 2 0");
                Array.from(gridValue).forEach(function (ele) {
                    ele.setAttribute('visible', true);
                });
                gridValue[0].setAttribute('position', "-0.3 2.3 -1.14");
                gridValue[1].setAttribute('position', "0 2.3 -1.14");
                gridValue[2].setAttribute('position', "0.3 2.3 -1.14");
                vrInfo.setAttribute('value','Chose your labyrinth grid');
                vrInfo.setAttribute('position','0 2.7 -1.4');
                vrInfo.removeAttribute('animation');
                document.getElementById('render-grid').removeAttribute('animation');
                document.getElementById('render-grid').removeAttribute('position', '0 0 -35');
                render2DPlane();
                document.querySelector('a-scene').enterVR();
            });
        }
    }

    render2DPlane();

    if (!renderFinish) {
        acceptButton.addEventListener('click', function () {
            render2DPlane();
        });
    }

    applyLabyrinth.addEventListener('click', function () {
        document.getElementById('render-vr').setAttribute('visible', false);
        renderLabyrinth();
    });

    modalFunction([document.getElementById('help'), document.getElementById('another-maps')]);

    if (loadMaps.length > 0) {
        this.loadMapsPreview(loadMaps);
    }
};