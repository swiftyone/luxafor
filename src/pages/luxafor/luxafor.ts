import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { LuxaforProvider } from '../../providers/luxafor/luxafor';
import { SettingsPage } from '../settings/settings';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { AngularFireDatabase } from 'angularfire2/database';
import { Firebase } from '@ionic-native/firebase';
import { Platform } from 'ionic-angular';
import * as config from '../../app/environment/config';

@Component({
    selector: 'page-luxafor',
    templateUrl: 'luxafor.html'
})
export class LuxaforPage {
  statusTimes: any;
  connectColor: string = '#555';
  connectTitle: string = 'Verbinden';
  luxname: string;
  brightness: number = 128;
  activeColor: number;
  rgb: Array<boolean> = [true, true, true];
  error: string;

  constructor(public navCtrl: NavController, private luxaforProvider: LuxaforProvider, public fb: FirebaseProvider, public af: AngularFireDatabase, private fbap: Firebase, public plt: Platform) {
    // get last active Color
    this.fb.getStorageActiveColor().then(num => {
      this.activeColor = num;
    })
    // set luxname
    this.luxaforProvider.getLuxname().then((name) => {
      this.luxname = name;
    }).catch((err) => {
      this.luxaforProvider.showToast(err);
    });
    this.getTimes().then(data => {
      this.statusTimes = data;
      setInterval(function() {
        // console.log(this.statusTimes[5]);
        this.statusTimes[this.activeColor] += 1;
      }.bind(this), 1000);
    });
    // set buttoncolor, check bluetooth, check connection
    // this.luxaforProvider.checkBluetooth().then(() => {
    //   this.luxaforProvider.isConnected().then(() => {
    //     this.connectTitle = 'Disconnect';
    //     this.connectColor = '#32db64';
    //   }).catch(() => {
    //     this.connectTitle = 'Connect';
    //     this.connectColor = '#488aff';
    //   });
    // }).catch(() => {
    //   this.connectTitle = 'Enable Bluetooth';
    //   this.connectColor = '#f53d3d';
    // });
    this.plt.ready().then(() => {
      console.log('ready');
      // set Screen
      this.fbap.setScreenName('Luxafor').then((res) => {
        console.log('test 1');
      }).catch((error) => {
        console.error(error);
      });
      // log view event
      this.fbap.logEvent('page_view', {page: "luxafor"}).then((res) => {
        console.log('test 2');
      }).catch((error) => {
        console.error(error);
      });
      this.fbap.getToken().then(token => {
        console.log(token);
      });
      this.fbap.hasPermission().then((res) => {
        console.log(res);

      }).catch(err => {
        this.fbap.grantPermission().then((res) => {
          console.log(res);
        }).catch((err) => {
          console.log(err);
        })
      })
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

  setColor(index) {
    this.fb.updateStatus(index).then(() => {
      this.fb.setStorageActiveColor(index).then(()=> {
        this.activeColor = index;
      })
    }).catch(() => {
      this.activeColor = null;
    });
    this.luxaforProvider.setColor(index, this.brightness).then(() => {
      this.error = null;      
    }).catch(() => {
      this.error = 'Connect Luxafor Device.';
    });
  }

  changeBrightness() {
    this.luxaforProvider.setColor(this.activeColor, this.brightness).then(() => {
      this.error = null;      
    }).catch(() => {
      this.error = 'Connect Luxafor Device.';
    });
  }

  goSettings() {
    this.navCtrl.push(SettingsPage);
  }

  getTimes(): Promise<any> {
    return this.fb.getCurrentAuthUser().then(user => {
      let statusTimes = [0, 0, 0, 0, 0, 0, 0, 0];
      let now = new Date();
      let yyyy = now.getFullYear();
      let mm = now.getMonth();
      let dd = now.getDate();
      return new Promise(resolve => {
        this.af.object(`status/${(user as any).uid}/${dd}-${mm}-${yyyy}`).valueChanges().subscribe(data => {
          try {
            let times = Object.keys(data);
            let prev = times.shift();
            for(let time of times) {
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
        })
      });
    });
  }

}
