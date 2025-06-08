export async function getData(file, start, col, ann, yearRange = null){

    // Daten aus csv holen
    console.log(file);
    const response = await fetch(file);
    const data = await response.text();
    // Daten filtern und aufbereiten
    const filterData = data.split('\n').slice(start).join('\n');

    // nach Zeilen und leeren Zeilen
    const rows = filterData.split('\n').filter(value=> value !== "");

    // nach Reihen und leeren Reihen
    const rowsAsColumns = rows.map(row => row.split(',').filter(value=> value !== ""));

    const inc = [];
    const year = [];


    // jährlichen Anstieg rausfiltern

    for (let i = 0; i < rowsAsColumns.length; i++) {
        const currYear = parseInt(rowsAsColumns[i][ann]);
        const currValue = parseFloat(rowsAsColumns[i][col]);

        if (isNaN(currYear) || isNaN(currValue)) continue;
        if (yearRange && (currYear < yearRange[0] || currYear > yearRange[1])) continue;

        year.push(currYear);
        inc.push(currValue);
    }

    //max und min Wert des Datensatzes bestimmen
    const min = Math.min(...inc);
    const max = Math.max(...inc);

    console.log('Zeilen:', rows.length, 'Jahre:', year.length, 'min:', min, 'max:', max);

    return{min, max, inc, year};
}

