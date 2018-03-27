import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { ToastController } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import { StorageProvider } from '../../providers/storage/storage';
import { PushProvider } from '../../providers/push/push';
import { AnalyticsProvider } from '../../providers/analytics/analytics';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public angularFireAuth: AngularFireAuth, private toastCtrl: ToastController, 
    public fb: FirebaseProvider, public storage: StorageProvider,
    public push: PushProvider, public analytics: AnalyticsProvider,
    public load: LoadingController) {
    this.analytics.setScreen('Login');
  }

  login(username, password) {
    this.angularFireAuth.auth.signInWithEmailAndPassword(username, password).then((user) => {
      if (user.emailVerified) {
        this.fb.userExists(user.uid).then(exists => {
          if (!exists)
            this.fb.addUserByEmail(user.email, user.uid);
        }).then(()=>{
          this.analytics.setUser(user.uid);
          this.push.grantPermission();
          this.push.getToken(user.uid);
          this.storage.setStorageUid(user.uid);
          this.navCtrl.setRoot(TabsPage);
        });
      } else {
        this.showToast('E-Mail ist nicht verifiziert');
      }
    }).catch(err => {
      this.showToast(err);
    });
  }

  register(email, password, passwordRepeat) {
    this.angularFireAuth.auth.createUserWithEmailAndPassword(email, password).then((res) => {
      this.sendEmailVerification();
    }).catch((err)=> {
      this.showToast(err);
    });
  }

  sendPassword(email) {
    this.angularFireAuth.auth.sendPasswordResetEmail(email).then(() => {
      this.showToast('E-Mail verschickt');
    }).catch(err => {
      this.showToast('E-Mail nicht gefunden');
    })
  }

  sendEmailVerification() {
    let userObservable = this.angularFireAuth.authState.subscribe(user => {
      try {
        user.sendEmailVerification().then(() => {
          this.showToast('Validierungs-E-Mail verschickt');
        });
      } catch(err) {
        this.showToast('Zunäscht registrieren');
      }
      userObservable.unsubscribe();
    }, err => {
      this.showToast(err);
      userObservable.unsubscribe();
    });
  }

  goRegister() {
    document.getElementById('register').style.opacity = '1';
    document.getElementById('register').style.visibility = 'visible';
    document.getElementById('login').style.opacity = '0';
    document.getElementById('login').style.visibility = 'hidden';
  }

  goLogin() {
    document.getElementById('login').style.opacity = '1';
    document.getElementById('login').style.visibility = 'visible';
    document.getElementById('register').style.opacity = '0';
    document.getElementById('register').style.visibility = 'hidden';
    document.getElementById('forgotPassword').style.opacity = '0';
    document.getElementById('forgotPassword').style.visibility = 'hidden';
  }

  goForgotPassword() {
    document.getElementById('forgotPassword').style.opacity = '1';
    document.getElementById('forgotPassword').style.visibility = 'visible';
    document.getElementById('login').style.opacity = '0';
    document.getElementById('login').style.visibility = 'hidden';
  }

  showToast(message) {
    this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    }).present();
  }
}
