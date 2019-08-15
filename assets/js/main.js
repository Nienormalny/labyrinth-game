window.onload = function () {
    console.log('Main JS');
    var acceptButton = document.getElementById('accept-settings');

    function renderPath() {
        var pathArray = [];
        for (var path = 0; path < 9; path++) {
            var pathClass = "path-" + path;
            console.log('PATH');
            pathArray.push(`<div class="path ${pathClass}"></div>`);
        }

        return pathArray.map(e => e);
    }

    var renderPlace = (event) => {
        event.preventDefault();
        console.log('EVENT', event);
        var gridSettingsNumber = document.getElementById('grid-settings').value;
        var allGrids = gridSettingsNumber * gridSettingsNumber;
        var place = document.getElementById('creator-place');
        var placeWidth = gridSettingsNumber * (25 * 3) + (gridSettingsNumber * 2);

        console.log('grid number', gridSettingsNumber);
        if (gridSettingsNumber > 0) {
            for (var grid = 0; grid < allGrids; grid++) {
                var gridClass = "grid-" + grid;
                place.innerHTML += `<div class="grid ${gridClass}">${renderPath().join('')}</div>`;
            }
            place.style.width = placeWidth + 'px';
        }

    };
    acceptButton.addEventListener('click', e => renderPlace(e));
};