


export type AccountId = string;
export type Timestamp = u64;
export type Data = u16;

@nearBindgen
export class Rational {
    constructor(
        public num : Data,
        public den : Data
    ) {}
}

@nearBindgen
export class Decimal {
    constructor(
        public num : u8,
        public den : u8
    ) {}
}