import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { User, Gantts } from '../../app/interfaces';
import { StorageProvider } from '../storage/storage';

@Injectable()
export class FirebaseProvider {

  constructor(public af: AngularFireDatabase, public angularFireAuth: AngularFireAuth, public storage: StorageProvider) {}

  addUserByEmail(email, uid) {
    this.af.list(`users/${uid}`).set('email', email);
  }

  userExists(uid) {
    return new Promise((resolve, reject) => {
      this.af.database
        .ref('users')
        .once('value')
        .then(data => {
          if (data.hasChild(uid)) {
            resolve();
          } else {
            reject();
          };
        })
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
      this.af.object(`users/${uid}`).valueChanges().subscribe(data => {
        resolve(data);
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
    return new Promise((resolve, reject) => {
      let date = new Date();
      let day = date.getDate();
      let month = date.getMonth();
      let year = date.getFullYear();
      let timestamp = + date;
      return this.storage.getStorageUid().then(uid => {
        if (uid != null) {
          this.af.object(`users/${uid}`).update({'status': status});
          this.af.object(`status/${uid}/${year}-${month}-${day}`).update({[timestamp]: status});
          resolve();
        } else {
          reject(Error('Uid not found.'));
        }
      });
    });
  }

  getPokes(uid: string) {
    return this.af.list(`messages/${uid}`);
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

  getGantt(userkey: string, date?: string): Observable<Gantts> {
    return this.af.object(`status/${userkey}/${date != undefined ? date : ''}`).valueChanges().map(data => {
      if (date)
        data = {[date]: data};
      let gantts = [];
      try {
        for (let key of Object.keys(data).reverse()) {
          let datum = key.split('-');
          let prev = Number(new Date(Number(datum[0]), Number(datum[1]), Number(datum[2]), 8, 0, 0));
          let last = Number(new Date(Number(datum[0]), Number(datum[1]), Number(datum[2]), 20, 0, 0));
          let blocks = [];
          Object.keys(data[key]).forEach((time, index) => {
            if (Number(time) >= Number(prev) && Number(time) <= Number(last)) {
              blocks.push(this.calculateBlock(data, key, time, prev, index));
              prev = Number(time);
            }
          });
          blocks.push(this.calculateBlock(data, key, last, prev));
          gantts.push({
            blocks: blocks,
            datum: key
          });
        }
        return gantts;
      } catch (err) {
        throw new Error('Keine Datensätze gefunden.');
      }
    });
  }

  calculateBlock(data, key, time, prev, index?) {
    let width = (Number(time) - prev) / 43200000;
    let showTime = new Date(Number(prev))
    let minute = String(showTime.getMinutes());
    let minuteStr = minute.length == 1 ? 0 + minute : minute;
    return {
      width: width * 100 + '%',
      status: index == 0 ? 7 : data[key][prev],
      time: showTime.getHours() + ":" + minuteStr
    }
  }

}
