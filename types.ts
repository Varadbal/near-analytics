


export type AccountId = string;
export type Timestamp = u64;
export type Data = u8;

@nearBindgen
export class Rational {
    constructor(
        public num : u8,
        public den : u8
    ) {}
}

@nearBindgen
export class Decimal {
    constructor(
        public num : u8,
        public den : u8
    ) {}
}