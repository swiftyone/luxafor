import { Component } from '@angular/core';
import { NavController, ActionSheetController, AlertController, ToastController } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { Observable } from 'rxjs/Observable';
import { ProfilePage } from '../profile/profile';
import { PushProvider } from '../../providers/push/push';
import { StorageProvider } from '../../providers/storage/storage';
import { AnalyticsProvider } from '../../providers/analytics/analytics';

@Component({
  selector: 'page-team',
  templateUrl: 'team.html'
})
export class TeamPage {
  users: Observable<any[]>;

  constructor(public navCtrl: NavController, public fb: FirebaseProvider, 
    public actionSheetCtrl: ActionSheetController, public alertCtrl: AlertController, 
    public push: PushProvider, public storage: StorageProvider,
    public toastCtrl: ToastController, public analytics: AnalyticsProvider) {}
  
  ionViewDidLoad() {
    this.analytics.setScreen('Team');
    this.users = this.fb.getAllUsers('status').snapshotChanges().map(actions => {
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
    if (user.status != 3) {
      this.alertCtrl.create({
        title: 'Anstupsen',
        inputs: [
          {
            name: 'message',
            placeholder: 'Optionale Nachricht'
          },
        ],
        buttons: [
          {
            text: 'Abbrechen',
            role: 'cancel'
          },
          {
            text: 'Anstupsen',
            handler: data => {
              this.storage.getStorageUid().then(uid => {
                // console.log(uid);
                this.fb.getUserByUid(uid).then(sender => {
                  // console.log('data 1');
                  this.fb.newPoke(uid, user.$key, data.message);
                  this.push.push(user.$key, (sender as any).username, data.message);
                  this.analytics.logEvent('poke_user', user.$key);
                }).catch(data => {
                  // console.log('data 2');
                });
              });
            }
          }
        ]
      }).present();
    } else {
      this.toastCtrl.create({
        message: 'Kollegen in diesem Status können nicht angestupst werden.',
        position: 'bottom',
        duration: 3000
      }).present();
    }
  }

  goProfile(user) {
    this.navCtrl.push(ProfilePage, {user: user});
  }

}
