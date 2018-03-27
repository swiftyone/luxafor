import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Gantts } from '../../app/interfaces';
import { StorageProvider } from '../storage/storage';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class FirebaseProvider {

  subscription: Subscription;
  constructor(public af: AngularFireDatabase, public angularFireAuth: AngularFireAuth, public storage: StorageProvider) {}

  addUserByEmail(email, uid) {
    this.af.object(`users/${uid}`).set({
      'email': email,
      'username': email.split('@')[0],
      'status': 0
    });
  }

  userExists(uid) {
    return new Promise((resolve, reject) => {
      this.af.database
        .ref('users')
        .once('value')
        .then(data => {
          resolve(data.hasChild(uid));
        });
    });
  }

  changeUsername(username) {
    return this.storage.getStorageUid().then(uid => {
      return this.af.object(`users/${uid}`).update({'username': username});
    })
  }

  getCurrentUser() {
    return this.storage.getStorageUid().then(uid => {
      return this.getUserByUid(uid)
    });
  }

  getUserByUid(uid) {
    // return this.af.object(`users/${uid}`).snapshotChanges().map(action => {
    //   const uid = action.payload.key;
    //   const data = { uid, ...action.payload.val() };
    //   return data;
    // }).toPromise();
    // return this.af.object(`users/${uid}`).valueChanges().map((data:User) => data).toPromise();
    return new Promise(resolve => {
      let user = this.af.object(`users/${uid}`).valueChanges().subscribe(data => {
        resolve(data);
        user.unsubscribe();
      });
    });
  }

  getUserByUidObserver(uid) {
    return this.af.object(`users/${uid}`).valueChanges();
  }

  getAllUsers(sort?: string) {
    if (sort)
      return this.af.list('users', ref => ref.orderByChild(sort));
    else
      return this.af.list('users');
  }

  updateStatus(status): Promise<any> {
    let timestamp = +new Date();
    let day = +new Date().setHours(0,0,0,0);
    return this.storage.getStorageUid().then(uid => {
      if (uid != null) {
        this.af.object(`users/${uid}`).update({'status': status});
        return this.af.object(`status/${uid}/${day}`).update({[timestamp]: status});
      }
    });
  }

  saveToken(token: string, uid: string) {
    this.af.object(`devices`).update({[uid]: token});
  }

  getPokes(uid: string): Observable<any> {
    return this.af.list(`messages/${uid}`).snapshotChanges().map(actions => {
      return actions.map(action => {
        return { pid: action.payload.key, ...action.payload.val() };
      });
    })
  }

  newPoke(senderUid: string, receipentUid: string, message: string) {
    let timestamp: number = + new Date();
    this.af.list(`messages/${receipentUid}`).push({
      time: timestamp,
      sender: senderUid,
      message: message
    });
  }

  deletePoke(pid, uid) {
    this.af.object(`messages/${uid}/${pid}`).remove();
  }

  getGantt(userkey: string, date?: number): Observable<Gantts> {
    return this.af.object(`status/${userkey}/${date != undefined ? date : ''}`).valueChanges().map(data => {
      if (date)
        data = {[date]: data};
      let gantts = [];
      try {
        for (let key of Object.keys(data).reverse()) {
          let datum = new Date(+key);
          let prev = +datum.setHours(8, 0, 0, 0);
          let last = +datum.setHours(20, 0, 0, 0);
          let blocks = [];
          Object.keys(data[key]).filter(key => Number(key) >= Number(prev) && Number(key) <= Number(last)).forEach((time, index) => {
            blocks.push(this.calculateBlock(data, Number(key), Number(time), prev, index));
            prev = Number(time);
          });
          if (last - 43200000 != prev) {
            blocks.push(this.calculateBlock(data, Number(key), last, prev));
            gantts.push({
              blocks: blocks,
              datum: key
            });
          }
        }
        return gantts;
      } catch (err) {
        throw new Error('Keine Datensätze gefunden.');
      }
    });
  }

  calculateBlock(data, key: number, time: number, prev: number, index?: number) {
    let width = (time - prev) / 43200000;
    let showTime = new Date(prev);
    let minute = String(showTime.getMinutes());
    let minuteStr = minute.length == 1 ? 0 + minute : minute;
    return {
      width: width * 100 + '%',
      status: index == 0 ? 7 : data[key][prev],
      time: showTime.getHours() + ":" + minuteStr
    }
  }

}
