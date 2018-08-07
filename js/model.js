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

class YearDataset {
    constructor(year, features) {
        this.year = year;
        this.monthStats = [];

        features.forEach(feature => {
            let month = feature.Date.month();

            if (!this.monthStats[month]) this.monthStats[month] = {
                dayCount: 0,
                tempSum: 0
            };

            this.monthStats[month].dayCount++;
            this.monthStats[month].tempSum += feature.AvgTemp;
        });

        for (let month in this.monthStats) {
            let monthStat = this.monthStats[month];
            let avgTemp = monthStat.tempSum / monthStat.dayCount;
            monthStat.avgTemp = Math.round(avgTemp * 10) / 10;
        }
    }
}

class YearsBatchDataset {
    constructor(yearDatasets) {
        this.avgMonthStats = [];

        yearDatasets.forEach(yearDataset => {
            this[yearDataset.year] = yearDataset;

            for (let month in yearDataset.monthStats) {
                if (!this.avgMonthStats[month]) this.avgMonthStats[month] = {
                    avgTempSum: 0,
                    yearCount: 0};

                this.avgMonthStats[month].yearCount++;
                this.avgMonthStats[month].avgTempSum += yearDataset.monthStats[month].avgTemp;
            }
        });

        for (let month in this.avgMonthStats) {
            let monthStat = this.avgMonthStats[month];
            let avgTemp = monthStat.avgTempSum / monthStat.yearCount;
            monthStat.avgTemp = Math.round(avgTemp * 10) / 10;
        }
    }

}

function mapAvgTemp(array) {
    return array.map(value => value.avgTemp);
}
