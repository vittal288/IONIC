import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { Place } from '../../places/places.model';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {
  @ViewChild('f') bookingForm: NgForm;
  @Input() selectedPlace: Place;
  @Input() selectedMode: 'select' | 'random';
  startDate: string;
  endDate: string;
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    const availableFrom = new Date(this.selectedPlace.availableFrom);
    const availableTo = new Date(this.selectedPlace.availableTo);

    if (this.selectedMode === 'random') {
      // generating starting date for the random period 
      // deduct 1 week in terms of mili seconds
      this.startDate = new Date(availableFrom.getTime()
        + Math.random()
        * (availableFrom.getTime()
          - 7 * 24 * 60 * 60 * 1000
          - availableFrom.getTime())).toISOString();

      this.endDate = new Date(new Date(this.startDate).getTime() +
        Math.random() * (new Date(this.startDate).getTime()
          + 6 * 24 * 60 * 60 * 1000 - new Date(this.startDate).getTime())).toISOString();
    }
  }

  onBookHandler() {
    if(!this.bookingForm.valid || !this.dateValidate()){
      return;
    }
    this.modalCtrl.dismiss({ bookingData: {
      firstName : this.bookingForm.value['first-name'],
      lastName : this.bookingForm.value['last-name'],
      guestNumber : this.bookingForm.value['guest-number'],
      startDate : this.bookingForm.value['date-from'],
      endDate : this.bookingForm.value['date-to']
    } }, 'confirm');
  }

  onCancelBooking() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  dateValidate() {
    const startDate = new Date(this.bookingForm.value['date-from']);
    const endDate = new Date(this.bookingForm.value['date-to']);
    return endDate > startDate;
  }

}
