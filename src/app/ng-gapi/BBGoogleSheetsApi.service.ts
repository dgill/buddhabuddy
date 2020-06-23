import { Injectable } from '@angular/core';
import { GoogleApiService } from '.';
import { Trackee } from '../trackee/trackee-list.component';
import { Observable } from 'rxjs';

@Injectable()
export class BBGoogleSheetsApiService {
    constructor( private gapiService: GoogleApiService) {}
    ssId = '1_92f8kBbAWFsAy-1cqpovLxHBJbi4yLb2pATFNm1bzI'


    getTrackees(): Observable<Trackee[]> {
        let bb = this;

        this.gapiService.onLoad().subscribe(() => {
            gapi.load('client', {
                callback: function() {
                // Handle gapi.client initialization.
                gapi.client.load('sheets', 'v4', () => {
                    // console.log(gapi.client.sheets)
                    let sheets = gapi.client['sheets']
                    sheets.spreadsheets.values.get({
                        spreadsheetId: bb.ssId,
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

        let trackees = [ { label: 'test', data: 1, date: Date.now() } ]

        return new Observable<Trackee[]>(observer => {

        }) // to figure out
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