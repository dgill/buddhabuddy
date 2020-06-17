import { Injectable } from '@angular/core';
import { GoogleApiService } from '.';

@Injectable()
export class BBGoogleSheetsApiService {
    constructor( private gapiService: GoogleApiService) {}

    getOrCreateSpreadsheet() {
        
        this.gapiService.onLoad().subscribe(() => {
            gapi.load('client', {
                callback: function() {
                // Handle gapi.client initialization.
                gapi.client.load('sheets', 'v4', () => {
                    // console.log(gapi.client.sheets)
                    let sheets = gapi.client["sheets"]
                    sheets.spreadsheets.create({
                    properties: {
                        title: "Testing from BuddhaBuddy"
                    }
                    }).then((response) => {
                    console.log(response)
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
}