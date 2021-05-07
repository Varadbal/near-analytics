import {context, storage, PersistentSet, PersistentMap } from "near-sdk-as";
import {AccountId, Data, Rational, Timestamp} from "../../types";

// singleton key (for storage)
export const DATASET_KEY = "state"
// factor for the rational numbers (more zeros means more precision)
export const FACTOR: u8 = 100

@nearBindgen
export class DataSet {
    created_at: Timestamp = context.blockTimestamp;

    constructor(
        public name : AccountId,
        public description : string
    ) { }
    
    /* DataSet creation */
    static create(name : AccountId, description : string) : void {
        const ds = new DataSet(name, description);
        this.set(ds);
    }

    /* Save and retrieve singleton from storage */
    static get(): DataSet {
        return storage.getSome<DataSet>(DATASET_KEY);
    }
    static set(ds: DataSet): void {
        storage.set(DATASET_KEY, ds);
    }

    /* DataElement: function-like mapping */
    static add_data_element(x : Data, y : Data) : void {
        assert(!data_x.has(x), "X-value already mapped in the dataset");
        data_x.add(x);
        data_y.set(x, y);
    }

    static is_data_mapped(x : Data) : bool {
        return data_x.has(x);
    }

    static get_data_element(x : Data) : Data{
        assert(data_x.has(x), "X-value not mapped");
        return data_y.getSome(x);
    }

    static get_data_keys() : Data[] {
        return data_x.values();
    }

    /* Data analysis functions */
    static min_x() : Data {
        assert(data_x.size > 0, "Dataset is empty");
        return data_x.values().sort(function(a, b){return a-b}).reverse().pop();
    }

    static max_x() : Data {
        assert(data_x.size > 0, "Dataset is empty");
        return data_x.values().sort(function(a, b){return a-b}).pop();
    }

    static avg_x() : Rational {
        assert(data_x.size > 0, "Dataset is empty");
        let sum : Data = 0;
        let count : Data = 0;
        let i : i8 = 0;
        let vals = data_x.values();
        for(i = 0; i < data_x.size; i++) {
            sum += vals[i];
            count += 1;
        }
        return new Rational((sum * FACTOR) / count, FACTOR);
    }

    static avg_y() : Rational {
        assert(data_x.size > 0, "Dataset is empty");
        let sum : Data = 0;
        let count : Data = 0;
        let i : i8 = 0;
        for(i = 0; i < data_x.size; i++) {
            sum += data_y.getSome(data_x.values()[i]);
            count += 1;
        }
        return new Rational((sum * FACTOR) / count, FACTOR);
    }

    static pred_y(x_t : Data) : Rational {
        assert(data_x.size > 0, "Dataset is empty");

        let n : Data = u16(data_x.size);  
        let m_x : Rational = this.avg_x();
        let m_y : Rational = this.avg_y();

        let xy_sum : Data = 0;
        let xx_sum : Data = 0;
        let i : i8 = 0;
        for(i = 0; i < data_x.size; i++) {
            xy_sum += data_x.values()[i] * data_y.getSome(data_x.values()[i]);
            xx_sum += data_x.values()[i] * data_x.values()[i];
        }
        let ss_xy : Rational = new Rational (xy_sum*FACTOR - n*FACTOR*m_y.num*m_x.num, FACTOR);
        let ss_xx : Rational = new Rational (xx_sum*FACTOR - n*FACTOR*m_x.num*m_x.num, FACTOR);

        let b1 : Rational = new Rational(ss_xy.num / ss_xx.num, FACTOR);
        let b0 : Rational = new Rational(m_y.num - b1.num*m_x.num, FACTOR);

        return new Rational((b0.num + b1.num*x_t) * FACTOR, FACTOR);
    }
}

/* Storage */
const data_x = new PersistentSet<Data>("dx");
const data_y = new PersistentMap<Data, Data>("dy");
