/*
 *  TODO write here 
 * Learn more about writing NEAR smart contracts with AssemblyScript:
 * https://docs.near.org/docs/roles/developer/contracts/assemblyscript
 *
 */


//TODO
//import {AccountId, Data, Decimal} from "././types";
import { context, logging, PersistentSet, PersistentVector, storage, u128 } from 'near-sdk-as';
import { DATASET_KEY, DataSet } from "./models";
import {AccountId, Data, Rational, Timestamp} from "../../types";

export const MIN_ACCOUNT_BALANCE = u128.from('1000000000000000000000000'); // ONE NEAR

export function init(name : AccountId, description: string): void {
  // contract may only be initialized once
  assert(!is_initialized(), "Contract is already initialized.");

  // storing meme metadata requires some storage staking (balance locked to offset cost of data storage)
  assert(
    u128.ge(context.attachedDeposit, MIN_ACCOUNT_BALANCE),
    "Minimum account balance must be attached to initialize this contract (1 NEAR)"
  );

  // description has to be at least 1 character
  assert(description.length > 0, "Dataset description may not be blank");

  // create the dataset using incoming metadata
  DataSet.create(description);
}

export function get_dataset(): DataSet {
  assert_contract_is_initialized();
  return DataSet.get();
}

export function add_data_element(x: Data, y : Data): void {
  assert_contract_is_initialized();
  DataSet.add_data_element(x, y);
}

export function min_x() : Data {
  return DataSet.min_x();
}

export function max_x() : Data {
  return DataSet.max_x();
}

export function avg_x() : Rational {
  return DataSet.avg_x();
}

export function pred_y(x : Data) : Rational {
  return DataSet.pred_y(x);
}

/* Private helper methods */

function is_initialized(): bool {
  return storage.hasKey(DATASET_KEY);
}

function assert_contract_is_initialized(): void {
  assert(is_initialized(), "Contract must be initialized first.");
}