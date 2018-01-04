import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { LuxaforProvider } from '../../providers/luxafor/luxafor';

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
  colors = [{
    id: 'white',
    rgb: [true, true, true]
  },{
    id: 'green',
    rgb: [false, true, false]
  },{
    id: 'yellow',
    rgb: [true, true, false]
  },{
    id: 'red',
    rgb: [true, false, false]
  },{
    id: 'purple',
    rgb: [true, false, true]
  },{
    id: 'blue',
    rgb: [false, false, true]
  },{
    id: 'cyan',
    rgb: [false, true, true]
  },{
    id: 'none',
    rgb: [false, false, false]
  }]
  constructor(public navCtrl: NavController, private luxaforProvider: LuxaforProvider) {
    // set luxname
    this.luxaforProvider.getLuxname().then((name) => {
      this.luxname = name;
    }).catch((err) => {
      this.luxaforProvider.showToast(err);
    });
    // set buttoncolor, check bluetooth, check connection
    this.luxaforProvider.checkBluetooth().then(() => {
      this.luxaforProvider.isConnected().then(() => {
        this.connectTitle = 'Disconnect';
        this.connectColor = '#32db64';
      }).catch(() => {
        this.connectTitle = 'Connect';
        this.connectColor = '#488aff';
      });
    }).catch(() => {
      this.connectTitle = 'Enable Bluetooth';
      this.connectColor = '#f53d3d';
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

  setColor(rgb, colorid) {
    this.rgb = rgb;
    this.luxaforProvider.setColor(rgb, this.brightness).then(() => {
      this.activeColor = colorid;
    }).catch(() => {
      this.activeColor = null;
    });
  }

  changeBrightness() {
    this.luxaforProvider.setColor(this.rgb, this.brightness);
  }
}
