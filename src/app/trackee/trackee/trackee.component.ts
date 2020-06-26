import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/user/user.service';
import { GoogleApiService } from 'src/app/ng-gapi';

@Component({
  selector: 'app-trackee',
  templateUrl: './trackee.component.html',
  styleUrls: ['./trackee.component.css']
})
export class TrackeeComponent implements OnInit {

  constructor(private userService: UserService, private gapiService: GoogleApiService) { }

  ngOnInit(): void {
  }

  signIn(): void {
    
    this.userService.signIn()


  }

  createSheet(): void {

    this.gapiService.onLoad().subscribe(() => {
      gapi.load('client', {
        callback: function() {
        // Handle gapi.client initialization.
        gapi.client.load('sheets', 'v4', () => {
          console.log(gapi.client.sheets)
          let sheets = gapi.client.sheets
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
    //   gapi.client.load("sheets", "4").then(() => {
    //     gapi.client.sheets
    //   }).spreadsheets.create({
    //     properties: {
    //       title: "Huzzah made it 2020-06-17"
    //     }
    //   }).then((response) => {
    //   });
    // })
  }

}
