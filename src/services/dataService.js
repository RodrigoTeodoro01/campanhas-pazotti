import Papa from 'papaparse';

const SHEET_ID = '1BWTjmTA-hwG8YyTcZ_4WjWQaISg6JPjywhYewEces5s';

export const fetchData = async (gid = '753985639') => {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
    const response = await fetch(url);
    const csvData = await response.text();
    
    // Find the header row (starting with Nº)
    const lines = csvData.split('\n');
    const headerIndex = lines.findIndex(line => line.startsWith('Nº') || line.includes(',INDUSTRIA,'));
    
    let cleanCsv = csvData;
    if (headerIndex > -1) {
      cleanCsv = lines.slice(headerIndex).join('\n');
    }

    return new Promise((resolve, reject) => {
      Papa.parse(cleanCsv, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Clean up data: Remove rows that don't have a Nº
          const filteredData = results.data.filter(row => row['Nº'] && row['Nº'].trim() !== '');
          resolve(filteredData);
        },
        error: (err) => reject(err)
      });
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

const UPDATE_URL = 'https://script.google.com/macros/s/AKfycbyQDZWV64ChcqH1adbOaOOJu-hQtjj0sytcvSa44TWSmwVT78_u061VUvunToGxjQSKkg/exec';

export const updateRow = async (rowId, field, value) => {
  try {
    const response = await fetch(UPDATE_URL, {
      method: 'POST',
      mode: 'no-cors', // Google Apps Script requires no-cors for simple web app POSTs from browsers
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rowId, field, value }),
    });
    
    console.log(`Update sent: Row ${rowId} - Field ${field} - New Value: ${value}`);
    return true;
  } catch (error) {
    console.error('Error updating data:', error);
    return false;
  }
};
