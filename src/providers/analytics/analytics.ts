import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase';

/*
  Generated class for the AnalyticsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AnalyticsProvider {

  constructor(private fbap: Firebase) {}

  setUser(uid) {
    this.fbap.setUserId(uid);
    this.fbap.setUserProperty('user_id', uid);
  }  

  setScreen(name: string) {
    this.fbap.setScreenName(name).then((res) => {
      console.log(res);
    }).catch((error) => {
      console.error(error);
    });
  }
  // log view event
  logEvent(action: string, value: any) {
    this.fbap.logEvent(action, {pram: value}).then((res) => {
      console.log(res);
    }).catch((error) => {
      console.error(error);
    });
  }

}
