class YearDataset {
    constructor(year, features) {
        this.year = year;
        this.monthStats = {};

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
            monthStat.avgTemp = monthStat.tempSum / monthStat.dayCount;
        }
    }


}