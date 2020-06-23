import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/user/user.service';
import { GoogleApiService } from 'src/app/ng-gapi';
import { BBGoogleSheetsApiService } from '../ng-gapi/BBGoogleSheetsApi.service';

@Component({
  selector: 'app-trackee-list',
  templateUrl: './trackee-list.component.html',
  styleUrls: ['./trackee-list.component.css']
})
export class TrackeeListComponent implements OnInit {
  todaysTrackees: Trackee[]

  constructor(private userService: UserService, private bbService: BBGoogleSheetsApiService) { }

  ngOnInit(): void {
    // Get or create spreadsheet
    
    // Read list of trackee labels from spreadsheet from API

    // Read trackee values for today from API
  }

  signIn(): void {
    
    this.userService.signIn()


  }

  createSheet(): void {
    // this.todaysTrackees = []
    // this.bbService.getTrackees().subscribe()

    console.log("today's trackees: ")
    console.log(this.todaysTrackees)
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

export class Trackee {
  label: string
  value: string
  date: Date
}