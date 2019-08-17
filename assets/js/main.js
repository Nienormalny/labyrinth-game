var countClick = 0;
var renderFinish = false;
var startSelected = false;

var pathArray = [];
let availablePathsArray = [];
var activePathArray = [];
var labyrinthArray = [];

var validPathOptions = [];
var validGridOptions = [];
var validPaths = [];

// var disablePath = [
//     {
//         selectedOptions: [4, 5, 2],
//         blockPathNumber: 1
//     },
//     {
//         selectedOptions: [4, 5, 8],
//         blockPathNumber: 7
//     },
//     {
//         selectedOptions: [6, 5, 2],
//         blockPathNumber: 3
//     },
//     {
//         selectedOptions:[6, 5, 8],
//         blockPathNumber: 9
//     },
//     {
//         selectedOptions: [1, 4, 5],
//         blockPathNumber: 2
//     },
//     {
//         selectedOptions: [3, 6, 5],
//         blockPathNumber: 2
//     },
//     {
//         selectedOptions: [1, 2, 5],
//         blockpathNumber: 4
//     },
//     {
//         selectedOptions: [7, 8, 5],
//         blockPathNumber: 4
//     },
//     {
//         selectedOptions: [3, 2, 5],
//         blockPathNumber: 6
//     },
//     {
//         selectedOptions: [9, 8, 5],
//         blockPathNumber: 6
//     },
//     {
//         selectedOptions: [7, 4, 5],
//         blockPathNumber: 8
//     },
//     {
//         selectedOptions: [9, 6, 5],
//         blockPathNumber: 8
//     }
// ];

function showValidOptions(pathIndex) {
    console.log('show valid Options', pathIndex);
    let activePaths = availablePathsArray
    const validOptions = Array.from(validPathOptions[pathIndex]).forEach(function (option) {
        console.log('FOR EACH', option);
        const rest = activePaths.indexOf(parseFloat(option));
        const pathOption = document.getElementsByClassName('path')[option];

        if (rest > -1) {
            activePaths.splice(rest, 1);
        }
        console.log('ACTIVE PATHS', activePaths);
        console.log('OPTION', option);
        console.log('ACTIVE PATH ARRAY', activePathArray);
        if (activePathArray[option]) {
            labyrinthArray[pathIndex].selected = true;
            activePathArray[pathIndex] = false;

            pathOption.style.pointerEvents = 'auto';
            pathOption.classList.add('to-use');
        }
    });
    activePaths = Array.from(activePaths);
    const paths = Array.from(document.getElementsByClassName('path')).forEach(function (item) {
        activePaths.forEach(function (ap) {
            if (parseFloat(item.dataset.pathIndex) === ap) {
                item.style.pointerEvents = 'none';
                item.classList.remove('to-use');
            }
        });
        if (!activePathArray[item.dataset.pathIndex]) {
            item.style.pointerEvents = 'none';
            item.classList.remove('to-use');
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
        event.preventDefault();

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

            place.style.width = placeWidth + 'px';
            renderFinish = true;
        }
        if (renderFinish) {
            let prev = 0;
            const paths = Array.from(place.querySelectorAll('div'));
            const outer = paths.forEach(function (item) {
                const pathIndex = parseFloat(item.dataset.pathIndex);
                const isOutside = item.dataset.pathIndex <= roundWalls
                || item.dataset.pathIndex - prev === roundWalls
                || item.dataset.pathIndex > sumOfPaths - roundWalls
                && item.dataset.pathIndex < sumOfPaths + 1;

                const rightSide = item.dataset.pathIndex - prev === roundWalls - 1;

                if (isOutside) {
                    prev = item.dataset.pathIndex;
                }
                if (isOutside || rightSide) {
                    item.classList.add('disabled');
                }

                if (item.className.indexOf('disabled') < 0) {
                    validPathOptions[pathIndex] = [pathIndex ,pathIndex + 1, pathIndex - 1, pathIndex + parseFloat(roundWalls), pathIndex - parseFloat(roundWalls)];
                    availablePathsArray.push(pathIndex);
                    activePathArray[pathIndex] = true;
                    labyrinthArray.push({
                        active: true,
                        selected: false,
                        pathId: pathIndex,
                    });
                } else {
                    labyrinthArray.push({
                        active: false,
                        selected: false,
                        pathId: pathIndex,
                    });
                }
                item.addEventListener('click', event => {
                    const elementIndex = pathIndex;

                    if (labyrinthArray[elementIndex].active) {
                        buildMaze(event);
                    }
                }, true);
            });
            // for (var indexLeft = 0; indexLeft < pathArray.length; indexLeft = indexLeft + roundWalls) {
            //     Array.prototype.slice.call(document.getElementsByClassName('path')).map((el, i) => {
            //         if (i < roundWalls) {
            //             el.classList.add('disabled');
            //         }
            //         if (i === indexLeft) {
            //             el.classList.add('disabled');
            //         }
            //         if (i === indexLeft + roundWalls - 1 + roundWalls) {
            //             el.classList.add('disabled');
            //         }
            //         if (i > roundWalls * (roundWalls - 1)) {
            //             el.classList.add('disabled');
            //         }
            //     });
            // }

            // Array.prototype.slice.call(document.getElementsByClassName('path')).map((el, i) => {
            //     if (el.className.indexOf('disabled') < 0) {
            //         validPathOptions[i] = [i + 1, i - 1, i + parseFloat(roundWalls), i - parseFloat(roundWalls)];
            //         availablePathsArray.push(i);
            //         activePathArray[i] = true;
            //         labyrinthArray.push({
            //             active: true,
            //             selected: false,
            //             pathId: i,
            //         });
            //     } else {
            //         labyrinthArray.push({
            //             active: false,
            //             selected: false,
            //             pathId: i,
            //         });
            //     }
            // });
            // if (labyrinthArray.length > 0) {
            //     Array.prototype.slice.call(document.getElementsByClassName('path')).map((el, i) => {
            //         el.addEventListener('click', event => {
            //             var element = event.target;
            //             var elementIndex = element.dataset.pathIndex;

            //             if (labyrinthArray[elementIndex].active) {
            //                 buildMaze(event);
            //             }
            //         }, true);
            //     });
            // }
        }
    };

    acceptButton.addEventListener('click', e => renderPlace(e));
};