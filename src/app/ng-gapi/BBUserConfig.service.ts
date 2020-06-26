import { Injectable } from '@angular/core';
import { GoogleApiService } from '.';
import { Trackee } from '../trackee/trackee-list.component';
import { Observable, of } from 'rxjs';
// import {Readable} from 'readable-stream'
// import { createReadStream } from 'fs'


@Injectable()
export class BBConfigService {
    static configFileMetadata = {
        name: 'bbconfig',
        // mimeType: 'application/json',
        parents: ['appDataFolder'],
      };

    constructor( private gapiService: GoogleApiService) {}

    createConfig(): Promise<boolean> {
        // var fileMetadata = {
        //     name: 'bbconfig.json',
        //     parents: ['appDataFolder']
        //   };
        // var media = {
        //     mimeType: 'application/json',
        //     body: createReadStream('./bbconfig.json')
        //   };

        // this.gapiService.onLoad().subscribe(() => {
        //     gapi.load('client', {
        //         callback: function() {
        //             gapi.client.load('drive', 'v3', () => {
        //                 gapi.client.drive.files.create({
        //                     resource: fileMetadata,
        //                     media: media,
        //                     fields: 'id'
        //                 }).then(response => {
        //                     switch(response.status) {
        //                         case 200:
        //                             let file = response.result  
        //                             console.log("Created bbconfig file")
        //                             console.log(file)
        //                             break;
        //                         default:
        //                             console.log("Could not create bbconfig file")
        //                             break;
        //                     }
        //                 })
        //             })
        //         }
        //     })
        // })

        // return new Promise<boolean>((res, rej) => {})

          ////////////////////////////////////////////




        const configData = `{
                "buddhabuddy_spreadsheet_id": "1234"
            }`

        // const stream = new Readable()
        // stream.push(JSON.stringify(configData))
        // stream.push(null)
        
        const uploadableConfigFile = {
            name: 'bbconfig4',
            mimeType: 'application/json',
            parents: ['appDataFolder'],
            // body: stream
            // body: of(JSON.stringify(configData))
            // body: configData
          };
        //Set up stream to push config file to Google



        console.log('this in createConfig() ')
        console.log(this)

        return new Promise<boolean>((resolve, reject) => {
            this.gapiService.onLoad().subscribe(() => {
                gapi.load('client', {
                    callback: function() {
                        gapi.client.load('drive', 'v3', () => {
                            gapi.client.drive.files.create({
                                // resource: uploadableConfigFile,
                                // media: BBConfigService.configFileMetadata,
                                // fields: 'id',
                            }, uploadableConfigFile).then(response => {
                                switch(response.status) {
                                        case 200:
                                            let file = response.result  
                                            console.log("Created bbconfig file")
                                            console.log(file)
                                            resolve()
                                            break;
                                        default:
                                            console.log("Could not create bbconfig file")
                                            reject(`Could not create bbconfig file: ${response.result}`)
                                            break;
                                }
                            })
                        })
                    }
                })
            })

        })
    }

    
    private getFile(id: string): Promise<object> {
        return new Promise<object>((resolve, reject) => {
            this.gapiService.onLoad().subscribe(() => {
                gapi.load('client', {
                    callback: function() {
                        gapi.client.load('drive', 'v3', () => {
                            gapi.client.drive.files.get({
                                fileId: id,
                                alt: 'media'
                            }).then(response => {
                                switch(response.result) {
                                    case 200:
                                        let file = response.result
                                        console.log('got config file:')
                                        console.log(file)
                                        resolve(file)
                                        break;
                                    default:
                                        let msg = 'Could not fetch file with id ' + id
                                        console.error(msg)
                                        reject(msg)
                                        break;
                                }
                            })
                        })
                    }
                })
            })

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