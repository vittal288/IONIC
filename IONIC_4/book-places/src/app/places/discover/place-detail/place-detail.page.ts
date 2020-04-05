import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ModalController, ActionSheetController, LoadingController, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';


import { PlacesService } from '../../places.service';
import { Place } from '../../places.model';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { BookingService } from '../../../bookings/booking.service';
import { AuthService } from '../../../auth/auth.service';
import { MapModalComponent } from '../../../shared/map-modal/map-modal.component';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  // place: Place;
  place: any;
  placeSub: Subscription;
  isBookable = false;
  isLoading = false;

  constructor(private navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    private placeService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheetCntrl: ActionSheetController,
    private readonly bookingService: BookingService,
    private readonly loadingCtrl: LoadingController,
    private readonly authService: AuthService,
    private readonly alertCtrl: AlertController,
    private readonly router: Router
  ) {
    //
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack(`/places/tabs/discover`);
        return;
      }
      this.isLoading = true;
      this.placeSub = this.placeService
        .getPlace(paramMap.get('placeId'))
        .subscribe((place) => {
          this.place = { ...place, id: paramMap.get('placeId') };
          this.isBookable = place.userId !== this.authService.userId;
          this.isLoading = false;
        }, error => {
          this.alertCtrl.create({
            header: 'Error',
            message: 'Could not able fetch the place, please try again later',
            buttons: [{
              text: ' Okay',
              handler: () => {
                this.router.navigate(['/places/tabs/discover'])
              }
            }]
          }).then((alertEl) => {
            alertEl.present();
          })
        });
    });
  }

  onBookPlaceHandler() {
    this.actionSheetCntrl.create({
      header: 'Choose An Action',
      buttons: [
        {
          text: 'Select Date',
          handler: () => {
            this.openBookingModel('select');
          }
        },
        {
          text: 'Random Date',
          handler: () => {
            this.openBookingModel('random');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then((actionSheetEl) => {
      actionSheetEl.present();
    });
  }

  openBookingModel(mode: 'select' | 'random') {
    console.log('Model', mode);
    this.modalCtrl.create({
      component: CreateBookingComponent,
      componentProps: { selectedPlace: this.place, selectedMode: mode }
    }).then(modalEl => {
      modalEl.present();
      return modalEl.onDidDismiss();
    }).
      then((resultData) => {
        console.log('Submitted Data', resultData);
        if (resultData.role === 'confirm') {
          this.loadingCtrl.create({
            message: 'Booking place...'
          }).then((loadingEl) => {
            loadingEl.present();
            const data = resultData.data.bookingData;
            this.bookingService.addBooking(
              this.place.id,
              this.place.imageUrl,
              this.place.title,
              data.firstName,
              data.lastName,
              data.guestNumber,
              data.startDate,
              data.endDate).subscribe(() => {
                loadingEl.dismiss();
              });
          });
        }

        if (resultData.role === 'cancel') {

        }
      });
  }

  onOpenMapLocation() {
    this.modalCtrl.create({
      component: MapModalComponent,
      componentProps :{
        center : {
          lat : this.place.location.lat,
          lng : this.place.location.lng
        },
        selectable : false,
        closeButtonText : 'Close',
        title : this.place.location.address

      }
    }).then((modalEl) => {
      modalEl.present();
    })
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }

}
