import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { LuxaforProvider } from '../../providers/luxafor/luxafor';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  user: Object;
  gantts = [];
  data: any;
  noDataYet: string = null;
  constructor(public navCtrl: NavController, public navParams: NavParams, public af: AngularFireDatabase, public luxafor: LuxaforProvider) {
    this.user = navParams.get('user');
    af.object(`status/${(this.user as any).$key}`).valueChanges().subscribe(data => {
      this.data = data;
      try {
        for (let key of Object.keys(data).reverse()) {
          let datum = key.split('-');
          let prev = Number(new Date(Number(datum[2]), Number(datum[1]), Number(datum[0]), 8, 0, 0));
          let last = Number(new Date(Number(datum[2]), Number(datum[1]), Number(datum[0]), 20, 0, 0));
          let blocks = [];
          Object.keys(data[key]).forEach((time, index) => {
            if (Number(time) >= Number(prev) && Number(time) <= Number(last)) {
              blocks.push(this.calculateBlock(key, time, prev, index));
              prev = Number(time);
            }
          });
          blocks.push(this.calculateBlock(key, last, prev));
          this.gantts.push({
            blocks: blocks,
            datum: key
          });
        }
      } catch (err) {
        this.noDataYet = "Keine Daten erfasst bisher."
      }
    });
  }

  calculateBlock(key, time, prev, index?) {
    let width = (Number(time) - prev) / 43200000;
    let showTime = new Date(Number(prev))
    let minute = String(showTime.getMinutes());
    let minuteStr = minute.length == 1 ? 0 + minute : minute;
    return {
      width: width * 100 + '%',
      status: index == 0 ? 7 : this.data[key][prev],
      time: showTime.getHours() + ":" + minuteStr
    }
  }

  showTime(time) {
    this.luxafor.showToast(time);
  }

}
