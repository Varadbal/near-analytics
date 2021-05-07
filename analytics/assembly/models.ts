import {
    context,
    storage,
    PersistentSet,
    PersistentMap
} from "near-sdk-as";


import {AccountId, Data, Rational, Timestamp} from "../../types";

export const ANALYTICS_KEY = "state"


@nearBindgen
export class Registration {
    constructor(
        public account : AccountId,
        public dataset : AccountId
    ) {}
}

@nearBindgen
export class Statistics {
    constructor(
        public min_x : Data,
        public max_x : Data,
        public avg_x : Rational
    ) {}
}

@nearBindgen
export class DataSetInitArgs {
    constructor(
        public name : AccountId,
        public description : string
    ) {}
}

@nearBindgen
export class DataSetNameAsArg {
  constructor(
    public name: AccountId,
    public owner: AccountId
  ) { }
}

@nearBindgen
export class EmptyArgs {
    constructor(

    ){}
}

@nearBindgen
export class AddDataElementArgs {
    constructor(
        public x: Data,
        public y: Data
    ) {}
}

@nearBindgen
export class PredYArgs {
    constructor(
        public x: Data
    ) {}
}

@nearBindgen
export class Analytics {
    created_at: Timestamp = context.blockTimestamp

    constructor(
        public name: string
    ) {}

    static create(name: string): void {
        assert(name.length > 0, "Analytics name may not be blank");

        // save the analytics to storage
        storage.set(ANALYTICS_KEY, new Analytics(name));
    }
}

/*@nearBindgen
export class Analytics {
    created_at: Timestamp = context.blockTimestamp

    constructor(
        public name: string
    ) {}

    static create(name: string): void {
        assert(name.length > 0, "Analytics name may not be blank");

        // save the analytics to storage
        this.set(new Analytics(name));
    }*/
    
    /* Save and retrieve from storage */
    /*static get(): Analytics {
        return storage.getSome<Analytics>(ANALYTICS_KEY);
    }
    static set(analytics: Analytics): void {
        storage.set(ANALYTICS_KEY, analytics);
    }*/


    /* DataSet functions */
    /*static add_dataset(accountId: AccountId, owner: AccountId): void {
        datasets.add(accountId);
        owners.set(accountId, owner);
    }

    static has_dataset(accountId: AccountId): bool {
        return datasets.has(accountId);
    }

    static is_owner(dataset: AccountId, owner: AccountId): bool {
        return owners.get(dataset) == owner;
    }*/
//}

