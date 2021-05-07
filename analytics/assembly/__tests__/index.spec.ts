import { MIN_ANALYTICS_BALANCE, datasets, owners } from '..';
import { storage, Context, VMContext, context } from "near-sdk-as";
import * as contract from "..";
import { DataSetNameAsArg } from '../models';


/**
 * == CONFIGURATION VALUES ============================================================
 */
const USER_ACCOUNT_ID = "user";
const NAME = "testanalytics";
const DATASET_NAME = "dataset";
const VIEWER_NAME = "viewer";

/**
 * == HELPER FUNCTIONS =========================================================
 */
const useUserAsPredecessor = (): void => {
    VMContext.setPredecessor_account_id(USER_ACCOUNT_ID);
};

const useViewerAsPredecessor = (): void => {
    VMContext.setPredecessor_account_id(VIEWER_NAME);
};

const attachMinAnalyticsBalance = (): void => {
    VMContext.setAttached_deposit(MIN_ANALYTICS_BALANCE);
};

const doInitialize = (): void => {
    attachMinAnalyticsBalance();
    useUserAsPredecessor();
    contract.init(NAME);
};

/**
 * == UNIT TESTS =========================================================
 */

describe("analytics initialization ", () => {
    beforeEach(useUserAsPredecessor);

    it("creates an analytics instance with correct settings", () => {
        // Arrange
        attachMinAnalyticsBalance();
        // Act
        contract.init(NAME);
        // Assert
        const a = contract.get_analytics();
        expect(a.name).toBe(NAME);
    });
    it("requires name not to be blank", () => {
        // Arrange
        attachMinAnalyticsBalance();
        // Act, Assert
        expect(() => {
            contract.init("");
        }).toThrow("Analytics name may not be blank");
    });
    it("requires a minimum balance", () => {
        //Act, Assert
        expect(() => {
            contract.init(NAME);
        }).toThrow("Minimum account balance must be attached to initialize this contract (1 NEAR)");
    });
    it("prevents double initialization", () => {
        // Arrange
        attachMinAnalyticsBalance();
        contract.init(NAME);
        // Act, Assert
        expect(() => {
            contract.init(NAME);
        }).toThrow("Contract is already initialized");
    });
});

describe("data manipulation ", () => {
    beforeEach(doInitialize);
    it("prevents element addition to nonexistent dataset", () => {
        // Act, Assert
        expect(() => {
            contract.add_data(DATASET_NAME, 1, 2);
        }).toThrow("Dataset does not exist");
    });
    it("prevents non-owner from adding data elements", () => {
        // Arrange
        datasets.add(DATASET_NAME);
        owners.set(DATASET_NAME, USER_ACCOUNT_ID);
        useViewerAsPredecessor();
        // Act, Assert
        expect(() => {
            contract.add_data(DATASET_NAME, 1, 2);
        }).toThrow("Only dataset owners are authorized for this operation");
    });
});