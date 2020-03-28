import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

import { Booking } from './booking.model';
import { AuthService } from '../auth/auth.service';
import { take, delay, tap, switchMap, map } from 'rxjs/operators';
import { ThrowStmt } from '@angular/compiler';

interface BookingDataModel {
    bookFrom: string;
    bookTo: string;
    firstName: string;
    guestNumber: number;
    lastName: string;
    placeId: string;
    placeImg: string;
    placeTitle: string;
    userId: string;
}
@Injectable({
    providedIn: 'root'
})
export class BookingService {
    constructor(private readonly authService: AuthService, private readonly http: HttpClient) {

    }
    private _bookings = new BehaviorSubject<Booking[]>([]);
    private fireBaseURL = 'https://ionic-angular-f34a9.firebaseio.com/bookings';

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
        let generatedId: string;
        const newBooking = new Booking(
            Math.random().toString(),
            placeId,
            this.authService.userId,
            placeTitle,
            placeImg,
            firstName,
            lastName,
            dateFrom,
            dateTo,
            guestNumber);

        // tap operator: operates on the data then returns an observable
        return this.http.post<{ name: string }>(`${this.fireBaseURL}.json`, { ...newBooking, id: null }).
            pipe(
                switchMap(resData => {
                    generatedId = resData.name;
                    return this.bookings;
                }),
                take(1),
                tap(bookings => {
                    this._bookings.next(bookings.concat({ ...newBooking, id: generatedId }));
                })
            );

    }

    cancelBooking(bookingId: string) {
        return this.http.delete(`${this.fireBaseURL}/${bookingId}.json`)
            .pipe(
                switchMap(() => {
                    return this.bookings;
                }),
                take(1),
                tap(bookings => {
                    this._bookings.next(bookings.filter(b => b.id !== bookingId));
                })
            );
    }

    fetchBookings() {
        // get the fetching from logged in user
        // to search the booking in firebase, you should update the RULES wrt node i.e bookings
        return this.http
            .get<{ [key: string]: BookingDataModel }>(`${this.fireBaseURL}.json?orderBy="userId"&equalTo="${this.authService.userId}"`)
            .pipe(
                map(respData => {
                    const bookings: Booking[] = [];
                    for (const key in respData) {
                        if (respData.hasOwnProperty(key)) {
                            bookings.push(new Booking(
                                key,
                                respData[key].placeId,
                                respData[key].userId,
                                respData[key].placeTitle,
                                respData[key].placeImg,
                                respData[key].firstName,
                                respData[key].lastName,
                                new Date(respData[key].bookFrom),
                                new Date(respData[key].bookTo),
                                respData[key].guestNumber
                            ));
                        }
                    }
                    return bookings;
                }),
                tap(bookings => {
                    this._bookings.next(bookings);
                })
            );
    }

}