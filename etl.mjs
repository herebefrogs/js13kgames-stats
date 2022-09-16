import { readFileSync } from 'node:fs';
import { get } from 'node:https';

// read raw data dump
function readFile(path) {
  return readFileSync(path).toString();
}

// break each data row into useful columns
function parseData(content) {
  return content.split('\n')
    // separate date from time
    .map(line => line.split(' '))
    // separate year from month/day
    .map(([date, time]) => [...date.replace('-', ' ').split(' '), time])
}

// return all dates of the competition as MM-DD
// from 08-13 to 09-14 (yes some entries are
// submitted past the deadline)
function getCompetitionDates() {
  const dates = [];
  for (let m = 8, d = 13;; d += 1) {
    dates.push(`0${m}-${d < 10 ? 0 : ''}${d}`);

    if (d === 31) {
      m += 1;
      d = 0;    // I could have used d %= 32 to wrap around but that's too smart
    }
    else if (m === 9 && d === 14) {
      break;
    }
  }
  return dates;
}

function getDefaultCounts() {
  return getCompetitionDates()
    .reduce((counts, date) => {
      counts[date] = 0;
      return counts;
    }, {});
}

function countSubmissionPerDayPerYear(lines) {
  const daysPerYear = {};

  lines.forEach(([year, date, time]) => {
    // initialize default counts
    // if encountering year for 1st time
    daysPerYear[year] ||= getDefaultCounts();

    daysPerYear[year][date] += 1;
  })

  return daysPerYear;
}

const lines = parseData(readFile('./data/raw/js13k-timestamps.txt'));
const yearlySubmissionDayCounts = countSubmissionPerDayPerYear(lines);

console.log(yearlySubmissionDayCounts);


