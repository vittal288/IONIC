import { Injectable } from '@angular/core';
import { Offers } from './offers.model';


@Injectable({
    providedIn: 'root'
})
export class OffersService {
    private _offers: Offers[] = [
        new Offers('p1', 'New Year Offer', '50% off on all bookings'),
        new Offers('p2', 'End Year Offer', '50% off on all bookings'),
        new Offers('p3', 'Monsoon offer', '40% off on all bookings'),
    ];

    get offers() {
        return [...this._offers];
    }
    constructor() {

    }
}