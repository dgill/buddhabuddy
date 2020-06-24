import { Injectable } from '@angular/core';
import { GoogleApiService } from '.';
import { Trackee } from '../trackee/trackee-list.component';
import { Observable } from 'rxjs';
import * as fs from 'fs';
import { EventEmitter } from 'protractor';

@Injectable()
export class BBConfigService {
    constructor( private gapiService: GoogleApiService) {}


    getConfig(): Promise<Trackee[]> {
        this.gapiService.onLoad().subscribe(() => {
            
            const fileMetadata = {
                name: 'bbconfig.json',
                parents: ['appDataFolder']
              };
            const media = {
                mimeType: 'application/json',
                // body: fs.createReadStream('files/config.json')
                body: `{
                    "buddhabuddy_spreadsheet_id": "1234"
                }`
              };
            gapi.load('client', {
                callback: function() {
                    gapi.client.load('drive', 'v3', () => {
                        gapi.client.drive.files.create({
                            resource: fileMetadata,
                            media: media,
                            fields: 'id'
                        }).then(response => {
                            switch(response.status) {
                                    case 200:
                                        let file = response.result  
                                        console.log("Created bbconfig file")
                                        console.log(file)
                                        break;
                                    default:
                                        console.log("Could not create bbconfig file")
                                        break;
                            }
                        })
                    })
                }
            })
            //   , function (err, file) {
            //     if (err) {
            //       // Handle error
            //       console.error(err);
            //     } else {
            //       console.log('Folder Id:', file.id);
            //     }
            //   });


        })

        return new Promise<Trackee[]>((resolve, reject) => {
            let trackees = [ { label: 'test', value: 1, date: new Date() } ]
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