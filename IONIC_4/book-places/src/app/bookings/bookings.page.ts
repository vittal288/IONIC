import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';


import { BookingService } from './booking.service';
import { Booking } from './booking.model';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  loadedBookings: Booking[] = [];
  bookingSub: Subscription;

  constructor(private bookingService: BookingService,
    private readonly loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.loadingCtrl.create({
      message: ' Loading place...'
    }).then((loadingEl) => {
      loadingEl.present();
      this.bookingSub = this.bookingService.bookings.subscribe((bookings) => {
        this.loadedBookings = bookings;
        loadingEl.dismiss();
      });
    });
  }

  onItemCancel(bookingId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.loadingCtrl.create({
      message: 'Cancelling...'
    }).then((loadingEl) => {
      loadingEl.present();
      this.bookingService.cancelBooking(bookingId).subscribe(() => {
        loadingEl.dismiss();
      });
    });
  }

  ngOnDestroy() {
    if (this.bookingSub) {
      this.bookingSub.unsubscribe();
    }
  }

}
