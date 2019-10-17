import { Component, OnInit } from '@angular/core';
import { IonItemSliding } from '@ionic/angular';


import { BookingService } from './booking.service';
import { Booking } from './booking.model';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit {
  loadedBookings: Booking[] = [];
  constructor(private bookingService: BookingService) { }

  ngOnInit() {
    this.loadedBookings = this.bookingService.bookings;
  }

  onItemCancel(offerId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    console.log(offerId);
    // cancel the booking with offerId
  }

}
