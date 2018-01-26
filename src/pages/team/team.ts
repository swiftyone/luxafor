import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { ActionSheetController } from 'ionic-angular';
import { ProfilePage } from '../profile/profile';
import { HttpClient } from "@angular/common/http";
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'page-team',
  templateUrl: 'team.html'
})
export class TeamPage {
  users: Observable<any[]>;
  constructor(public navCtrl: NavController, public fb: FirebaseProvider, public actionSheetCtrl: ActionSheetController, private http: HttpClient) {
    // this.users = fb.getAllUsers('status').valueChanges();
    this.users = fb.getAllUsers('status').snapshotChanges().map(actions => {
      return actions.map(action => {
        const $key = action.payload.key;
        const data = { $key, ...action.payload.val() };
        return data;
      });
    });
  }

  sorting() {
    this.actionSheetCtrl.create({
      title: 'Sort colleagues',
      buttons: [
        {
          text: 'Sort by status',
          handler: () => {
            this.users = this.fb.getAllUsers('status').snapshotChanges().map(actions => {
              return actions.map(action => {
                const $key = action.payload.key;
                const data = { $key, ...action.payload.val() };
                return data;
              });
            });;
          }
        },
        {
          text: 'Sort by name',
          handler: () => {
            this.users = this.fb.getAllUsers('username').snapshotChanges().map(actions => {
              return actions.map(action => {
                const $key = action.payload.key;
                const data = { $key, ...action.payload.val() };
                return data;
              });
            });
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).present();
  }
  
  poke(user) {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer AIzaSyCrwRzqR5fO1-oVsQ_jTuPw3EMlZODSQa0`);
    this.actionSheetCtrl.create({
      title: 'Poke colleagues',
      buttons: [
        {
          text: 'Poke',
          handler: () => {
            console.log(user);
            this.http.post('https://fcm.googleapis.com/v1/projects/myproject-b5ae1/messages:send', {
              "message":{
                "token" : "dh3D7I6N8Cw:APA91bHzwFkwKPsqsU9WhqjEUw5F_lWXLNl8K781uEfa_qk7qid2GnhjUty0ls4UP99sUKPgHlc-ZoJnZXrKnmDDdCbfw5ufIjnefT1AFlj3TfP8th0_681bjUU8MXcy4GrOi5tAEn1t",
                "notification" : {
                  "body" : "This is an FCM notification message!",
                  "title" : "FCM Message",
                }
              }
            }, {
              headers: headers
            }).subscribe(data => {
              console.log(data);
            })
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).present();
  }

  goProfile(user) {
    this.navCtrl.push(ProfilePage, {user: user});
  }
}
