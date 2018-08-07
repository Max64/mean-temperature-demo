Vue.component('ya-map', {
    template: `
        <div id="map"></div>
        `,
    props:['mapPoint'],
    created() {
        ymaps.ready(init);

        var comp = this;
        let myMap;

        function init () {
            let initCoords = [comp.mapPoint.lat, comp.mapPoint.long];

            myMap = new ymaps.Map("map", {
                center: initCoords,
                zoom: 11
            }, {
                balloonMaxWidth: 200,
                searchControlProvider: 'yandex#search'
            });

            myMap.balloon.open(initCoords, {
                contentBody: '<p>Координаты: ' + [
                    initCoords[0],
                    initCoords[1]
                ].join(', ') + '</p>'
            });

            myMap.events.add('click', clickListener);
        }


        function clickListener(e) {
            let coords = e.get('coords');

            myMap.balloon.open(coords, {
                contentBody: '<p>Координаты: ' + [
                    coords[0].toPrecision(6),
                    coords[1].toPrecision(6)
                ].join(', ') + '</p>'
            });

            comp.$emit('map-click', {lat: coords[0], long: coords[1]});
        }
    }
});



