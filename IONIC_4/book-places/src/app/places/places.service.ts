import { Injectable } from '@angular/core';

import { Place } from './places.model';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places: Place[] = [
    new Place(
      'p1',
      'Manahattan Mansion',
      'In the heart of Newyork City',
      'https://picsum.photos/id/536/354/354',
      149.99,
      new Date('2019-01-01'),
      new Date('2019-12-31')),
    new Place('p2',
      'L\'Amour Toujours',
      'Romantic City in Paris',
      'https://picsum.photos/id/536/354/356',
      189.99,
      new Date('2019-01-01'),
      new Date('2019-12-31')
      ),
    new Place('p3',
      'The Foggy Palace',
      'Not your average city trip',
      'https://picsum.photos/id/536/355/354',
      99.9,
      new Date('2019-01-01'),
      new Date('2019-12-31')
    ),
    new Place('p3',
      'The Foggy Palace',
      'Not your average city trip',
      'https://picsum.photos/id/536/355/354',
      99.9,
      new Date('2019-01-01'),
      new Date('2019-12-31'))
  ];


  get places() {
    return [...this._places];
  }

  getPlace(id: string) {
    return { ...this._places.find(place => place.id === id) };
  }

  constructor() { }

}
