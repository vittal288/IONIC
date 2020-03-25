export class Booking {
    constructor(
        public id: string,
        public placeId: string,
        public userId: string,
        public placeTitle: string,
        public placeImg: string,
        public firstName: string,
        public lastName: string,
        public bookFrom: Date,
        public bookTo: Date,
        public guestNumber: number) {

    }
}