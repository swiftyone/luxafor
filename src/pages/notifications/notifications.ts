import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { StorageProvider } from '../../providers/storage/storage';
import { PushProvider } from '../../providers/push/push';
import { User, Poke } from '../../app/interfaces';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html',
})
export class NotificationsPage {
  pokes: Array<any>;
  noPokes: boolean;
  subscription: Subscription;
  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public fb: FirebaseProvider, public storage: StorageProvider,
    public push: PushProvider, public analytics: AnalyticsProvider) {}

  ionViewDidLoad() {
    this.updatePokes();
    this.analytics.setScreen('Notifications');
  }

  decline(poke) {
    this.storage.getStorageUid().then(uid => {
      this.fb.deletePoke(poke.pid, uid);
      this.analytics.logEvent('poke_declined', poke.sender);
    });
  }

  respond(poke) {
    this.storage.getStorageUid().then(uid => {
      this.fb.getUserByUid(uid).then((user:User) => {
        this.push.push(poke.sender, user.username, user.username + ' ist jetzt verfügbar.');
        this.fb.newPoke(uid, poke.sender, user.username + ' ist jetzt verfügbar.');
        this.analytics.logEvent('poke_responded', poke.sender);
        this.fb.deletePoke(poke.pid, uid);
      });
    });
  }

  updatePokes() {
    this.storage.getStorageUid().then(uid => {
      this.fb.subscription = this.fb.getPokes(uid).subscribe(data => {
        this.pokes = [];
        if (data.length > 0) {
          data.forEach((poke:Poke) => {
            this.pokes.push({
              user: this.fb.getUserByUidObserver(poke.sender),
              time: poke.time,
              message: poke.message,
              sender: poke.sender,
              pid: poke.pid
            });
          });
          this.noPokes = false;
        } else {
          this.noPokes = true;
        }
      });
    });
  }

}
