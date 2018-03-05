import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { StorageProvider } from '../../providers/storage/storage';
import { PushProvider } from '../../providers/push/push';
import { Observable } from 'rxjs/Observable';
import { User, Poke } from '../../app/interfaces';

@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html',
})
export class NotificationsPage {
  pokes: Array<any>;
  noPokes: boolean;
  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public fb: FirebaseProvider, public storage: StorageProvider,
    public push: PushProvider) {}

  ionViewDidLoad() {
    this.updatePokes();
  }

  decline(pid) {
    this.storage.getStorageUid().then(uid => {
      this.fb.deletePoke(pid, uid);
    });
  }

  respond(poke) {
    this.storage.getStorageUid().then(uid => {
      this.fb.getUserByUid(uid).then((user:User) => {
        this.push.push(poke.sender, user.username, user.username + ' ist jetzt verfügbar.');
        this.fb.deletePoke(poke.pid, uid);
      });
    });
  }

  updatePokes() {
    this.storage.getStorageUid().then(uid => {
      this.fb.getPokes(uid).snapshotChanges().map(actions => {
        return actions.map(action => {
          return { pid: action.payload.key, ...action.payload.val() };
        });
      }).subscribe(data => {
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
