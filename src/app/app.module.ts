import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';

import { LuxaforPage } from '../pages/luxafor/luxafor';
import { TimePage } from '../pages/time/time';
import { TeamPage } from '../pages/team/team';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { ProfilePage } from '../pages/profile/profile';
import { SettingsPage } from '../pages/settings/settings';
import { BLE } from '@ionic-native/ble';
import { IonicStorageModule } from '@ionic/storage';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LuxaforProvider } from '../providers/luxafor/luxafor';
import { FirebaseProvider } from '../providers/firebase/firebase';
import { GravatarPipe } from './pipes/gravatarPipe';
import { DatumPipe } from './pipes/datumPipe';

@NgModule({
  declarations: [
    MyApp,
    LuxaforPage,
    TimePage,
    TeamPage,
    TabsPage,
    LoginPage,
    SettingsPage,
    GravatarPipe,
    DatumPipe,
    ProfilePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      tabsHideOnSubPages: true,
    }),
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp({
      apiKey: "AIzaSyBQLhpVgOofkInfYFzWp8Bhw8D9VP5Fx-E",
      authDomain: "saspb-e171a.firebaseapp.com",
      databaseURL: "https://saspb-e171a.firebaseio.com",
      projectId: "saspb-e171a",
      storageBucket: "",
      messagingSenderId: "219493189123"
    }),
    AngularFireAuthModule,
    AngularFireDatabaseModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LuxaforPage,
    TimePage,
    TeamPage,
    TabsPage,
    LoginPage,
    SettingsPage,
    ProfilePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    BLE,
    LuxaforProvider,
    FirebaseProvider
  ]
})
export class AppModule {}
