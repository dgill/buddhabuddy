import { Injectable } from '@angular/core';
import { GoogleApiService } from '.';
import { Trackee } from '../trackee/trackee-list.component';
import { Observable, of } from 'rxjs';
import {Readable} from 'readable-stream'

@Injectable()
export class BBConfigService {
    static configFileMetadata = {
        name: 'bbconfig',
        // mimeType: 'application/json',
        parents: ['appDataFolder'],
      };

    constructor( private gapiService: GoogleApiService) {}

    createConfig(): Promise<boolean> {
        const configData = `{
                "buddhabuddy_spreadsheet_id": "1234"
            }`

        const stream = new Readable()
        stream.push(JSON.stringify(configData))
        stream.push(null)
        
        const uploadableConfigFile = {
            mimeType: 'application/json',
            body: stream
            // body: of(JSON.stringify(BBConfigService.configFileMetadata))
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
                                resource: BBConfigService.configFileMetadata,
                                media: uploadableConfigFile,
                                fields: 'id'
                            }).then(response => {
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

    getConfig(): Promise<object> {

        return new Promise<object>((resolve, reject) => {
            this.gapiService.onLoad().subscribe(() => {
                gapi.load('client', {
                    callback: function() {
                        gapi.client.load('drive', 'v3', () => {
                            gapi.client.drive.files.list({
                                // q: `name = 'bbconfig.json'`,
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
                                            console.log('found file with id ' + file.id)

                                            resolve(this.getFile(file.id))
                                        }
                                        else if (fileList.files.length === 0) {
                                            let msg = 'Did not find config file'
                                            console.log(msg)
                                            reject(msg)
                                        }
                                        else {
                                            let msg = 'Somehow found more than one config file'
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