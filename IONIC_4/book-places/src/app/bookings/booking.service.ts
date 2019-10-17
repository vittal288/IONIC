import { Injectable } from '@angular/core';
import { Booking } from './booking.model';

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private _bookings: Booking[] = [
        {
            id: 'asd',
            placeId: 'p1',
            placeTitle: 'Manhatton Mansion',
            guestNumber: 2,
            userId: 'abc',

        }
    ];

    get bookings() {
        return [...this._bookings];
    }

}