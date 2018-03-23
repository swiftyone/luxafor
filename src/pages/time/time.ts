import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { StorageProvider } from '../../providers/storage/storage';
import { AnalyticsProvider } from '../../providers/analytics/analytics';

@Component({
  selector: 'page-time',
  templateUrl: 'time.html'
})
export class TimePage {
  statusTimes: any;
  activeColor: number;
  constructor(public navCtrl: NavController, public af: AngularFireDatabase, 
    public fb: FirebaseProvider, public storage: StorageProvider,
    public analytics: AnalyticsProvider) {}

  ionViewWillEnter() {
    this.storage.getStorageActiveColor().then(num => {
      this.activeColor = num;
    });
  }

  test() {
    console.log('test');
  }

  ionViewDidLoad() {
    this.analytics.setScreen('Zeiten');
    this.getTimes().then(data => {
      this.statusTimes = data;
    });
    setInterval(function() {
      this.statusTimes[this.activeColor] += 1;
    }.bind(this), 1000);
  }

  getTimes(): Promise<any> {
    return this.storage.getStorageUid().then(uid => {
      let statusTimes = [0, 0, 0, 0, 0, 0, 0, 0];
      let now = +new Date();
      let today = +new Date().setHours(0,0,0,0);
      let eight = +new Date().setHours(8,0,0,0);
      return new Promise(resolve => {
        let observer = this.af.object(`status/${uid}/${today}`).valueChanges().subscribe(data => {
          try {
            let times = Object.keys(data).filter(time => +time > eight);
            let prev = times.shift();
            for (let time of times) {
              let diff = Number(time) - Number(prev);
              statusTimes[data[prev]] += Math.round(diff / 1000);
              prev = time;
            }
            let diff = now - Number(prev);
            statusTimes[data[prev]] += Math.round(diff / 1000);
            resolve(statusTimes);
          } catch (err) {
            this.activeColor = null;
            resolve(statusTimes);
          }
          observer.unsubscribe();
        });
      });
    });
  }
}
