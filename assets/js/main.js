var countClick = 0;
var renderFinish = false;
var startSelected = false;
var pathSelected = false;

var pathArray = [];
let availablePathsArray = [];
var activePathArray = [];
var labyrinthArray = [];
var disableIfSelected = [];

var validPathOptions = [];
var validGridOptions = [];
var validPaths = [];
var countSelectedBlocks = 0;

var applyLabyrinth;

function showValidOptions(pathIndex) {
    let activePaths = availablePathsArray;
    
    countSelectedBlocks = countSelectedBlocks + 1;

    const validOptions = Array.from(validPathOptions[pathIndex]).forEach(function (option) {
        const rest = activePaths.indexOf(parseFloat(option));
        // validPathOption looks like [clicked element, right, left, bottom, top]
        const pathOption = document.getElementsByClassName('path')[option];
        console.log('VALID OPTIONS FOR SELECTED', validPathOptions[pathIndex])

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

function saveLabyrinth() {
    if ((labyrinthArray.length / 3) - 1 <= countSelectedBlocks) {
        console.log('can be saved');
        var errorMsg = document.getElementsByClassName('apply-error')[0];
        errorMsg.innerHTML = '';
        errorMsg.style = '';
        // TODO: Write function to change rest elements to disabled/not active and convert labyrinthArray to 0, 1, 2, 3 array. 0 is disabled, 1 is path, 2 is start, 3 is finish.
    } else {
        var errorMsg = document.getElementsByClassName('apply-error')[0];
        errorMsg.innerHTML = 'Please select more blocks. <br> <b>Blocks to select:</b> ' + Math.round((labyrinthArray.length / 3) - countSelectedBlocks) + '<br> <b>Selected Blocks: </b>' + countSelectedBlocks;
        errorMsg.style.display = 'block';
    }
    if (renderFinish && startSelected) {
        // TODO: Save converted labyrinthArray to database.
        console.log('save');
    }
}

window.onload = function () {
    console.log('Main JS');
    var acceptButton = document.getElementById('accept-settings');
    applyLabyrinth = document.getElementById('apply');

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
                path.textContent = p;
                path.classList.add('path');

                fragment.appendChild(path);
            }
            place.appendChild(fragment);
            // localStorage['pathArray'] = JSON.stringify(pathArray);

            place.style.width = placeWidth + 'px';
            renderFinish = true;
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
                    });
                } else {
                    activePathArray[pathIndex] = false;
                    labyrinthArray.push({
                        active: false,
                        selected: false,
                        pathId: pathIndex,
                    });
                }
                pathItem.onclick = function (event) {
                    const elementIndex = pathIndex;

                    if (labyrinthArray[elementIndex].active) {
                        buildMaze(event);
                    }
                };
            });
        }
    };

    renderPlace();
    acceptButton.addEventListener('click', e => renderPlace(e));
    applyLabyrinth.addEventListener('click', e => saveLabyrinth(e));
};