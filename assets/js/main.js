var countClick = 0;
var renderFinish = false;
var startSelected = false;

var pathArray = [];
let availablePathsArray = [];
let disablePathsArray = [];
var activePathArray = [];
var disPathArray = [];
var labyrinthArray = [];

var validPathOptions = [];
var disabledPathOptions = [];
var validGridOptions = [];
var validPaths = [];

// const stored = localStorage['pathArray'];
// if (stored) {
//     pathArray = JSON.parse(stored);
// } else {
//     pathArray = [];
// }

function showValidOptions(pathIndex) {
    let activePaths = availablePathsArray;
    let activeDisablePaths = disablePathsArray;

    console.log('activePaths', activePaths);
    console.log('activeDisablePaths', activeDisablePaths);

    const validOptions = Array.from(validPathOptions[pathIndex]).forEach(function (option) {
        // console.log('FOR EACH OPTION', option);
        const rest = activePaths.indexOf(parseFloat(option));
        // validPathOption looks like [clicked element, right, left, bottom, top]
        const pathOption = document.getElementsByClassName('path')[option];
        console.log('VALID OPTIONS FOR SELECTED', validPathOptions[pathIndex])

        if (rest > -1) {
            activePaths.splice(rest, 1);
        }
        // if (labyrinthArray[option - 1].selected && labyrinthArray[option].selected) {
        //     console.log('IS SELECTED', labyrinthArray[option - 1], labyrinthArray[option]);
        //     document.getElementsByClassName('path')[validPathOptions[pathIndex][2]].classList.remove('to-use');
        //     document.getElementsByClassName('path')[validPathOptions[pathIndex][2]].style = '';
        //     document.getElementsByClassName('path')[validPathOptions[pathIndex][2]].classList.add('disabled');
        // }

        // console.log('ACTIVE PATHS', activePaths);
        // console.log('OPTION', option);
        // console.log('ACTIVE PATH ARRAY', activePathArray);

        if (activePathArray[option]) {
            labyrinthArray[pathIndex].selected = true;
            activePathArray[pathIndex] = false;

            pathOption.style.pointerEvents = 'auto';
            pathOption.classList.add('to-use');
        }
    });

    const disabledPath = Array.from(disabledPathOptions[pathIndex]).forEach(dis => {
        // disabledPathOptions = [selected path, bottom-right, bottom-left, top-right, top-left]
        const rest = activeDisablePaths.indexOf(parseFloat(dis));
        prev = dis;
        if (rest > -1) {
            activeDisablePaths.splice(rest, 1);
        }
        if (rest < 0 && !labyrinthArray[pathIndex - 1].selected) {
            console.log('REST', rest, dis);
            console.log('OPTION TO DISABLED IS SELECTED', dis);
            disPathArray[pathIndex] = false;
            disPathArray[pathIndex - 1] = false;
            document.getElementsByClassName('path')[pathIndex - 1].classList.remove('to-use');
            document.getElementsByClassName('path')[pathIndex - 1].style = '';
            document.getElementsByClassName('path')[pathIndex - 1].classList.add('disabled');
        }
        // console.log('VALID PATHS', activePaths);
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

window.onload = function () {
    console.log('Main JS');
    var acceptButton = document.getElementById('accept-settings');

    var lastChange = 0;
    var renderPlace = (event) => {
        // event.preventDefault();

        var gridSettingsNumber = 5; // parseFloat(document.getElementById('grid-settings').value);
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
                    // validPathOptions = [selected path, right, left, bottom, top]
                    validPathOptions[pathIndex] = [pathIndex ,pathIndex + 1, pathIndex - 1, pathIndex + parseFloat(roundWalls), pathIndex - parseFloat(roundWalls)];
                    // disabledPathOptions = [selected path, bottom-right, bottom-left, top-right, top-left]
                    disabledPathOptions[pathIndex] = [pathIndex, pathIndex + parseFloat(roundWalls) + 1, pathIndex + parseFloat(roundWalls) - 1, pathIndex - parseFloat(roundWalls) + 1, pathIndex - parseFloat(roundWalls) - 1];
                    availablePathsArray.push(pathIndex);
                    disablePathsArray.push(pathIndex);
                    activePathArray[pathIndex] = true;
                    disPathArray[pathIndex] = true;
                    labyrinthArray.push({
                        active: true,
                        selected: false,
                        pathId: pathIndex,
                    });
                } else {
                    activePathArray[pathIndex] = false;
                    disPathArray[pathIndex] = false;
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
    // acceptButton.addEventListener('click', e => renderPlace(e));
};