import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Booking } from './booking.model';
import { AuthService } from '../auth/auth.service';
import { take, delay, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    constructor(private readonly authService: AuthService) {

    }
    private _bookings = new BehaviorSubject<Booking[]>([]);

    get bookings() {
        return this._bookings.asObservable();
    }

    addBooking(placeId: string,
        placeImg: string,
        placeTitle: string,
        firstName: string,
        lastName: string,
        guestNumber: number,
        dateFrom: Date,
        dateTo: Date) {

        const newBooking = new Booking(Math.random().toString(),
            placeId, this.authService.userId,
            placeTitle,
            placeImg,
            firstName,
            lastName,
            dateFrom,
            dateTo,
            guestNumber);
        // tap operator: operates on the data then returns an observable 
        return this.bookings.pipe(
                take(1),
                delay(1000),
                tap(bookings => {
                        this._bookings.next(bookings.concat(newBooking));
                })
            );
    }

    cancelBooking(bookingId: string) {
        return this.bookings.pipe(
            take(1),
            delay(1000),
            tap(bookings => {
                    this._bookings.next(bookings.filter(b => b.id !== bookingId));
            })
        );
    }

}