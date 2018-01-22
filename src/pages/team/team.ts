import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { ActionSheetController } from 'ionic-angular';
import { ProfilePage } from '../profile/profile';

@Component({
  selector: 'page-team',
  templateUrl: 'team.html'
})
export class TeamPage {
  users: Observable<any[]>;
  constructor(public navCtrl: NavController, public fb: FirebaseProvider, public actionSheetCtrl: ActionSheetController) {
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
    this.actionSheetCtrl.create({
      title: 'Poke colleagues',
      buttons: [
        {
          text: 'Poke',
          handler: () => {
            console.log(user);
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
