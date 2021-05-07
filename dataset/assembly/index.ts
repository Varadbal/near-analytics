import { context, logging, PersistentSet, PersistentVector, storage, u128 } from 'near-sdk-as';
import { DATASET_KEY, DataSet } from "./models";
import {AccountId, Data, Rational, Timestamp} from "../../types";

export const MIN_ACCOUNT_BALANCE = u128.from('1000000000000000000000000'); // ONE NEAR

/**
 * == PUBLIC METHODS ==========================================================
 *
 * The contract's public API.
 */

/* DataSet object-related functions */
export function init(name : AccountId, description: string): void {
  assert(!is_initialized(), "Contract is already initialized");
  assert(
    u128.ge(context.attachedDeposit, MIN_ACCOUNT_BALANCE),
    "Minimum account balance must be attached to initialize this contract (1 NEAR)"
  );
  assert(name.length > 0, "Dataset name may not be blank");
  assert(description.length > 0, "Dataset description may not be blank");

  DataSet.create(name, description);
}

export function get_dataset() : DataSet {
  assert_contract_is_initialized();
  return DataSet.get();
}

/* Data element manipulation */
export function add_data_element(x: Data, y : Data) : void {
  assert_contract_is_initialized();
  DataSet.add_data_element(x, y);
}

export function is_data_mapped(x: Data) : bool {
  assert_contract_is_initialized();
  return DataSet.is_data_mapped(x);
}

export function get_data_element(x : Data) : Data {
  assert_contract_is_initialized();
  return DataSet.get_data_element(x);
}

export function get_data_keys() : Data[] {
  assert_contract_is_initialized();
  return DataSet.get_data_keys();
}

/* Analysis functions */
export function min_x() : Data {
  assert_contract_is_initialized();
  return DataSet.min_x();
}

export function max_x() : Data {
  assert_contract_is_initialized();
  return DataSet.max_x();
}

export function avg_x() : Rational {
  assert_contract_is_initialized();
  return DataSet.avg_x();
}

export function pred_y(x : Data) : Rational {
  assert_contract_is_initialized();
  return DataSet.pred_y(x);
}

/**
 * == PRIVATE METHODS ==========================================================
 *
 * Helper classes & methods.
 */

function is_initialized(): bool {
  return storage.hasKey(DATASET_KEY);
}

function assert_contract_is_initialized(): void {
  assert(is_initialized(), "Contract must be initialized first.");
}