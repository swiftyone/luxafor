import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { LuxaforProvider } from '../../providers/luxafor/luxafor';
import { FirebaseProvider } from '../../providers/firebase/firebase';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  user: Object;
  gantts = [];
  noDataYet: string = null;
  constructor(public navCtrl: NavController, public navParams: NavParams, public af: AngularFireDatabase, public luxafor: LuxaforProvider, public fb: FirebaseProvider) {
    this.user = navParams.get('user');
  }
  
  ionViewDidLoad() {
    this.fb.getGantt((this.user as any).$key).then(data => {
      this.gantts = data;
    }).catch(data => {
      this.noDataYet = data;
    });
  }

  showTime(time) {
    this.luxafor.showToast('Status gesetzt um ' + time + ' Uhr.');
  }

}
