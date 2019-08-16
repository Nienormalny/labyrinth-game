var countClick = 0;
var renderFinish = false;
var startSelected = false;
var labiryntArray = [];
var selectedPath = [];
var validPathOptions = [];
var validGridOptions = [];
var validPaths = [];

validPathOptions[0] = [1, 2, 3, 6];
validPathOptions[1] = [0, 2, 4, 7];
validPathOptions[2] = [0, 1, 5, 8];
validPathOptions[3] = [0, 4, 5, 6];
validPathOptions[4] = [1, 3, 5, 7];
validPathOptions[5] = [2, 3, 4, 8];
validPathOptions[6] = [0, 3, 7, 8];
validPathOptions[7] = [1, 4, 6, 8];
validPathOptions[8] = [2, 5, 6, 7];

var disablePath = [
    {
        selectedOptions: [4, 5, 2],
        blockPathNumber: 1
    },
    {
        selectedOptions: [4, 5, 8],
        blockPathNumber: 7
    },
    {
        selectedOptions: [6, 5, 2],
        blockPathNumber: 3
    },
    {
        selectedOptions:[6, 5, 8],
        blockPathNumber: 9
    },
    {
        selectedOptions: [1, 4, 5],
        blockPathNumber: 2
    },
    {
        selectedOptions: [3, 6, 5],
        blockPathNumber: 2
    },
    {
        selectedOptions: [1, 2, 5],
        blockpathNumber: 4
    },
    {
        selectedOptions: [7, 8, 5],
        blockPathNumber: 4
    },
    {
        selectedOptions: [3, 2, 5],
        blockPathNumber: 6
    },
    {
        selectedOptions: [9, 8, 5],
        blockPathNumber: 6
    },
    {
        selectedOptions: [7, 4, 5],
        blockPathNumber: 8
    },
    {
        selectedOptions: [9, 6, 5],
        blockPathNumber: 8
    }
];

function showValidOptions(gridI, pathIndex) {
    var allPathOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    Array.prototype.slice.call(validPathOptions[pathIndex]).map(option => {
        var rest = allPathOptions.indexOf(parseFloat(option));
        var gridElement = document.getElementsByClassName('grid');

        if (rest > -1) {
            allPathOptions.splice(rest, 1);
        }

        Array.prototype.slice.call(gridElement).map(grid => {
            if (grid.dataset.gridIndex === gridI) {
                grid.getElementsByClassName('path')[option].classList.add('to-use');
                Array.prototype.slice.call(allPathOptions).map(r => {
                    grid.getElementsByClassName('path')[r].classList.remove('to-use');
                });
            }
        });
    });
}

function selectStart(grid, element, index) {
    if (renderFinish) {
        console.log('select start', element);
        countClick = 1;
        element.classList.add('start-selected');
        selectedPath.push({selected: true, grid: parseFloat(grid), path: parseFloat(index)});
        startSelected = true;
        showValidOptions(grid, index);
        console.log(selectedPath);
    }
}

function selectPath(grid, element, index) {
    if (startSelected && renderFinish && labiryntArray.length !== 0) {
        // console.log('select path', element);
        // console.log('labirynt array', labiryntArray);
        // var selectedPathElement = document.getElementsByClassName('path-' + index + 1);
        // console.log('Disable Paths', disablePath);
        // var selected;
        // selectedPath.push(index + 1);
        // for (var grid = 0; grid < labiryntArray.length; grid++) {
        //     selected = labiryntArray[grid].paths.pathsClassIndex[index];
        //     console.log('SELECTED PATH', labiryntArray[grid].paths.pathsClassIndex[index]);
        //     if (selectedPath.length > 3) {
        //         selectedPath = [];
        //     }
        //     for (var disabledOptionIndex = 0; disabledOptionIndex < disablePath.length; disabledOptionIndex++) {
        //         console.log('Selected Option', disablePath[disabledOptionIndex].selectedOptions, selectedPath, disablePath[disabledOptionIndex].selectedOptions.every(v => selectedPath.includes(v)));
        //         if (disablePath[disabledOptionIndex].selectedOptions.every(v => selectedPath.includes(v))) {
        //             var gridEls = document.getElementsByClassName('grid-' + grid);
        //             console.log(gridEls);
        //             var el = gridEls[0].children[disablePath[disabledOptionIndex].blockPathNumber - 1];
        //             // el.classList.add('disabled');
        //             el.classList.add('disabled');
        //             console.log('disabled element', el);
        //             console.log('Should be disabled', disablePath[disabledOptionIndex].blockPathNumber);
        //         }
        //     }
        // }

        selectedPath.push({selected: true, grid: parseFloat(grid), path: parseFloat(index)});
        console.log('SELECTED', selectedPath[selectedPath.length - 1]);
        showValidOptions(grid, index);

        element.classList.add('selected');
    }
}

function buildMaze(event) {
    var element = event.target;
    var gridId = element.dataset.gridId;
    var pathId = element.dataset.pathId;

    switch (countClick) {
        case 0:
            selectStart(gridId, element, pathId);
            console.log('LABIRYNT ARRAY', labiryntArray);
            break;
        case 1:
            selectPath(gridId, element, pathId);
            break;
        default:
            return false;
    }
}

window.onload = function () {
    console.log('Main JS');
    var acceptButton = document.getElementById('accept-settings');

    function renderPath(gridIndex) {
        var pathArray = [];

        for (var path = 0; path < 9; path++) {
            var pathTemplate = `<div data-grid-id="${gridIndex}" data-path-id="${path}" class="path">${path}</div>`;

            pathArray.push(pathTemplate);

            labiryntArray.push({selected: false, grid: gridIndex, path});
        }

        return pathArray.map(e => e);
    }

    var lastChange = 0;
    var renderPlace = (event) => {
        event.preventDefault();

        var gridSettingsNumber = document.getElementById('grid-settings').value;
        var allGrids = gridSettingsNumber * gridSettingsNumber;
        var place = document.getElementById('creator-place');
        var placeWidth = gridSettingsNumber * (25 * 3) + (gridSettingsNumber * 2);

        if (gridSettingsNumber > 0) {
            if (lastChange !== gridSettingsNumber) {
                place.innerHTML = '';
            }

            lastChange = parseFloat(gridSettingsNumber);

            for (var grid = 0; grid < allGrids; grid++) {
                validGridOptions[grid] = [grid + 1, grid - 1, grid + parseFloat(gridSettingsNumber), grid - parseFloat(gridSettingsNumber)]
                place.innerHTML += `<div class="grid" data-grid-index="${grid}">${renderPath(grid).join('')}</div>`;
            }

            place.style.width = placeWidth + 'px';
            renderFinish = true;
        }
        if (renderFinish) {
            Array.prototype.slice.call(document.getElementsByClassName('path')).map(el => {
                el.addEventListener('click', event => {
                    buildMaze(event);
                }, true);
            });
        }
    };

    acceptButton.addEventListener('click', e => renderPlace(e));
};