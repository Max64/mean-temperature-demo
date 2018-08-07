mapsApi = function () {

    let loadDatasetByPointAndYearCount = function(lat, long, years) {
        return new Promise((resolve, reject) => {
            let gridPoint = new GridPoint(lat, long);

            getGmxIdByCoords(gridPoint.lat, gridPoint.long)
                .then(function (response) {
                    let data = parseData(response.data);
                    let gmx_id = data.features[0].properties.gmx_id;

                    return batchLoadFeaturesForYearsPeriod(gmx_id, years);
                })
                .then(function (yearsPeriodDataset) {
                    resolve(yearsPeriodDataset);
                })
                .catch(error => reject(error));
        })
    };

    function parseData(responseString) {
        let jsonString = responseString.replace("functionname(", "").slice(0, -1);
        return JSON.parse(jsonString);
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

    function batchLoadFeaturesForYearsPeriod(gmx_id, years) {
        return new Promise((resolve, reject) => {
            let yearQueries = [];

            years.forEach((year, index) => {
                yearQueries.push(getFeaturesByGmxIdAndYear(gmx_id, year));
            });

            Promise.all(yearQueries).then(responses => {
                let yearDatasets = [];

                years.forEach((year, index) => {
                    yearDatasets.push(new YearDataset(year, responses[index]));
                });

                resolve(new YearsBatchDataset(yearDatasets));
            }, reason => {
                reject(reason)
            });
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

    return {
        loadDatasetByPointAndYearCount: loadDatasetByPointAndYearCount
    };

}();