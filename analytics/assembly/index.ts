/*
 *  TODO write here 
 * Learn more about writing NEAR smart contracts with AssemblyScript:
 * https://docs.near.org/docs/roles/developer/contracts/assemblyscript
 *
 */

import { context, logging, PersistentSet, PersistentVector, PersistentMap, storage, u128, base58, env, ContractPromiseBatch, ContractPromise} from 'near-sdk-as';
import { Registration, Statistics, ANALYTICS_KEY, Analytics, DataSetInitArgs, DataSetNameAsArg, AddDataElementArgs, EmptyArgs, PredYArgs } from "./models";
import { AccountId, Data, Rational } from "../../types";

export const ONE_NEAR = u128.from('1000000000000000000000000'); // ONE NEAR
export const XCC_GAS = 30000000000000;

const CODE = includeBytes("../../out/dataset.wasm")  //TODO fix


export function init(name: string): void {
  assert(!is_initialized(), "Contract is already initialized.");

  // storing dataset metadata requires some storage staking (balance locked to offset cost of data storage)
  assert(
    u128.ge(context.attachedDeposit, ONE_NEAR),
    "Minimum account balance must be attached to initialize this contract (1 NEAR)"
  );

  Analytics.create(name)
  logging.log("analytics was created")
}

export function get_analytics(): Analytics {
  assert_contract_is_initialized()
  return storage.getSome<Analytics>(ANALYTICS_KEY);
}

export function create_dataset(name : AccountId, description : string) : void {
  assert_contract_is_initialized()
  // storing dataset metadata requires some storage staking (balance locked to offset cost of data storage)
  assert(
    u128.ge(context.attachedDeposit, u128.mul(ONE_NEAR, u128.from(2))),
    "Minimum account balance must be attached to initialize a dataset (30 NEAR)"
  );

  const accountId = full_account_for(name)

  assert(env.isValidAccountID(accountId), "Dataset name must be valid NEAR account name")
  assert(!datasets.has(name), "Dataset name already exists")

  logging.log("attempting to create dataset")

  let promise = ContractPromiseBatch.create(accountId)
    .create_account()
    .deploy_contract(Uint8Array.wrap(changetype<ArrayBuffer>(CODE)))
    .add_full_access_key(base58.decode(context.senderPublicKey));

  logging.log("promise function call")

  promise.function_call(
    "init",
    new DataSetInitArgs(name, description),
    context.attachedDeposit,
    XCC_GAS
  )

  promise.then(context.contractName).function_call(
    "on_dataset_created",
    new DataSetNameAsArg(name, context.predecessor),
    u128.Zero,
    XCC_GAS
  )

  
}

export function on_dataset_created(name: AccountId, owner: AccountId): void {
  logging.log("Gas used: " + env.used_gas.toString());
  let results = ContractPromise.getResults();
  let datasetCreated = results[0];

  // Verifying the remote contract call succeeded.
  // https://nomicon.io/RuntimeSpec/Components/BindingsSpec/PromisesAPI.html?highlight=promise#returns-3
  switch (datasetCreated.status) {
    case 0:
      // promise result is not complete
      logging.log("Dataset creation for [ " + full_account_for(name) + " ] is pending")
      break;
    case 1:
      // promise result is complete and successful
      logging.log("Dataset creation for [ " + full_account_for(name) + " ] succeeded")
      datasets.add(name);
      owners.set(name, owner);
      break;
    case 2:
      // promise result is complete and failed
      logging.log("Dataset creation for [ " + full_account_for(name) + " ] failed")
      break;

    default:
      logging.log("Unexpected value for promise result [" + datasetCreated.status.toString() + "]");
      break;
  }
  logging.log("Gas used: " + env.used_gas.toString());
}

export function register_to_dataset(dataset : AccountId) : void {
  assert(false, "Not implemented");
}

export function get_unapproved_registrations() : Registration[] {
  assert(false, "Not implemented");
  let ret = new Array<Registration>();
  ret.push(new Registration("",""));
  ret.push(new Registration("",""));
  return ret;
}

export function approve_registration(registration : Registration) : void {
  assert(false, "Not implemented");
}

export function add_data(dataset : AccountId, x : Data, y : Data) : void {
  logging.log("Attempting add_data element to dataset: " + dataset + ", with owner: " + context.predecessor + ", stored owner: " + owners.getSome(dataset));
  assert_dataset_exists(dataset);
  assert_is_owner(dataset, context.predecessor);  
  let datasetapi = new DataSetApi();
  let promise = datasetapi.add_element(dataset, x, y);
  promise.returnAsResult();
}

export function get_xmin(dataset : AccountId) : void {
  logging.log("Attempting get_xmin from dataset: " + dataset);
  assert_dataset_exists(dataset);
  let datasetapi = new DataSetApi();
  let promise = datasetapi.get_min_x(dataset);
  promise.returnAsResult();
}

export function get_xmax(dataset : AccountId) : void {
  logging.log("Attempting get_xmax from dataset: " + dataset);
  assert_dataset_exists(dataset);
  let datasetapi = new DataSetApi();
  let promise = datasetapi.get_max_x(dataset);
  promise.returnAsResult();
}

export function get_xavg(dataset : AccountId) : void {
  logging.log("Attempting get_xavg from dataset: " + dataset);
  assert_dataset_exists(dataset);
  let datasetapi = new DataSetApi();
  let promise = datasetapi.get_avg_x(dataset);
  promise.returnAsResult();
}

export function get_ypred(dataset : AccountId, x : Data) : void {
  logging.log("Attempting get_ypred from dataset: " + dataset);
  assert_dataset_exists(dataset);
  let datasetapi = new DataSetApi();
  let promise = datasetapi.get_pred_y(dataset, x);
  promise.returnAsResult();
}

/* Private helper functions */


export class DataSetApi {
  add_element(dataset : AccountId, x : Data, y : Data) : ContractPromise {
    logging.log("Attempting DataSetApi.add_element");
    let args: AddDataElementArgs = new AddDataElementArgs(x, y);
    let promise = ContractPromise.create(full_account_for(dataset), "add_data_element", args.encode(), XCC_GAS);
    return promise;
  }

  get_min_x(dataset: AccountId) : ContractPromise{
    logging.log("Attempting DataSetApi.get_min_x");
    let args: EmptyArgs = new EmptyArgs();
    let promise = ContractPromise.create(full_account_for(dataset), "min_x", args, XCC_GAS);
    return promise;
  }

  get_max_x(dataset: AccountId) : ContractPromise{
    logging.log("Attempting DataSetApi.get_max_x");
    let args: EmptyArgs = new EmptyArgs();
    let promise = ContractPromise.create(full_account_for(dataset), "max_x", args, XCC_GAS);
    return promise;
  }

  get_avg_x(dataset: AccountId) : ContractPromise{
    logging.log("Attempting DataSetApi.get_avg_x");
    let args: EmptyArgs = new EmptyArgs();
    let promise = ContractPromise.create(full_account_for(dataset), "avg_x", args, XCC_GAS);
    return promise;
  }

  get_pred_y(dataset: AccountId, x : Data) : ContractPromise{
    logging.log("Attempting DataSetApi.get_pred_y");
    let args: PredYArgs = new PredYArgs(x);
    let promise = ContractPromise.create(full_account_for(dataset), "pred_y", args, XCC_GAS * 2);
    return promise;
  }
}

function is_initialized(): bool {
  return storage.hasKey(ANALYTICS_KEY);
}

function assert_contract_is_initialized(): void {
  assert(is_initialized(), "Contract must be initialized first");
}

function assert_dataset_exists(name: AccountId) : void{
  assert(datasets.has(name), "Dataset does not exist");
}

function assert_is_owner(dataset: AccountId, owner: AccountId) : void {
  assert_dataset_exists(dataset);
  assert(owners.get(dataset) == owner, "Only dataset owners are authorized for this operation");
}

function full_account_for(dataset: string): string {
  return dataset + "." + context.contractName;
}


const datasets = new PersistentSet<AccountId>("ds")
const owners = new PersistentMap<AccountId, AccountId>("ow")    // dataset -> owner
