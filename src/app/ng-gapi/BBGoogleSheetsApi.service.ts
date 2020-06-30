import { Injectable } from '@angular/core';
import { GoogleApiService } from '.';
import { Trackee } from '../trackee/trackee-list.component';
import { Observable } from 'rxjs';
import { promise } from 'protractor';

@Injectable()
export class BBGoogleSheetsApiService {
    
    ssID: string
    gsheets: gapi.client.sheets.SpreadsheetsResource // gapi.client.sheets when loaded

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
                            this.gsheets = gapi.client.sheets.spreadsheets
                            this.gsheets.values.get({
                                spreadsheetId: bb.ssID,
                                range: 'A1:Z' // Get the whole sheet
                            }).then(response => {
                                switch (response.status) {
                                    case 200:
                                        const result = response.result
                                        console.log(result)
                                        if (result.values.length > 1) {
                                            const trackees = this.buildTrackeesFrom(result)
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

    }

    
    private buildTrackeesFrom(result: gapi.client.sheets.ValueRange): Trackee[] {
        const lastRowNumber = result.values.length - 1
        const lastRow = result.values[lastRowNumber]
        const [, ...trackeeLabels] = result.values[0] // Skip first (timestamp) column
        const [, ... trackeeValues] = lastRow // Skip timestamp
        const lastDate = new Date(lastRow[0])
        const today = new Date()
        let todaysRowNumber = lastRowNumber

        // Do we need to start a new day's row?
        // if (lastDate.getFullYear() !== today.getFullYear() ||
        //     lastDate.getMonth() !== today.getMonth() ||
        //     lastDate.getDay() !== today.getDay() ) {
        //         todaysRowNumber = lastRowNumber + 1
        //         this.startNewDay(this.buildA1Notation(0, todaysRowNumber))
        //         .catch((msg) => {

        //             // try again?
        //         })
        // }

        const trackees = trackeeLabels.map((label) => {
            const column = trackeeLabels.indexOf(label)
            return {
                label: label,
                value: Number(trackeeValues[column]),
                date: today,
                range: this.buildA1Notation(column, todaysRowNumber)
            }
        })
        return trackees
    }

    // Builds (A/1-indexed) A1 notation used in google sheets ranges from 0-indexed rows and columns.
    buildA1Notation(column: number, row: number): string {
        return String.fromCharCode('B'.charCodeAt(0) + column) + (row + 1) // BUild A1 notation
    }

    private startNewDay(range): Promise<boolean> {
        if (this.gsheets != null) {
            return new Promise<boolean>((resolve, reject) => {
                this.gsheets.values.update({
                    spreadsheetId: this.ssID,
                    range: range,
                    valueInputOption: 'Raw',
                    resource: {
                        values: [[new Date()]]
                    }
                }).then((response) => {
                    switch(response.status) {
                        case 200:
                            const result = response.result
                            console.log(result)
                            resolve(true)
                            break
                        default:
                            const msg = `Could not start a new row for today (${new Date()}) `
                            console.log(msg)
                            reject(msg)
                    }
                })
            })
        }
        else {
            console.error('gapi.client.sheets is not loaded when trying to start a new day')
        }
    }

    incrementTrackee(trackee: Trackee): Promise<boolean> {
        if (this.gsheets != null) {
            return new Promise<boolean>((resolve, reject) => {
                this.gsheets.values.update({
                    spreadsheetId: this.ssID,
                    range: trackee.range,
                    valueInputOption: 'Raw',
                    resource: {
                        values: [[trackee.value]]
                    }
                }).then((response) => {
                    switch(response.status) {
                        case 200:
                            const result = response.result
                            console.log(result)
                            resolve(true)
                            break
                        default:
                            const msg = 'Could not increment range ' + trackee.range
                            console.log(msg)
                            reject(msg)
                    }
                })
            })
        }
        else {
            console.error('gapi.client.sheets is not loaded when trying to increment (how?)')
        }
      }

    private createSheet() {
        let sheets = gapi.client["sheets"]
        sheets.spreadsheets.create({
            resource: {
                properties: {
                    title: "BuddhaBuddy Data"
                }
            }
        }).then((response) => {
          console.log(response)
        })
    }
}