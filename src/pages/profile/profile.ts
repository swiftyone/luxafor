import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { LuxaforProvider } from '../../providers/luxafor/luxafor';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { User, Gantts } from '../../app/interfaces';
import { AnalyticsProvider } from '../../providers/analytics/analytics';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  user: Object;
  gantts: Gantts;
  noDataYet: string = null;
  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public af: AngularFireDatabase, public luxafor: LuxaforProvider, 
    public fb: FirebaseProvider, public analytics: AnalyticsProvider) {
    this.user = navParams.get('user');
  }
  
  ionViewDidLoad() {
    this.analytics.setScreen('Profile');
    this.fb.getGantt((this.user as any).$key).subscribe((data:Gantts) => {
      this.gantts = data;
    }, data => {
      this.noDataYet = data;
    });
  }

  showTime(time) {
    this.luxafor.showToast('Status gesetzt um ' + time + ' Uhr.');
  }

}
