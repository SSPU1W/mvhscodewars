import config from "../config";
/**
 * Load the cars from the spreadsheet
 * Get the right values from it and assign.
 */
/* 
First row becomes default keys for the returned object (array)
ex: if the header is: Name, Date, Score
then each object will look like:
{
  name: "",
  date: "",
  score: "",
}
*/

// here, set any custom headers
// overrides the headers in first row of the spreadsheet.
var customHeaders = {
    0: "isCurrentStudent",
    1: "userName",
    2: "year"
};
  
export function load(callback) {
  window.gapi.client.load("sheets", "v4", () => {
    window.gapi.client.sheets.spreadsheets.values
        .get({
            spreadsheetId: config.spreadsheetId,
            range: "Sheet1"
        })
        .then(
            response => {
                const data = response.result.values;
                // get data in spreadsheet
                
                // get first row if exists
                var firstRow = data.length > 0 ? data[0] : [];
                // create headers based on first row and customHeaders
                var headers = [];
                for (let i = 0; i < firstRow.length; i++) {
                    headers.push(customHeaders[i] ? customHeaders[i] : firstRow[i]);
                }
                
                
                var users = []
                //get the data from the rest of the spreadsheet and create objects for each of them
                if (data.length > 1) {
                    for (let i = 1; i < data.length; i++) {
                    var obj = {};
                    for (var j = 0; j < data[i].length; j++) {
                        if (j < headers.length) obj[headers[j]] = data[i][j];
                    }
                    users.push(obj);
                    }
                }
                callback(users);
            },
            response => {
                callback(false, response.result.error);
            }
        );
  });
}