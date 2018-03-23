import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { LoginPage } from '../login/login';
import { LuxaforProvider } from '../../providers/luxafor/luxafor';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { StorageProvider } from '../../providers/storage/storage';
import { User } from '../../app/interfaces';
import md5 from 'crypto-md5';
import { PushProvider } from '../../providers/push/push';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { Colors } from '../../app/colors';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  user: User;
  username: string = '';
  connectColor: string = Colors.blue;
  connectTitle: string = 'Verbinden';
  luxname: string;
  constructor(public navCtrl: NavController, public storage: StorageProvider, 
    private alertCtrl: AlertController, public navParams: NavParams, 
    public angularFireAuth: AngularFireAuth, public luxafor: LuxaforProvider, 
    public fb: FirebaseProvider, public push: PushProvider,
    public analytics: AnalyticsProvider) {}

  ionViewDidLoad() {
    this.analytics.setScreen('Settings');

    this.storage.getStorageUid().then(uid => {
      this.fb.getUserByUid(uid).then((data:User) => {
        this.user = data;
      }).catch(data => console.log(data));
    });

    this.luxafor.getLuxname().then((name) => {
      this.luxname = name;
    }).catch((err) => {
      this.luxafor.showToast(err);
    });

    this.luxafor.isConnected().then(() => {
      this.connectTitle = 'Verbindung trennen';
      this.connectColor = Colors.green;
    }).catch(() => {
      this.connectTitle = 'Verbinden';
      this.connectColor = Colors.blue;
    });
  }

  connect() {
    this.luxafor.checkBluetooth().then(() => {
      this.connectColor = Colors.blue;
      this.connectTitle = 'Verbinden...';
      this.luxafor.isConnected().then(() => {
        this.luxafor.disconnectLuxafor().then(() => {
          this.connectTitle = 'Verbinden';
          this.connectColor = Colors.blue;
        }).catch(() => {
          this.connectTitle = 'Verbindung trennen';
          this.connectColor = Colors.green;
        });
      }).catch(() => {
        this.luxafor.getLuxname().then(name => {
          if (name != this.luxname)
            this.luxafor.setLuxname(this.luxname);
          this.luxafor.connectLuxafor(this.luxname).then(data => {
            this.connectTitle = 'Verbindung trennen';
            this.connectColor = Colors.green;
          }).catch(() => {
            this.connectTitle = 'Verbinden';
            this.connectColor = Colors.orange;
          });
        });
      });
    }).catch(() => {
      this.connectTitle = 'Bluetooth deaktiviert';
      this.connectColor = Colors.red;
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
        this.luxafor.storeShowColors(result);
      }
    });
    this.luxafor.getShowColors().then(data => {
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
      this.luxafor.showToast('Name geändert zu ' + username);
    }).catch(() => {
      this.luxafor.showToast('Da ging was schief...');
    });
  }

  changePassword(passOld, passNew, passRepeat) {
    if (passNew == passRepeat) {
      this.angularFireAuth.auth.signInWithEmailAndPassword(this.angularFireAuth.auth.currentUser.email, passOld).then(() => {
        this.angularFireAuth.auth.currentUser.updatePassword(passNew).then(() => {
          this.luxafor.showToast("Passwort geändert");
        }).catch(data => {
          this.luxafor.showToast(data);
        });
      }).catch(() => {
        this.luxafor.showToast('Altes Passwort ist falsch');
      });
    } else {
      this.luxafor.showToast("Passwörter stimmen nicht über ein");
    }
  }

  logout() {
    this.angularFireAuth.auth.signOut().then(() => {
      clearInterval(this.navParams.get('interval'));
      let onOpen = this.navParams.get('onOpen');
      let dbStatusChange = this.navParams.get('dbStatusChange');
      if (onOpen != undefined)
        onOpen.unsubscribe();
      if (dbStatusChange != undefined)
        dbStatusChange.unsubscribe();
      if (this.fb.subscription != undefined)
        this.fb.subscription.unsubscribe();
      if (this.push.tokenRefresher != undefined)
        this.push.tokenRefresher.unsubscribe();
      this.push.unregister();
      this.navCtrl.parent.parent.setRoot(LoginPage);
    })
  }
}
