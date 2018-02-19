import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { LuxaforProvider } from '../../providers/luxafor/luxafor';
import { SettingsPage } from '../settings/settings';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { AngularFireDatabase } from 'angularfire2/database';
import { Firebase } from '@ionic-native/firebase';
import { Platform } from 'ionic-angular';

@Component({
    selector: 'page-luxafor',
    templateUrl: 'luxafor.html'
})
export class LuxaforPage {
  connectColor: string = '#444';
  brightness: number = 128;
  activeColor: number;
  rgb: Array<boolean> = [true, true, true];
  luxname: string;
  spinner: boolean = false;
  showColors = new Array();
  gantts = [];
  noDataYet: string = null;
  constructor(public navCtrl: NavController, private luxaforProvider: LuxaforProvider, public fb: FirebaseProvider, public af: AngularFireDatabase, private fbap: Firebase, public plt: Platform) {
    /*
     * ANALYTICS
    */
    // this.plt.ready().then(() => {
    //   console.log('ready');
    //   // set Screen
    //   this.fbap.setScreenName('Luxafor').then((res) => {
    //     console.log('test 1');
    //   }).catch((error) => {
    //     console.error(error);
    //   });
    //   // log view event
    //   this.fbap.logEvent('page_view', {page: "luxafor"}).then((res) => {
    //     console.log('test 2');
    //   }).catch((error) => {
    //     console.error(error);
    //   });
    //   this.fbap.getToken().then(token => {
    //     console.log(token);
    //   });
    //   this.fbap.hasPermission().then((res) => {
    //     console.log(res);

    //   }).catch(err => {
    //     this.fbap.grantPermission().then((res) => {
    //       console.log(res);
    //     }).catch((err) => {
    //       console.log(err);
    //     })
    //   })
    // });
  }

  ionViewWillEnter() {
    // get showColors
    this.luxaforProvider.getShowColors().then(data => {
      if (data != null)
        this.showColors = data;
      else
        this.showColors = [true, true, true, true, true, true, true, true];
    });

    // connect
    this.luxaforProvider.checkBluetooth().then(() => {
      this.luxaforProvider.isConnected().then(() => {
        this.connectColor = '#32db64';
      }).catch(() => {
        this.luxaforProvider.showToast(this.luxname);
        this.luxaforProvider.connectLuxafor(this.luxname).then(() => {
          this.connectColor = '#32db64';
        }).catch(() => {
          this.connectColor = '#e2731d';
        });
      });
    }).catch(() => {
      this.connectColor = '#f53d3d';
    });
  }

  ionViewDidLoad() {
    // get luxaforname
    this.luxaforProvider.getLuxname().then((name) => {
      this.luxname = name;
    }).catch((err) => {
      this.luxaforProvider.showToast(err);
    });
    
    // get last active Color
    this.fb.getStorageActiveColor().then(num => {
      this.activeColor = num;
    });

    this.updateGantt();

    // observer db status
    // this.fb.getStorageUid().then(uid => {
    //   if (uid != null) {
    //     this.af.object(`users/${uid}`).valueChanges().subscribe(data => {
    //       let status = (data as any).status;
    //       this.fb.updateStatus(status).then(() => {
    //         this.fb.setStorageActiveColor(status).then(()=> {
    //           this.activeColor = status;
    //         });
    //       }).catch(() => {
    //         this.activeColor = null;
    //       });
    //       this.luxaforProvider.setColor(status, this.brightness).catch(() => {});
    //     });
    //   }
    // });

    setInterval(() => {
      if (this.activeColor && this.brightness)
        this.luxaforProvider.setColor(this.activeColor, this.brightness).catch(()=>{});
    }, 30000);
  }

  // check bluetooth, check connection
  connect() {
    this.luxaforProvider.checkBluetooth().then(() => {
      this.luxaforProvider.isConnected().then(() => {
        this.connectColor = '#32db64';
      }).catch(() => {
        this.spinner = true;
        this.luxaforProvider.connectLuxafor(this.luxname).then(() => {
          this.connectColor = '#32db64';
          this.spinner = false;
        }).catch(() => {
          this.connectColor = '#e2731d';
          this.spinner = false;
        });
      });
    }).catch(() => {
      this.connectColor = '#f53d3d';
    });
  }

  setColor(index) {
    if (index != this.activeColor) {
      this.fb.updateStatus(index).then(() => {
        this.updateGantt();
        this.fb.setStorageActiveColor(index).then(()=> {
          this.activeColor = index;
        });
      }).catch((data) => {
        this.activeColor = null;
        this.luxaforProvider.showToast('Bitte neu anmelden.');
      });
    }
    this.luxaforProvider.setColor(index, this.brightness).catch(()=>{});
  }

  changeBrightness() {
    this.luxaforProvider.setColor(this.activeColor, this.brightness).catch(()=>{});
  }

  showTime(time) {
    this.luxaforProvider.showToast('Status gesetzt um ' + time + ' Uhr.');
  }

  goSettings() {
    this.navCtrl.push(SettingsPage);
  }

  updateGantt() {
    this.fb.getStorageUid().then(uid => {
      let now = new Date();
      let yyyy = now.getFullYear();
      let mm = now.getMonth();
      let dd = now.getDate();
      this.fb.getGantt(uid, `${yyyy}-${mm}-${dd}`).then(data => {
        this.gantts = data;
      }).catch(data => {
        this.noDataYet = data;
      });
    });
  }
}
