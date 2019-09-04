var countClick = 0;
var renderFinish = false;
var startSelected = false;
var pathSelected = false;
var finishConverting = false;

var pathArray = [];
let availablePathsArray = [];
var activePathArray = [];
var labyrinthArray = [];
var disableIfSelected = [];

var validPathOptions = [];
var validGridOptions = [];
var validPaths = [];
var countSelectedBlocks = 0;
var finalArray = [];
var newArr = [];
var mapArray = [];
var lastClicked;

var applyLabyrinth;

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

function generate3DBlocks() {
    var scene = document.getElementById('test');
    var container = document.createDocumentFragment();
    
    const vertical = Array.from(mapArray).forEach(function (n, x) {
        const horizontal = Array.from(mapArray).forEach(function (a, z) {
            var blockHtml = document.createElement('a-box');
            blockHtml.setAttribute('rotation', "0 0 0");
            blockHtml.setAttribute('color', "blue");
            blockHtml.setAttribute('position', `${x} 0.5 ${z}`);
            if (finalArray[mapArray[x][z]] === 3) {
                blockHtml.setAttribute('color', "blue");
                blockHtml.setAttribute('name', "finish");
                blockHtml.setAttribute('option', "3");
                blockHtml.setAttribute('height', "0.1");
                blockHtml.setAttribute('width', "0.7");
                blockHtml.setAttribute('depth', "0.7");
                blockHtml.setAttribute('position', `${x} 0.1 ${z}`);
            }
            if (finalArray[mapArray[x][z]] === 2) {
                blockHtml.setAttribute('color', "red");
                blockHtml.setAttribute('name', "start");
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
    AFRAME.registerComponent('get-start-position', {
        init: function () {
            var position = this.el.object3D.position;
            player.setAttribute('position', {
                x: position.x,
                y: 0.5,
                z: position.z
            });
            player.setAttribute('rotation', "0 180 0");
        }
    });
    start.setAttribute('get-start-position', '');
}

function movePlayer() {
    var player = document.getElementById('player');
    var pathBoxes = document.querySelectorAll('a-box[option="1"]');
    AFRAME.registerComponent('movement', {
        init: function () {
            var lastIndex = -1;
            var element = this.el;
            var position = this.el.object3D.position;
            this.el.addEventListener('click', function (evt) {
                console.log('WAS CLICKED', position);
                player.setAttribute('position', {
                    x: position.x,
                    y: 0.5,
                    z: position.z
                });
            });
        }
    });
    Array.from(pathBoxes).forEach(function (e, i) {
        console.log('E, I', e, i);
        pathBoxes[i].setAttribute('movement', '');
    });
}

function saveLabyrinth() {
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
    if (renderFinish && startSelected && finishConverting) {
        // TODO: Save converted labyrinthArray to database.
        var preview3D = document.querySelector('.preview');
        var editor = document.querySelector('.editor');

        createArrayToSave();
        generate3DBlocks();
        setPlayerPosition();
        movePlayer();
        preview3D.classList.remove('hidden');
        editor.classList.add('hidden');
        document.getElementById('creator-place').innerHTML = '';
    }
}

window.onload = function () {
    console.log('Main JS');
    var acceptButton = document.getElementById('accept-settings');
    var preview3D = document.querySelector('.preview');

    preview3D.classList.add('hidden');
    applyLabyrinth = document.getElementById('apply');
    
    document.querySelector('a-entity').setAttribute('test-new', '');
    var lastChange = 0;
    var renderPlace = () => {
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
    applyLabyrinth.addEventListener('click', e => saveLabyrinth(e));
};