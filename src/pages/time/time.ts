import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseProvider } from '../../providers/firebase/firebase';

@Component({
  selector: 'page-time',
  templateUrl: 'time.html'
})
export class TimePage {
  statusTimes: any;
  activeColor: number;
  constructor(public navCtrl: NavController, public af: AngularFireDatabase, public fb: FirebaseProvider) {}

  ionViewWillEnter() {
    this.fb.getStorageActiveColor().then(num => {
      this.activeColor = num;
    });
  }

  ionViewDidLoad() {
    this.getTimes().then(data => {
      this.statusTimes = data;
    });
    setInterval(function() {
      this.statusTimes[this.activeColor] += 1;
    }.bind(this), 1000);
  }
  
  getTimes(): Promise<any> {
    return this.fb.getStorageUid().then(uid => {
      let statusTimes = [0, 0, 0, 0, 0, 0, 0, 0];
      let now = new Date();
      let yyyy = now.getFullYear();
      let mm = now.getMonth();
      let dd = now.getDate();
      return new Promise(resolve => {
        let observer = this.af.object(`status/${uid}/${yyyy}-${mm}-${dd}`).valueChanges().subscribe(data => {
          try {
            let times = Object.keys(data);
            let prev = times.shift();
            for (let time of times) {
              let diff = Number(time) - Number(prev);
              statusTimes[data[prev]] += Math.round(diff / 1000);
              prev = time;
            }
            let diff = Number(now) - Number(prev);
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
