var countClick = 0,
    timer,
    time = {},
    hours = 0,
    minutes = 0,
    seconds = 0,
    renderFinish = false,
    startSelected = false,
    pathSelected = false,
    finishConverting = false,
    pathArray = [];
let availablePathsArray = [];
var activePathArray = [],
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
    maps = [],
    loadMap = JSON.parse(localStorage.getItem('maps')) ? JSON.parse(localStorage.getItem('maps')) : [];

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
    var fullTime = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
    time = {
        seconds,
        minutes,
        hours,
        stringTime: fullTime
    }
    timerValue.setAttribute('value', fullTime);
    count();
}
function count() {
    timer = setTimeout(countTime, 1000);
}

function showValidOptions(pathIndex) {
    let activePaths = availablePathsArray;
    
    countSelectedBlocks = countSelectedBlocks + 1;

    const validOptions = Array.from(validPathOptions[pathIndex]).forEach(function (option) {
        const rest = activePaths.indexOf(parseFloat(option));
        // validPathOption looks like [clicked element, right, left, bottom, top]
        const pathOption = document.getElementsByClassName('path')[option];
        lastClicked = pathIndex;

        if (rest > -1) {
            activePaths.splice(rest, 1);
        }

        if (activePathArray[option]) {
            labyrinthArray[pathIndex].selected = true;
            activePathArray[pathIndex] = false;

            pathOption.style.pointerEvents = 'auto';
            pathOption.classList.add('to-use');
        }
    });

    const disableBlock = Object.keys(disableIfSelected[pathIndex]).map(function (position) {
        const disOption = disableIfSelected[pathIndex][position];
        const pathElement = document.getElementsByClassName('path')[disOption.disable];

        let countDisabled = 0;
        const checkSelected = Array.from(disOption.options).forEach(function (opt) {
            if (labyrinthArray[opt].selected) {
                countDisabled = countDisabled + 1;
                if (disOption.options.length === countDisabled) {
                    countDisabled = 0;
                    pathElement.classList.remove('to-use');
                    pathElement.classList.add('disabled');
                    pathElement.style.pointerEvents = 'none';
                    labyrinthArray[disOption.disable].active = false;
                    return;
                }
            }
        });
    });

    const paths = Array.from(pathArray).forEach(function (item) {
        const thisItem = document.getElementsByClassName('path')[item];
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

function selectStart(element, index) {
    if (renderFinish) {
        countClick = 1;
        labyrinthArray[index].option = 2;
        element.classList.add('start-selected');
        startSelected = true;
        showValidOptions(index);
    }
}

function selectPath(element, index) {
    if (startSelected && renderFinish && labyrinthArray.length !== 0) {
        element.classList.add('selected');
        showValidOptions(index);
    }
}

function buildMaze(event) {
    var element = event.target;
    var pathId = parseFloat(element.dataset.pathIndex);

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

function setRestToDisabled() {
    const disableBlock = Object.keys(labyrinthArray).map(function (block) {
        const pathElement = document.getElementsByClassName('path')[block];
        if (!labyrinthArray[block].selected) {
            labyrinthArray[block].active = false;
            pathElement.classList.remove('to-use');
            pathElement.classList.add('disabled');
            pathElement.style.pointerEvents = 'none';
        }
    });
}

function convertBlocks() {
    labyrinthArray[lastClicked].option = 3;
    document.getElementsByClassName('path')[lastClicked].classList.remove('to-use');
    document.getElementsByClassName('path')[lastClicked].classList.add('finish');
    const convert = Object.keys(labyrinthArray).map(function (path) {
        if (labyrinthArray[path].active && labyrinthArray[path].selected && labyrinthArray[path].option === 0) {
            labyrinthArray[path].option = 1;
        }
    });
    finishConverting = true;
}

function createArrayToSave() {
    Object.keys(labyrinthArray).map(function (path) {
        finalArray.push(parseFloat(labyrinthArray[path].option));
    });
}

function generate3DBlocks(map, final) {
    var scene = document.getElementById('labyrinth-scene');
    var container = document.createDocumentFragment();

    mapArray = typeof map !== 'undefined' ? map : mapArray;
    finalArray = typeof final !== 'undefined' ? final : finalArray;

    const vertical = Array.from(mapArray).forEach(function (n, x) {
        const horizontal = Array.from(mapArray).forEach(function (a, z) {
            var blockHtml = document.createElement('a-box');
            blockHtml.setAttribute('rotation', "0 0 0");
            blockHtml.setAttribute('color', "blue");
            blockHtml.setAttribute('position', `${x} 0.5 ${z}`);
            if (finalArray[mapArray[x][z]] === 3) {
                blockHtml.setAttribute('color', "blue");
                blockHtml.setAttribute('data-name', "finish");
                blockHtml.setAttribute('option', "3");
                blockHtml.setAttribute('height', "0.1");
                blockHtml.setAttribute('width', "0.7");
                blockHtml.setAttribute('depth', "0.7");
                blockHtml.setAttribute('position', `${x} 0.1 ${z}`);
            }
            if (finalArray[mapArray[x][z]] === 2) {
                blockHtml.setAttribute('color', "red");
                blockHtml.setAttribute('data-name', "start");
                blockHtml.setAttribute('option', "2");
                blockHtml.setAttribute('height', "0.1");
                blockHtml.setAttribute('width', "0.7");
                blockHtml.setAttribute('depth', "0.7");
                blockHtml.setAttribute('position', `${x} 0.1 ${z}`);
            }
            if (finalArray[mapArray[x][z]] === 1) {
                blockHtml.setAttribute('color', "green");
                blockHtml.setAttribute('option', "1");
                blockHtml.setAttribute('height', "0.1");
                blockHtml.setAttribute('width', "0.7");
                blockHtml.setAttribute('depth', "0.7");
                blockHtml.setAttribute('position', `${x} 0.1 ${z}`);
            }
            if (finalArray[mapArray[x][z]] === 0) {
                blockHtml.setAttribute('color', "#333333");
                blockHtml.setAttribute('height', "6");
            }
            container.appendChild(blockHtml);
        });
    });

    scene.appendChild(container);
}
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
    console.log('SCENE HAS LOADED', document.querySelector('a-scene').hasLoaded);
}

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

function movePlayer(mapId, mapIndex) {
    var player = document.getElementById('player');
    var pathBoxes = document.querySelectorAll('a-box[option="1"], a-box[option="3"]');
    var scene = document.querySelector('a-scene');
    var moveCounter = 0;

    console.log('Map Index', mapIndex);
    if (!AFRAME.components['movement']) {
        AFRAME.registerComponent('movement', {
            init: function () {
                var position = this.el.object3D.position;
                var els = this.el;
                this.el.addEventListener('click', function (evt) {
                    if (moveCounter === 0) {
                        moveCounter = 1;
                        count();
                    }
                    if (evt.target.dataset.name === 'finish') {
                        clearTimeout(timer);
                        if (mapId && mapIndex) {
                            if (loadMap[mapIndex].id === mapId) {
                                console.log('SECONDS: ' + getSeconds(loadMap[mapIndex].time) + ' < ' + getSeconds(time));
                                if (getSeconds(loadMap[mapIndex].time) > getSeconds(time) || getSeconds(loadMap[mapIndex].time) === 0) {
                                    console.log('SECONDS: ' + getSeconds(loadMap[mapIndex].time) + ' < ' + getSeconds(time));
                                    loadMap[mapIndex].time = time;
                                    localStorage.setItem('maps', JSON.stringify(loadMap));
                                }
                            }
                        }
                        document.querySelector('.preview').classList.add('hidden');
                        document.querySelector('.editor').classList.remove('hidden');
                        document.getElementById('loadedMaps').classList.remove('hidden');
                        document.getElementById('grid-settings').value = '';
                        document.getElementById('grid-settings').removeAttribute('disabled');
                        document.getElementById('accept-settings').removeAttribute('disabled');
                        document.getElementById('settings-place').classList.remove('hidden');
                        renderFinish = false;
                        countClick = 0;
                        countClick = 0;
                        time = {};
                        hours = 0;
                        minutes = 0;
                        seconds = 0;
                        renderFinish = false;
                        startSelected = false;
                        pathSelected = false;
                        finishConverting = false;
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
                        Array.from(scene.children).forEach(function (el, index) {
                            if (typeof el !== 'undefined') {
                                if (el.tagName !== 'CANVAS' && !el.classList.contains('a-loader-title') && !el.classList.contains('a-enter-vr') && !el.classList.contains('a-orientation-modal') && el.tagName !== "A-ENTITY") {
                                    console.log(scene.children[index], [el]);
                                    scene.removeChild(el);
                                }
                            }
                        });
                        document.querySelector('a-scene').exitVR();
                        loadPlaces(loadMap);
                    }
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

function saveLabyrinth(loadedLab, indexMap) {
    if (!loadedLab && !indexMap) {
        if ((labyrinthArray.length / 3) - 5 <= countSelectedBlocks) {
            var errorMsg = document.getElementsByClassName('apply-error')[0];
            errorMsg.innerHTML = '';
            errorMsg.style = '';
            setRestToDisabled();
            convertBlocks();
        } else {
            var errorMsg = document.getElementsByClassName('apply-error')[0];
            errorMsg.innerHTML = 'Please select more blocks. <br> <b>Blocks to select:</b> ' + Math.round((labyrinthArray.length / 3) - countSelectedBlocks) + '<br> <b>Selected Blocks: </b>' + countSelectedBlocks;
            errorMsg.style.display = 'block';
        }
    } else {
        finishConverting = true;
        renderFinish = true;
        startSelected = true;
    }
    if (renderFinish && startSelected && finishConverting) {
        var preview3D = document.querySelector('.preview');
        var editor = document.querySelector('.editor');

        if (typeof loadedLab !== 'undefined' && indexMap) {
            generate3DBlocks(loadedLab.map, loadedLab.final);
            setPlayerPosition();
            movePlayer(loadedLab.id, indexMap);
        } else {
            var mapId = getRandomId();
            createArrayToSave();
            loadMap.push({
                id: mapId,
                final: finalArray,
                map: mapArray,
                time
            });
            localStorage.setItem('maps', JSON.stringify(loadMap));

            generate3DBlocks();
            console.log('SCENE HAS LOADED', document.querySelector('a-scene').hasLoaded);
            setPlayerPosition();
            movePlayer(mapId, Object.keys(loadMap)[Object.keys(loadMap).length - 1]);
        }

        preview3D.classList.remove('hidden');
        editor.classList.add('hidden');
        document.getElementById('loadedMaps').classList.add('hidden');
        document.getElementById('creator-place').innerHTML = '';
    }
}

function loadPlaces(m) {
    var container = document.createDocumentFragment();
    // TODO: Trzeba wyczyscic ladowane mapy ponieasz sie duplikuja
    // TODO: Przy stworzeniu drugiej/kolejnej mapy czas stoi w miejscu
    m.forEach(function (mapObject, mapIndex) {
        var final = mapObject.final,
            mapBox = document.createElement('div');
            placeWidth = Math.sqrt(final.length) * (25 + 2);

        mapBox.classList.add('map-preview');
        mapBox.setAttribute('style', `width: ${placeWidth}px`);
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
        mapBox.innerHTML += `<p class="hi-score">${typeof mapObject.time !== 'undefined' ? mapObject.time.stringTime : '00:00:00'}</p>`;
        container.appendChild(mapBox);
    });
    document.getElementById('loadedMaps').appendChild(container);
    Array.from(document.querySelectorAll('.map-preview')).forEach(function (clickedMap) {
        clickedMap.addEventListener('click', function (e) {
            saveLabyrinth(loadMap[e.target.dataset.index], e.target.dataset.index);
        });
    });
}

window.onload = function () {
    console.log('Main JS');
    var acceptButton = document.getElementById('accept-settings');
    var loaded = document.getElementById('loadedMaps');
    var preview3D = document.querySelector('.preview');
    var loadMaps = this.loadMap;
    console.log('SCENE HAS LOADED', document.querySelector('a-scene').canvas);

    preview3D.classList.add('hidden');
    loaded.classList.add('hidden');
    applyLabyrinth = document.getElementById('apply');
    
    document.querySelector('a-entity').setAttribute('test-new', '');
    var lastChange = 0;
    function renderPlace() {
        var gridSettingsNumber = parseFloat(document.getElementById('grid-settings').value);
        var roundWalls = gridSettingsNumber + 2;
        var sumOfPaths = roundWalls * roundWalls;
        var place = document.getElementById('creator-place');
        var placeWidth = roundWalls * (25 + 2);
        var fragment = document.createDocumentFragment();

        if (gridSettingsNumber > 0) {
            if (lastChange !== gridSettingsNumber) {
                place.innerHTML = '';
            }

            lastChange = parseFloat(gridSettingsNumber);

            for (var p = 0; p < sumOfPaths; p++) {
                pathArray.push(p);
                const path = document.createElement('div');
                path.dataset.pathIndex = p;
                path.classList.add('path');

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
            let prev = 0;
            const paths = Array.from(pathArray);
            const outer = paths.forEach(function (item) {
                const pathItem = place.getElementsByClassName('path')[item];
                const pathIndex = parseFloat(pathItem.dataset.pathIndex);
                const isOutside = pathItem.dataset.pathIndex <= roundWalls
                || pathItem.dataset.pathIndex - prev === roundWalls
                || pathItem.dataset.pathIndex > sumOfPaths - roundWalls
                && pathItem.dataset.pathIndex < sumOfPaths + 1;

                const rightSide = pathItem.dataset.pathIndex - prev === roundWalls - 1;

                if (isOutside) {
                    prev = pathItem.dataset.pathIndex;
                }
                if (isOutside || rightSide) {
                    pathItem.classList.add('disabled');
                }
                if (pathItem.className.indexOf('disabled') < 0) {
                    const right = pathIndex + 1;
                    const left = pathIndex - 1;
                    const bottom = pathIndex + parseFloat(roundWalls);
                    const top = pathIndex - parseFloat(roundWalls);
                    const bottomRight = pathIndex + parseFloat(roundWalls) + 1;
                    const bottomLeft = pathIndex + parseFloat(roundWalls) - 1;
                    const topRight = pathIndex - parseFloat(roundWalls) + 1;
                    const topLeft = pathIndex - parseFloat(roundWalls) - 1;

                    validPathOptions[pathIndex] = [pathIndex, right, left, bottom, top];
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
                    labyrinthArray.push({
                        active: true,
                        selected: false,
                        pathId: pathIndex,
                        option: 0
                    });
                } else {
                    activePathArray[pathIndex] = false;
                    labyrinthArray.push({
                        active: false,
                        selected: false,
                        pathId: pathIndex,
                        option: 0
                    });
                }
                pathItem.onclick = function (event) {
                    const elementIndex = pathIndex;

                    if (labyrinthArray[elementIndex].active) {
                        buildMaze(event);
                    }
                };
            });
            document.getElementById('grid-settings').setAttribute('disabled', true);
            acceptButton.setAttribute('disabled', true);

            mapArray = [...Array(roundWalls).keys()].reduce((prev, curr) => {
                return [...prev,  pathArray.slice(roundWalls * curr, roundWalls * curr + roundWalls)];
            }, []);
            document.getElementById('settings-place').classList.add('hidden');
        }
    };

    renderPlace();
    if (!renderFinish) {
        acceptButton.addEventListener('click', e => renderPlace(e));
    }
    applyLabyrinth.addEventListener('click', e => saveLabyrinth());
    document.getElementById('another-maps').addEventListener('click', function (e) {
        document.getElementById('loadedMaps').classList.remove('hidden');
    });
    document.querySelector('.close-btn').addEventListener('click', function (e) {
        document.getElementById('loadedMaps').classList.add('hidden');
    });
    if (loadMaps.length > 0) {
        this.loadPlaces(loadMaps);
    }
};