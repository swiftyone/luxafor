import { Component } from '@angular/core';
import { Platform, LoadingController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { AngularFireAuth } from 'angularfire2/auth';
import { FirebaseProvider } from '../providers/firebase/firebase';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, 
    public angularFireAuth: AngularFireAuth, private fb: FirebaseProvider) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

  ngAfterContentInit() {
    let auth = this.angularFireAuth.authState.subscribe(user => {
      try {
        if (user.emailVerified) {
          this.fb.userExists(user.uid).then(exists => {
            if (exists)
              this.rootPage = TabsPage;
            else
              this.rootPage = LoginPage;
          });
        } else {
          this.rootPage = LoginPage;
        }
      } catch (err) {
        this.rootPage = LoginPage;
      }
      auth.unsubscribe();
    });
  }

}
