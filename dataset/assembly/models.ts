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
        let xs = data_x.values();
        for(i = 0; i < data_x.size; i++) {
            sum += data_y.getSome(xs[i]);
            count += 1;
        }
        return new Rational((sum * FACTOR) / count, FACTOR);
    }

    static pred_y(x_t : Data) : Rational {
        // TODO make type conversion safe and ensure correctness
        assert(data_x.size > 0, "Dataset is empty");

        let n : Data = u16(data_x.size);  
        let m_x : Data = this.avg_x().num;
        let m_y : Data = this.avg_y().num;

        let xy_sum : u32 = 0;
        let xx_sum : u32 = 0;
        let i : i8 = 0;
        let xs = data_x.values();
        for(i = 0; i < data_x.size; i++) {
            xy_sum += (xs[i] * 100) * (data_y.getSome(xs[i])*100);
            xx_sum += (xs[i] * 100) * (xs[i] * 100);
        }

        let ss_xy : u32 = xy_sum - n * m_x * m_y;
        let ss_xx : u32 = xx_sum - n * m_x * m_x;

        let b1 : u16 = u16(ss_xy / ss_xx);
        let b0 : u16 = m_y - b1*m_x;
        

        return new Rational(b0 + b1*x_t, 1);
    }
}

/* Storage */
const data_x = new PersistentSet<Data>("dx");
const data_y = new PersistentMap<Data, Data>("dy");
