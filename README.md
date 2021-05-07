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

Where `<DEV_ACCOUNT>` represents your (own development) account ID, `<ANALYTICS_SERVICE_NAME>`, `<DATASET_NAME>`, `<DESCRIPTION>` are arbitrary strings and `<INT>` represents any integer number with the possbily given constraint. Note, that `<DATASET_NAME>` must be an eligible NEAR account name, as for each dataset, a separate account will be created.

Exploring The Code
==================
This project consists of two contracts. The Dataset contract (representing individual datasets contained in their own accounts), and the Analytics contract (responsible for creating and managing several dataset contracts). The users are interacting with the Analytics contract. The following figure summarizes this concept:

![analysis concept figure](https://github.com/Varadbal/near-analytics/blob/main/docs/analytics_concept.png)

In the following subsections, the details are elaborated on.

File System
-------------------------------------

The core file structure (only the most important components):

```
near-analytics
├── README.md                           <-- this file
├── package.json                        <-- dependencies and 'yarn' command definitions
├── types.ts                            <-- common datatypes used in both contracts
├── dataset                             <-- the Dataset contract
│   ├── assembly       
|   |   ├── __tests__
│   |   |   └── main.spec.ts            <-- unit tests
|   |   ├── index.ts                    <-- public contract interface
│   |   └── models.ts                   <-- the underlying data structures and logic
│   └── build                           <-- place of the generated (.wasm) files
|       ├── debug
│       └── release
├── analytics                           <-- the Analytics contract
│   ├── assembly       
|   |   ├── __tests__
│   |   |   └── main.spec.ts            <-- unit tests
|   |   ├── index.ts                    <-- public contract interface and logic
│   |   └── models.ts                   <-- the serializable data structures
│   └── build                           <-- place of the generated (.wasm) files
|       ├── debug
│       └── release
├── src                                 <-- place of the front-end (currently not used)
└── docs                                <-- images and auxiliary documentation
```

### Key Contributors

- [Balázs Várady @Varadbal](https://github.com/Varadbal)
