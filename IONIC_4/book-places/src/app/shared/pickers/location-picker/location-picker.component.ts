import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ModalController, ActionSheetController, AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Capacitor, Plugins } from '@capacitor/core';

import { MapModalComponent } from '../../map-modal/map-modal.component';
import { SharedService } from '../../service/shared.service';
import { PlaceLocation, Coordinates } from '../../../places/location.model';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {
  @Output() locationPick = new EventEmitter<PlaceLocation>();
  @Input() showPreview = false;

  selectedLocationImage: string;
  isLoading = false;
  constructor(private readonly modalCtrl: ModalController,
              private readonly http: HttpClient,
              private readonly sharedService: SharedService,
              private readonly actionSheetController: ActionSheetController,
              private readonly alertCtrl: AlertController) { }

  ngOnInit() { }

  onPickLocation() {
    this.actionSheetController.create({
      header: 'Please Choose Location',
      buttons: [
        {
          text: 'Auto-Locate', handler: () => {
            this.locateUser();
          }
        },
        {
          text: 'Pick on Map', handler: () => {
            this.openMap();
          }
        },
        { text: 'Cancel', role: 'cancel' }
      ]
    }).then(actionSheetEl => {
      actionSheetEl.present();
    });
  }

  private openMap() {
    this.modalCtrl.create({
      component: MapModalComponent
    }).then((modalEl) => {
      modalEl.onDidDismiss().then(modalData => {
        if (!modalData.data) {
          return;
        }
        this.isLoading = true;
        const coordinates: Coordinates = {
          lat : modalData.data.lat,
          lng : modalData.data.lng
        };
        this.generateMapSnapShot(coordinates.lat, coordinates.lng);
      });
      modalEl.present();
    });
  }

  private locateUser() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.showErrorAlert('Could Not Fetch Location' , 'Please use Map to locate your location!');
      return;
    } else {
      this.isLoading = true;
      Plugins.Geolocation.getCurrentPosition()
      .then(geoPosition => {
        const coordinates: Coordinates = {
          lat : geoPosition.coords.latitude,
          lng : geoPosition.coords.longitude
        };
        this.generateMapSnapShot(coordinates.lat, coordinates.lng);
      })
      .catch(err => {
        this.showErrorAlert('Could Not Fetch Location' , 'Please use Map to locate your location!');
        this.isLoading = true;
      });
    }
  }

  private showErrorAlert(header, message) {
    this.alertCtrl.create({
      header,
      message,
      buttons : ['OKAY']
    })
    .then(alertEl => {
        alertEl.present();
    });
  }

  private getAddress(lat: number, lng: number) {
    const URL = this.sharedService.getGeoCodingAPIUrl(lat, lng);
    return this.http.get<any>(URL).pipe(
      map(geoData => {
        if (!geoData || !geoData.results || geoData.results.length === 0) {
          return null;
        }
        return geoData.results[0].formatted_address;
      })
    );
  }

  private generateMapSnapShot(lat: number, lng: number) {
    const pickedLocation: PlaceLocation = {
      lat,
      lng,
      address: null,
      staticMapImageUrl: null
    };
    this.getAddress(lat, lng).pipe(
      switchMap(address => {
        pickedLocation.address = address;
        return of(this.sharedService.getMapImage(pickedLocation.lat, pickedLocation.lng, 14));
      })
    ).subscribe(staticMapImageUrl => {
      pickedLocation.staticMapImageUrl = staticMapImageUrl;
      this.selectedLocationImage = staticMapImageUrl;
      this.isLoading = false;
      this.locationPick.emit(pickedLocation);
    });
  }

}
