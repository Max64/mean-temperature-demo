
const yearCount = 3;

var app = new Vue({
    el: '#app',
    data: {
        yearCount: yearCount,
        currentYear: moment().year(),
        mapPoint: {        // Москва
            lat: 55.76,
            long: 37.64
        }
    },
    methods: {
        mapClicked(point) {
            this.mapPoint = {
                lat: point.lat,
                long: point.long
            }
        }
    }
});

