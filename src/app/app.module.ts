import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {
  GoogleApiModule, 
  GoogleApiService, 
  GoogleAuthService, 
  NgGapiClientConfig, 
  NG_GAPI_CONFIG,
  GoogleApiConfig
} from "./ng-gapi";
import { TrackeeListComponent } from './trackee/trackee-list.component';
import { UserService } from './user/user.service';
import { BBGoogleSheetsApiService } from './ng-gapi/BBGoogleSheetsApi.service';

let gapiClientConfig: NgGapiClientConfig = {
  client_id: "51389497998-jthp31sb7d67mib99pbbmfcsree1be0n.apps.googleusercontent.com",
  discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
  scope: [
      "https://www.googleapis.com/auth/spreadsheets.readonly",
      "https://www.googleapis.com/auth/spreadsheets"
  ].join(" ")
};


@NgModule({
  declarations: [
    AppComponent,
    TrackeeListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GoogleApiModule.forRoot({
      provide: NG_GAPI_CONFIG,
      useValue: gapiClientConfig
    })
  ],
  providers: [
    UserService,
    BBGoogleSheetsApiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
