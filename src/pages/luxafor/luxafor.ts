import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { LuxaforProvider } from '../../providers/luxafor/luxafor';
import { SettingsPage } from '../settings/settings';
import { FirebaseProvider } from '../../providers/firebase/firebase';

@Component({
    selector: 'page-luxafor',
    templateUrl: 'luxafor.html'
})
export class LuxaforPage {
  devices = new Array;
  connectColor: string = '#555';
  connectTitle: string = 'Connect';
  luxname: string;
  brightness: number = 128;
  activeColor: string;
  rgb: Array<boolean> = [true, true, true];
  error: string;

  constructor(public navCtrl: NavController, private luxaforProvider: LuxaforProvider, public fb: FirebaseProvider) {
    // set luxname
    this.luxaforProvider.getLuxname().then((name) => {
      this.luxname = name;
    }).catch((err) => {
      this.luxaforProvider.showToast(err);
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
      this.activeColor = index;
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

  

}
