import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { SettingsPage } from '../settings/settings';
import { LuxaforProvider } from '../../providers/luxafor/luxafor';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { PushProvider } from '../../providers/push/push';
import { StorageProvider } from '../../providers/storage/storage';
import { Gantts } from '../../app/interfaces';
import { Colors } from '../../app/colors';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'page-luxafor',
    templateUrl: 'luxafor.html'
})
export class LuxaforPage {
  connectColor: string = '#444';
  brightness: number = 128;
  activeColor: number;
  rgb: Array<boolean> = [true, true, true];
  showColors = new Array();
  gantts: Gantts;
  ganttBool: boolean = false;
  interval: number;
  onOpen: Subscription;
  dbStatusChange: Subscription;
  constructor(public navCtrl: NavController, public storage: StorageProvider, 
    private luxaforProvider: LuxaforProvider, public fb: FirebaseProvider, 
    public af: AngularFireDatabase, public analytics: AnalyticsProvider, 
    public push: PushProvider, public plt: Platform) {}

  ionViewWillEnter() {
    // get showColors
    this.luxaforProvider.getShowColors().then(data => {
      if (data != null) {
        if (data.every(elem => {return elem == false})) {
          this.showColors = [true, true, true, true, true, true, true, true];
        } else {
          this.showColors = data;
        }
      }
      else
        this.showColors = [true, true, true, true, true, true, true, true];
    });

    // check bluetooth and connection
    this.luxaforProvider.checkBluetooth().then(() => {
      this.luxaforProvider.isConnected().then(() => {
        this.resetLight();
        this.connectColor = Colors.green;
      }).catch(() => {
        this.connectColor = Colors.orange;
      });
    }).catch(() => {
      this.connectColor = Colors.red;
    });
  }

  ionViewDidLoad() {
    // set Screen for Analytics
    this.analytics.setScreen('Luxafor');

    this.updateGantt();

    // change status via DB
    this.storage.getStorageUid().then(uid => {
      this.dbStatusChange = this.af.object(`users/${uid}/status`).valueChanges().subscribe((status: number) => {
        this.activeColor = status;
        this.storage.setStorageActiveColor(status);
        this.luxaforProvider.setColor(status, this.brightness).catch(() => {});
      });
    });

    this.onOpen = this.push.whenPush().subscribe(data => {
      this.navCtrl.parent.select(3);
    });

  }

  // check bluetooth, check connection
  connect() {
    this.luxaforProvider.checkBluetooth().then(() => {
      this.luxaforProvider.getLuxname().then(name => {
        this.luxaforProvider.isConnected().then(() => {
          this.resetLight();
          this.connectColor = Colors.green;
        }).catch(() => {
          this.connectColor = Colors.blue;
          this.luxaforProvider.connectLuxafor(name).then(() => {
            this.resetLight();
            this.connectColor = Colors.green;
          }).catch(() => {
            this.connectColor = Colors.orange;
          });
        });
      }).catch(err => {
        this.luxaforProvider.showToast('Bitte über Einstellungen verbinden.');
      });
    }).catch(() => {
      this.connectColor = Colors.red;
    });
  }

  setColor(index) {
    if (index != this.activeColor) {
      this.fb.updateStatus(index).then(() => {
        this.analytics.logEvent('color_set', String(index));
        // this.activeColor = index;
        if (!this.ganttBool)
          this.updateGantt();
      }).catch((data) => {
        this.activeColor = null;
        this.luxaforProvider.showToast('Bitte neu anmelden.');
      });
    }
    // this.luxaforProvider.setColor(index, this.brightness).catch(()=>{});
  }

  changeBrightness() {
    this.luxaforProvider.setColor(this.activeColor, this.brightness).catch(()=>{});
  }

  showTime(time) {
    this.luxaforProvider.showToast('Status gesetzt um ' + time + ' Uhr.');
  }

  goSettings() {
    this.navCtrl.push(SettingsPage, {
      interval: this.interval,
      dbStatusChange: this.dbStatusChange,
      onOpen: this.onOpen
    });
  }

  updateGantt() {
    this.storage.getStorageUid().then(uid => {
      let today = +new Date().setHours(0,0,0,0);
      this.fb.getGantt(uid, today).subscribe((data:Gantts) => {
        this.gantts = data;
        if (data[0])
          this.ganttBool = true;
      }, data => {
        this.ganttBool = false;
      });
    });
  }

  resetLight() {
    if (this.interval == undefined) {
      this.interval = setInterval(() => {
        if (this.activeColor && this.brightness) {
          this.luxaforProvider.setColor(this.activeColor, this.brightness).then(data => {
            console.log(data);
          }).catch(data => {
            console.log(data);
          });
        }
      }, 5000);
    }
  }

}
