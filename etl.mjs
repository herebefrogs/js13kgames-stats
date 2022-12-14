import { readFileSync, writeFileSync } from 'node:fs';

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
// from 08-13 to 09-13
function getCompetitionDates() {
  const dates = [];
  for (let m = 8, d = 13;; d += 1) {
    dates.push(`0${m}-${d < 10 ? 0 : ''}${d}`);

    if (d === 31) {
      m += 1;
      d = 0;    // I could have used d %= 32 to wrap around but that's too smart
    }
    else if (m === 9 && d === 13) {
      break;
    }
  }
  return dates;
}

// associate a 0 count to each competition date
function getDefaultCounts() {
  return getCompetitionDates()
    .reduce((counts, date) => {
      counts[date] = 0;
      return counts;
    }, {});
}

// tally, for each year, how many entries were
// submitted for each day of the competition
function countDailyEntriesPerYear(lines) {
  const daysPerYear = {};

  lines.forEach(([year, date, time]) => {
    // initialize default counts
    // if encountering year for 1st time
    daysPerYear[year] ||= getDefaultCounts();

    // Submissions on 09-14 are usually to fix
    // a broken ZIP for entries already submitted,
    // so they shouldn't be counted again
    if (date !== '09-14') {
      daysPerYear[year][date] += 1;
    }
  })

  return daysPerYear;
}

// convert the tally into an array of {x: day, y: count, z: year}
// for D3's younger sibbling Plot
function flattenHashToArray(yearDayCount) {
  const data = [];

  Object.entries(yearDayCount).forEach(([year, daysCount]) => {
    Object.entries(daysCount).forEach(([day, count]) => {
      data.push({day, count, year})
    })
  })

  return data;
}

function dailyCountHashToArray(countsAllYear) {
  const data = {};

  Object.entries(countsAllYear).forEach(([year, daysCount]) => {
    data[year] = Object.entries(daysCount).map(([day, count]) => ({ day, count}))
  });

  return data;
}

function findFirstEntryPerYear(countsPerYear) {
  const data = [];

  Object.entries(countsPerYear).forEach(([year, daysCount]) => {
    const firstEntry = daysCount.find(d => d.count > 0);
    data.push({
      year,
      ...firstEntry
    })
  })

  return data;
}

const lines = parseData(readFile('./data/raw/js13k-timestamps.txt'));
const countsAllYear = countDailyEntriesPerYear(lines);
const data = flattenHashToArray(countsAllYear);
const countsPerYear = dailyCountHashToArray(countsAllYear);
const firstEntryPerYear = findFirstEntryPerYear(countsPerYear);

writeFileSync(
  './data/processed/data.js',
  `export const countsAllYear = ${JSON.stringify(data)};\n` +
  `export const countsPerYear = ${JSON.stringify(countsPerYear)};\n` +
  `export const firstEntryPerYear = ${JSON.stringify(firstEntryPerYear)};\n`
)

