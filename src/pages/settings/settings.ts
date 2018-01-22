import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { LoginPage } from '../login/login';
import { LuxaforProvider } from '../../providers/luxafor/luxafor';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import md5 from 'crypto-md5';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  username: string = '';
  user: Object;
  constructor(public navCtrl: NavController, public navParams: NavParams, public angularFireAuth: AngularFireAuth, public luxafor: LuxaforProvider, public fb: FirebaseProvider) {
    fb.getCurrentAuthUser().then(user => {
      this.user = user;
      fb.getUserByUid((user as any).uid).then(data => {
        this.username = (data as any).username;
      });
    });
  }

  changeUsername(username) {
    this.fb.changeUsername(username).then(() => {
      this.luxafor.showToast('Username changed to ' + username);
    }).catch(() => {
      this.luxafor.showToast('An error occured');
    });
  }

  changePassword(pass, passRepeat) {
    if (pass == passRepeat) {
      this.angularFireAuth.auth.currentUser.updatePassword(pass).then(() => {
        this.luxafor.showToast("Password changed");
      }).catch(data => {
        this.luxafor.showToast(data);
      });
    } else {
      this.luxafor.showToast("Passwords didn't match.");
    }
  }

  logout() {
    this.angularFireAuth.auth.signOut().then(() => {
      this.navCtrl.parent.parent.setRoot(LoginPage);
    })
  }
}
