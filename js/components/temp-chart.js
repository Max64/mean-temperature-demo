Vue.component('temp-chart', {
    template: `
        <div class="temp-chart-block">
            <div v-show="loading" class="loading-modal"></div>
        
            <select class="temp-chart-block__select" v-if="dataInited" v-model="year" @change="yearSelect">
                <option v-for="year in years">{{ year }}</option>
            </select>
            
            <canvas id="avgTempBarChart"></canvas>
        </div>
        `,
    props: ['mapPoint', 'yearCount', 'currentYear'],
    data() {
        return {
            year: this.currentYear,
            years: [],
            dataInited: false,
            loading: true
        }
    },
    created() {
        let year = this.currentYear;

        for (let i=0; i<this.yearCount; i++) {
            this.years.push(year);
            year--;
        }
    },
    mounted() {
        var comp = this;

        mapsApi.loadDatasetByPointAndYearCount(this.mapPoint.lat, this.mapPoint.long, this.years)
            .then(function (yearsPeriodDataset) {
                comp.yearsBatchDataset = yearsPeriodDataset;
                comp.drawBarChart();

                comp.dataInited = true;
                comp.loading = false;
            })
            .catch(error => comp.handleError(error));
    },
    watch: {
        mapPoint: function(newVal, oldVal) {
            var comp = this;
            this.loading = true;

            mapsApi.loadDatasetByPointAndYearCount(newVal.lat, newVal.long, this.years)
                .then(function (yearsPeriodDataset) {
                    comp.yearsBatchDataset = yearsPeriodDataset;
                    comp.updateBarChart();
                    comp.loading = false;
                })
                .catch(error => comp.handleError(error));
        }
    },
    methods: {
        handleError(error) {
            this.loading = false;
            alert("Ошибка: " + error);
        },

        yearSelect() {
            this.updateBarChart();
        },

        drawBarChart() {
            const monthLabels = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сент', 'Окт', 'Ноя', 'Дек'];

            let year = this.year;
            let yearData = mapAvgTemp(this.yearsBatchDataset[year].monthStats);
            let avgData = mapAvgTemp(this.yearsBatchDataset.avgMonthStats);

            this.barChart = new Chart("avgTempBarChart", {
                type: 'bar',
                data: {
                    labels: monthLabels,
                    datasets: [
                        {
                            label: year,
                            data: yearData,
                            backgroundColor: "rgba(241, 108, 108, 0.7)",
                            hoverBackgroundColor: "rgba(241, 108, 108, 0.7)",
                            hoverBorderWidth: 2,
                            hoverBorderColor: 'lightgrey'
                        },
                        {
                            label: 'Среднемесяная норма',
                            data: avgData,
                            backgroundColor: "rgba(225, 58, 55, 0.7)",
                            hoverBackgroundColor: "rgba(225, 58, 55, 0.7)",
                            hoverBorderWidth: 2,
                            hoverBorderColor: 'lightgrey'
                        },
                    ]
                },
                options: {
                    animation: {
                        duration: 500,
                    },
                    tooltips: {
                        mode: 'label'
                    },
                    scales: {
                        xAxes: [{
                            // stacked: true,
                            gridLines: { display: false },
                        }],
                        yAxes: [{
                            // stacked: true,
                        }],
                    }, // scales
                    legend: {display: true}
                }
            });
        },

        updateBarChart() {
            let yearDataset = this.barChart.data.datasets[0];

            yearDataset.label = this.year;
            yearDataset.data = mapAvgTemp(this.yearsBatchDataset[this.year].monthStats);

            let avgDataset = this.barChart.data.datasets[1];
            avgDataset.data = mapAvgTemp(this.yearsBatchDataset.avgMonthStats);

            this.barChart.update();
        }
    }

});