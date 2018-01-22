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

  updateStatus(status) {
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();
    let timestamp = + new Date();
    return this.getStorageUid().then(uid => {
      this.af.object(`users/${uid}`).update({'status': status});
      this.af.object(`status/${uid}/${day}-${month}-${year}`).update({[timestamp]: status});
    });
  }

  setStorageUid(uid) {
    this.storage.set('uid', uid);
  }
  getStorageUid() {
    return this.storage.get('uid');
  }
}
