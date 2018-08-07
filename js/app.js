ymaps.ready(init);
var myMap;

function init () {
    myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],     // Москва
        zoom: 11
    }, {
        balloonMaxWidth: 200,
        searchControlProvider: 'yandex#search'
    });

    myMap.events.add('click', clickListener);
}

function clickListener(e) {
    var coords = e.get('coords');
    console.debug("click coords: " + coords);

    var gridPoint = new GridPoint(coords[0], coords[1]);

    getGmxIdByCoords(gridPoint.lat, gridPoint.long)
    .then(function (response) {
        let jsonString = getJsonString(response.data);
        let data = JSON.parse(jsonString);

        let gmx_id = data.features[0].properties.gmx_id;
        return getFeaturesByGmxIdAndYear(gmx_id, 2018)
    })
    .then(function (features) {
        let yearDataset = new YearDataset(2018, features);
        console.log(yearDataset);
    })
    .catch(error => alert("Возникла ошибка: " + error));
}

function getJsonString(responseString) {
    return responseString.replace("functionname(", "").slice(0, -1);
}

function getGmxIdByCoords(lat, long) {
    return axios.get('http://maps.kosmosnimki.ru/rest/ver1/layers/35FB2C338FED4B64B7A326FBFE54BE73/search', {
        params: {
            query: '"lat"=' + lat + 'and"lon"=' + long,
            apikey: '6Q81IXBUQ7',
            WrapStyle: 'func',
            callbackname: 'functionname'
        }
    })
}

function getFeaturesByGmxIdAndYear(gmx_id, year) {
    return new Promise((resolve, reject) => {
        axios.get('http://maps.kosmosnimki.ru/rest/ver1/layers/11A381497B4A4AE4A4ED6580E1674B72/search', {
            params: {
                query: 'year("date")=' + year + ' and "gridpoint_id"=' + gmx_id,
                apikey: '6Q81IXBUQ7'
            }
        })
            .then(function (response) {
                let features = response.data.features;
                let result = features.map((feature, index) => new Feature(feature.properties));
                resolve(result);
            })
            .catch(error => reject(error))
    });
}

class GridPoint {
    constructor(lat, long) {
        this.lat = GridPoint.roundNearestQuarter(lat);
        this.long = GridPoint.roundNearestQuarter(long);
    }

    static roundNearestQuarter(value) {
        return (Math.round(value * 4) / 4).toFixed(2);
    }
}

class Feature {
    constructor(data) {
        this.gmx_id = data.gmx_id;
        this.AvgTemp = data.AvgTemp;
        this.MaxTemp = data.MaxTemp;
        this.MinTemp = data.MinTemp;
        this.Date = moment(data.Date);
    }
}