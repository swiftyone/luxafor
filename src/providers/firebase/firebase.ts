import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Storage } from '@ionic/storage';

@Injectable()
export class FirebaseProvider {

  constructor(public af: AngularFireDatabase, public angularFireAuth: AngularFireAuth, public storage: Storage) {}

  addUserByEmail(email, uid) {
    this.af.list(`users/${uid}`).set('email', email);
  }

  userExists(uid) {
    // return new Promise((resolve, reject) => {
    //   console.log(this.af.database.ref('user').child(uid));
    //   if (this.af.database.ref('user').child(uid)) {
    //     resolve();
    //   } else {
    //     reject();
    //   }
    // });
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
    return this.getStorageUid().then(uid => {
      return this.af.object(`users/${uid}`).update({'username': username});
    })
  }

  getCurrentAuthUser() {
    return new Promise((resolve, reject) => {
      this.angularFireAuth.authState.subscribe(user => {
        if (user) {
          resolve(user);
        } else {
          reject(new Error('User not found.'));
        }
      })
    });
  }

  getUserByUid(uid) {
    return new Promise((resolve, reject) => {
      this.af.object(`users/${uid}`).valueChanges().subscribe(data => {
        resolve(data);
      });
    });
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
      return this.getStorageUid().then(uid => {
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

  setStorageUid(uid) {
    this.storage.set('uid', uid);
  }
  getStorageUid() {
    return this.storage.get('uid');
  }
  setStorageActiveColor(num: number) {
    return this.storage.set('activeColor', num);
  }
  getStorageActiveColor() {
    return this.storage.get('activeColor');
  }

  getGantt(userkey: string, date?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let observer = this.af.object(`status/${userkey}/${date != undefined ? date : ''}`).valueChanges().subscribe(data => {
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
          resolve(gantts);
        } catch (err) {
          reject('Keine Datensätze gefunden.');
        }
        observer.unsubscribe();
      });
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
