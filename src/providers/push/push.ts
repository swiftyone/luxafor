import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { FirebaseProvider } from '../firebase/firebase';
import { Subscription } from 'rxjs/Subscription';
import { NotificationsPage } from '../../pages/notifications/notifications';

@Injectable()
export class PushProvider {
  tokenRefresher: Subscription;
  constructor(public fbap: Firebase, public http: HttpClient, public fbdb: FirebaseProvider) {}

  getToken(uid) {
    this.tokenRefresher = this.fbap.onTokenRefresh().subscribe(token => {
      this.fbdb.saveToken(token, uid);
    });
  }

  whenPush() {
    return this.fbap.onNotificationOpen();
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
    this.http.get('https://ampel.wiro-consultants.com/push', {params: tkParams}).subscribe(data => {
      console.log(data);
    });
  }

  unregister() {
    this.fbap.unregister()    
  }

}
