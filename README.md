NEAR Analytics
==================

This is a repository for the NEAR Certified Developer Program - NEAR Analytics project. 

This project is the first step to bringing AI to the NEAR blockchain. It contains two interacting smart contracts, which enable data storage & analysis in addition to providing  a simple authorization mechanism.

In short: users can create 2D datasets (for a small fee) and incrementally fill them with their data. These datasets then provide various data analysis techniques to the general public. Everything is stored on the blockchain, which makes data manipulation really difficult.

Motivating Example
===========
Let's assume, that we work for a medical clinic. One day, we realize, that there may be a connection between the patients' BMI index and their progression of diabetes. Using the given contracts, we could easily create an application like this: 

![diabetes app wireframe](https://github.com/Varadbal/near-analytics/blob/main/docs/diabetes_example.png)

Just by adding an appropriate front-end, our application would be able to:
- Manage multiple datasets,
- Manage write-permissions,
- Calculate basic descriptive statistics for the datasets, and even
- Give a prediction to unknown values (by fitting a linear model).

Quick Start
===========

To run this project locally:

1. Prerequisites: Make sure you've installed [Node.js] ≥ 12
2. Install dependencies: `yarn install`
3. Build the project: `yarn build`
4. (Log into your NEAR account: `near login`)
5. Deploy the contracts: `near dev-deploy`
6. Have fun!

Now you'll have a local development environment backed by the NEAR TestNet!

A proposed application of the contracts:

1. initialize   
   Example: `near call  <DEV_ACCOUNT> init '{"name":"<ANALYTICS_SERVICE_NAME>"}' --accountId <DEV_ACCOUNT> --amount <INT>=1>`
3. create_dataset  
   Example: `near call  <DEV_ACCOUNT> create_dataset '{"name":"<DATASET_NAME>", "description":"<DESCRIPTION>"}' --accountId <DEV_ACCOUNT> --amount <INT>=2>`
5. add_data (as many times as you need)   
   Example: `near call  <DEV_ACCOUNT> add_data '{"dataset":"<DATASET_NAME>", "x":<INT>, "y":<INT>}' --accountId <DEV_ACCOUNT>`
7. call the various analytics functions (e.g. get_xmin, get_xmax, get_ypred)   
   Example: `near call  <DEV_ACCOUNT> get_xmin '{"dataset":"<DATASET_NAME>"}' --accountId <DEV_ACCOUNT>`

Where `<DEV_ACCOUNT>` represents your (own development) account, `<ANALYTICS_SERVICE_NAME>`, `<DATASET_NAME>`, `<DESCRIPTION>` are arbitrary strings and `<INT>` represents any integer number with the possbily given constraint. Note, that `<DATASET_NAME>` must be an eligible NEAR account name, as for each dataset, a separate account will be created.

Exploring The Code
==================
This project consists of two contracts. The Dataset contract (representing individual datasets contained in their own accounts), and the Analytics contract (responsible for creating and managing several dataset contracts). The users are interacting with the Analytics contract. The following figure summarizes this concept:

![analysis concept figure](https://github.com/Varadbal/near-analytics/blob/main/docs/analytics_concept.png)

In the following subsections, the details are elaborated on.

Deploy
======

Every smart contract in NEAR has its [own associated account][NEAR accounts]. When you run `yarn dev`, your smart contract gets deployed to the live NEAR TestNet with a throwaway account. When you're ready to make it permanent, here's how.


Step 0: Install near-cli (optional)
-------------------------------------

[near-cli] is a command line interface (CLI) for interacting with the NEAR blockchain. It was installed to the local `node_modules` folder when you ran `yarn install`, but for best ergonomics you may want to install it globally:

    yarn install --global near-cli

Or, if you'd rather use the locally-installed version, you can prefix all `near` commands with `npx`

Ensure that it's installed with `near --version` (or `npx near --version`)


Step 1: Create an account for the contract
------------------------------------------

Each account on NEAR can have at most one contract deployed to it. If you've already created an account such as `your-name.testnet`, you can deploy your contract to `nearAnalytics.your-name.testnet`. Assuming you've already created an account on [NEAR Wallet], here's how to create `nearAnalytics.your-name.testnet`:

1. Authorize NEAR CLI, following the commands it gives you:

      near login

2. Create a subaccount (replace `YOUR-NAME` below with your actual account name):

      near create-account nearAnalytics.YOUR-NAME.testnet --masterAccount YOUR-NAME.testnet


Step 2: set contract name in code
---------------------------------

Modify the line in `src/config.js` that sets the account name of the contract. Set it to the account id you used above.

    const CONTRACT_NAME = process.env.CONTRACT_NAME || 'nearAnalytics.YOUR-NAME.testnet'


Step 3: deploy!
---------------

One command:

    yarn deploy

As you can see in `package.json`, this does two things:

1. builds & deploys smart contract to NEAR TestNet
2. builds & deploys frontend code to GitHub using [gh-pages]. This will only work if the project already has a repository set up on GitHub. Feel free to modify the `deploy` script in `package.json` to deploy elsewhere.


Troubleshooting
===============

On Windows, if you're seeing an error containing `EPERM` it may be related to spaces in your path. Please see [this issue](https://github.com/zkat/npx/issues/209) for more details.


  [create-near-app]: https://github.com/near/create-near-app
  [Node.js]: https://nodejs.org/en/download/package-manager/
  [jest]: https://jestjs.io/
  [NEAR accounts]: https://docs.near.org/docs/concepts/account
  [NEAR Wallet]: https://wallet.testnet.near.org/
  [near-cli]: https://github.com/near/near-cli
  [gh-pages]: https://github.com/tschaub/gh-pages
