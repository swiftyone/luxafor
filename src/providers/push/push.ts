import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";

/*
  Generated class for the PushProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PushProvider {

  constructor(private fbap: Firebase, private http: HttpClient) {}

  getToken() {
    this.fbap.getToken().then(token => {
      console.log(token);
    });
  }

  grantPermission() {
    this.fbap.hasPermission().then((res) => {
      console.log(res);
    }).catch(err => {
      this.fbap.grantPermission().then((res) => {
        console.log(res);
      }).catch((err) => {
        console.log(err);
      })
    });
  }

  push(uid, name, message) {
    let tkParams = new HttpParams()
      .set('uid', uid)
      .set('sender', name)
      .set('message', message)
    this.http.get('http://localhost:5000/push', {params: tkParams}).subscribe(data => {
      console.log(data);
    });
  }

}
