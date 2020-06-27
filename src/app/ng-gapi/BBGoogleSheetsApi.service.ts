import { Injectable } from '@angular/core';
import { GoogleApiService } from '.';
import { Trackee } from '../trackee/trackee-list.component';
import { Observable } from 'rxjs';
import { promise } from 'protractor';

@Injectable()
export class BBGoogleSheetsApiService {
    ssID: string

    constructor( private gapiService: GoogleApiService) {
        
    }


    findSSID(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.gapiService.onLoad().subscribe(() => {
                gapi.load('client', {
                    callback: function() {
                        gapi.client.load('drive', 'v3', () => {
                            gapi.client.drive.files.list({
                                q: `name = 'BuddhaBuddy Data'`,
                                // q: `'appDataFolder' in parents`,
                                // q: `'appDataFolder' in parents`,
                                // q: `'appDataFolder' in parents and name = '${BBConfigService.configFileMetadata.name}'`,
                                fields: 'files(id, name, spaces)',
                                // spaces: 'appDataFolder'
                            }).then(response => {
                                switch(response.status) {
                                    case 200:
                                        let fileList = response.result
                                        console.log(fileList)
                                        if (fileList.files.length === 1) {
                                            let file = fileList.files[0]
                                            console.log('found BB Data file with id ' + file.id)
                                            resolve(file.id)
                                        }
                                        else if (fileList.files.length === 0) {
                                            let msg = 'Did not find BB Data file'
                                            console.log(msg)
                                            reject(msg)
                                        }
                                        else {
                                            let msg = 'Found more than one BB Data'
                                            console.error(msg)
                                            reject(msg)
                                        }
                                        break;
                                    default:
                                        let msg = `Listing files (searching for config file) broke: ${response.result}`
                                        console.error(msg)
                                        reject(msg)
                                }
                            })
                        })
                    }
                })
            })

        })
    }

    setSSID() : Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (this.ssID == null) {
                this.findSSID()
                    .then((id) => {
                        this.ssID = id
                        resolve(true)
                    }).catch((msg) => {
                        console.error(msg)
                        reject(msg)
                    })
            }
            else {
                resolve(true)
            }
        })
    }

    getTrackees(): Promise<Trackee[]> {
        const bb = this
        
        return new Promise((resolve, reject) => {
            this.setSSID().then(() => {
                this.gapiService.onLoad().subscribe(() => {
                    gapi.load('client', () => {
                        gapi.client.load('sheets', 'v4', () => {
                            let sheets = gapi.client['sheets']
                            sheets.spreadsheets.values.get({
                                spreadsheetId: bb.ssID,
                                range: 'A1:D' // Get the whole sheet
                            }).then(response => {
                                switch (response.status) {
                                    case 200:
                                        const result = response.result
                                        console.log(result)
                                        if (result.values.length > 1) {
                                            const lastRowNumber = result.values.length - 1
                                            const [, ...trackeeLabels] = result.values[0] // Skip first (timestamp) column
                                            const lastRow = result.values[lastRowNumber]
                                            const [, ... trackeeValues] = lastRow // Skip timestamp
                                            const lastDate = lastRow[0]
                                            const trackees = trackeeLabels.map((label) => {
                                                return {
                                                    label: label,
                                                    value: Number(trackeeValues[trackeeLabels.indexOf(label)]),
                                                    date: lastDate
                                                }
                                            })
                                            console.log(trackees)
                                            resolve(trackees)
                                        }
                                        else if (result.values.length === 0) {
                                            const msg = 'Did not find any data in BB Data sheet'
                                            console.error(msg)
                                            reject(msg)
                                        }
                                        else if (result.values.length === 1) {
                                            // values are zero, have to add new day
                                        }
                                        break
                                    default:
                                        reject(`Response when trying to load trackees was ${response.status}`)
                                }
                            }).catch(innerMsg => {
                                const outerMsg = 'Could not fetch trackees from data sheet: ' + innerMsg
                                console.error(outerMsg)
                                reject(outerMsg)
                            })
                        })
                    })
                })
            })

        })
        this.gapiService.onLoad().subscribe(() => {
            gapi.load('client', {
                callback: function() {
                // Handle gapi.client initialization.
                gapi.client.load('sheets', 'v4', () => {
                    // console.log(gapi.client.sheets)
                    let sheets = gapi.client['sheets']
                    sheets.spreadsheets.values.get({
                        spreadsheetId: bb.ssID,
                        range: 'A1:C1'
                    }).then((response) => {
                        const result = response.result
                        console.log(result)
                        return result.values[0];
                    })
                })
                // console.log(gapi.client)
                // initGapiClient();
                },
                onerror: function() {
                // Handle loading error.
                alert('gapi.client failed to load!');
                },
                timeout: 5000, // 5 seconds.
                ontimeout: function() {
                // Handle timeout.
                alert('gapi.client could not load in a timely manner!');
                }
            });
        })

        return new Promise<Trackee[]>((resolve, reject) => {
            const trackees = [ { label: 'test', value: 1, date: new Date() } ]
            resolve(trackees)
        })
    }

    private createSheet() {
        let sheets = gapi.client["sheets"]
        sheets.spreadsheets.create({
        properties: {
            title: "BuddhaBuddy Data"
        }
        }).then((response) => {
          console.log(response)
        })
    }
}