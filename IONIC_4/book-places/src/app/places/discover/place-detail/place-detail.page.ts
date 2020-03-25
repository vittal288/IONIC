import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ModalController, ActionSheetController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';


import { PlacesService } from '../../places.service';
import { Place } from '../../places.model';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { BookingService } from '../../../bookings/booking.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  placeSub: Subscription;
  isBookable = false;

  constructor(private navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    private placeService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheetCntrl: ActionSheetController,
    private readonly bookingService: BookingService,
    private readonly loadingCtrl: LoadingController,
    private readonly authService : AuthService) {
    //
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack(`/places/tabs/discover`);
        return;
      }
      this.placeSub = this.placeService.getPlace(paramMap.get('placeId')).subscribe((place) => {
        this.place = place;
        this.isBookable = place.userId !== this.authService.userId;
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

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }

}
