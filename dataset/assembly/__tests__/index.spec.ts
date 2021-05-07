import { MIN_ACCOUNT_BALANCE } from '..';
import { VMContext, storage, Context } from "near-sdk-as";
import * as contract from "..";
import {AccountId, Data, Rational, Timestamp, } from "../../../types";

/**
 * == CONFIGURATION VALUES ============================================================
 */
const ANALYTICS_ACCOUNT_ID = "analytics";
const NAME = "mydataset"
const DESCRIPTION = "Lorem ipsum yadda yadda etc."

const FACTOR : u8 = 100;

/**
 * == HELPER FUNCTIONS =========================================================
 */
const useAnalyticsAsPredecessor = (): void => {
    VMContext.setPredecessor_account_id(ANALYTICS_ACCOUNT_ID);
};

const attachMinBalance = (): void => {
    VMContext.setAttached_deposit(MIN_ACCOUNT_BALANCE);
};

const doInitialize = (): void => {
    attachMinBalance();
    useAnalyticsAsPredecessor();
    contract.init(NAME, DESCRIPTION);
};

const doFill = (): void => {
    doInitialize();
    contract.add_data_element(1, 1);
    contract.add_data_element(3, 3);
    contract.add_data_element(5, 5);
    contract.add_data_element(9, 9);
    // min x = 1, max x = 9, avg x = 4.5 + error, pred_y(6) = 6 
};

/**
 * == UNIT TESTS =========================================================
 */

describe("dataset initialization ", () => {
    beforeEach(useAnalyticsAsPredecessor);

    it("creates a dataset with proper settings", () => {
        // Arrange
        attachMinBalance();
        // Act
        contract.init(NAME, DESCRIPTION);
        // Assert
        const d = contract.get_dataset();
        expect(d.name).toBe(NAME);
        expect(d.description).toBe(DESCRIPTION);
    });

    it("requires name not to be blank", () => {
        // Arrange
        attachMinBalance();
        // Act, Assert
        expect(() => {
            contract.init("", DESCRIPTION);
        }).toThrow("Analytics name may not be blank");
    });

    it("requires description not to be blank", () => {
        // Arrange
        attachMinBalance();
        // Act, Assert
        expect(() => {
            contract.init(NAME, "");
        }).toThrow("Dataset description may not be blank");
    });

    it("requires a minimum balance", () => {
        //Act, Assert
        expect(() => {
            contract.init(NAME, DESCRIPTION);
        }).toThrow("Minimum account balance must be attached to initialize this contract (1 NEAR)");
    });

    it("prevents double initialization", () => {
        // Arrange
        attachMinBalance();
        contract.init(NAME, DESCRIPTION);
        // Act, Assert
        expect(() => {
            contract.init(NAME, DESCRIPTION);
        }).toThrow("Contract is already initialized");
    });
});


describe("data manipulation", () => {
    beforeEach(doInitialize);
    
    it("adds data element", () => {
        // Arrange
        const x : Data = 1;
        const y : Data = 1;
        // Act
        contract.add_data_element(x, y);
        // Assert
        expect(contract.is_data_mapped(x)).toBe(true);
        expect(contract.get_data_element(x)).toBe(y);
        expect(contract.get_data_keys()).toContain(x);
        expect(contract.get_data_keys()).toHaveLength(1);
    })
})

describe("data analysis", () => {
    it("calculates min(x) correctly", () => {
        // Arrange
        doFill();
        // Act, Assert
        expect(contract.min_x()).toBe(1);
    })
    it("prevents min(x) on empty data", () => {
        // Arrange
        doInitialize();
        // Act, Assert
        expect(() => {
            contract.min_x();
        }).toThrow("Dataset is empty");
    })
    it("calculates max(x) correctly", () => {
        // Arrange
        doFill();
        // Act, Assert
        expect(contract.max_x()).toBe(9);
    })
    it("prevents max(x) on empty data", () => {
        // Arrange
        doInitialize();
        // Act, Assert
        expect(() => {
            contract.max_x();
        }).toThrow("Dataset is empty");
    })
    it("calculates avg(x) correctly", () => {
        // Arrange
        doFill();
        // Act, Assert
        expect(contract.get_data_keys().length).toBe(4);
        const a = contract.avg_x();
        expect(f32(a.num) / f32(a.den)).toBe(4.5);
    })
    it("prevents avg(x) on empty data", () => {
        // Arrange
        doInitialize();
        // Act, Assert
        expect(() => {
            contract.avg_x();
        }).toThrow("Dataset is empty");
    })
    it("calculates pred_y(x) correctly", () => {
        // Arrange
        doFill();
        // Act, Assert
        const p = contract.pred_y(6);
        expect(f32(p.num) / f32(p.den)).toBe(6);
    })
    it("prevents pred_y(x) on empty data", () => {
        // Arrange
        doInitialize();
        // Act, Assert
        expect(() => {
            contract.pred_y(1);
        }).toThrow("Dataset is empty");
    })
})