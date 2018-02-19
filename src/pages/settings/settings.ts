import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
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
  connectColor: string = '#488aff';
  connectTitle: string = 'Verbinden';
  luxname: string;
  constructor(public navCtrl: NavController, private luxaforProvider: LuxaforProvider, private alertCtrl: AlertController, public navParams: NavParams, public angularFireAuth: AngularFireAuth, public luxafor: LuxaforProvider, public fb: FirebaseProvider) {
    fb.getCurrentAuthUser().then(user => {
      this.user = user;
      fb.getUserByUid((user as any).uid).then(data => {
        this.username = (data as any).username;
      });
    });

    this.luxaforProvider.getLuxname().then((name) => {
      this.luxname = name;
    }).catch((err) => {
      this.luxaforProvider.showToast(err);
    });

    this.luxaforProvider.isConnected().then(() => {
      this.connectTitle = 'Disconnect';
      this.connectColor = '#32db64';
    }).catch(() => {
      this.connectTitle = 'Verbinden';
      this.connectColor = '#488aff';
    });
  }

  connect() {
    this.luxaforProvider.checkBluetooth().then(() => {
      this.connectColor = '#488aff';
    }).catch(() => {
      this.connectColor = '#f53d3d';
      return null;
    });

    this.luxaforProvider.isConnected().then(() => {
      this.luxaforProvider.disconnectLuxafor().then(() => {
        this.connectTitle = 'Connect';
        this.connectColor = '#488aff';
      }).catch(() => {
        this.connectTitle = 'Disconnect';
        this.connectColor = '#32db64';
      });
    }).catch(() => {
      this.luxaforProvider.getLuxname().then(name => {
        if (name != this.luxname)
          this.luxaforProvider.setLuxname(this.luxname);
        this.luxaforProvider.connectLuxafor(this.luxname).then(() => {
          this.connectTitle = 'Disconnect';
          this.connectColor = '#32db64';
        }).catch(() => {
          this.connectTitle = 'Connect';
          this.connectColor = '#f53d3d';
        });
      })
    });
  }

  setColors() {
    let colors = ['Weiß', 'Grün', 'Gelb', 'Rot', 'Lila', 'Blau', 'Türkis', 'Schwarz'];
    let alert = this.alertCtrl.create();
    alert.setTitle('Status auswählen');
    alert.addButton({
      text: 'Abbrechen',
      role: 'cancel'
    });
    alert.addButton({
      text: 'Okay',
      handler: data => {
        let result = [false, false, false, false, false, false, false, false];
        data.forEach(element => {
          result[+element] = true;
        });
        this.luxaforProvider.storeShowColors(result);
      }
    });
    this.luxaforProvider.getShowColors().then(data => {
      colors.forEach((color, index) => {
        alert.addInput({
          type: 'checkbox',
          label: color,
          value: '' + index,
          checked: data != null ? data[index] : false
        });
      });
      alert.present();
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
