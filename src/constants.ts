export const THE_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/wasif28/black-dao";
export const EPOCH_INTERVAL = 2200;

// NOTE could get this from an outside source since it changes slightly over time https://api.thegraph.com/subgraphs/name/drondin/olympus-protocol-metrics
//https://api.studio.thegraph.com/query/19881/black-dao/v0.0.5 https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_4_3
export const BLOCK_RATE_SECONDS = 13.14;

export const TOKEN_DECIMALS = 9;

interface IPoolGraphURLS {
  [index: string]: string;
}

export const POOL_GRAPH_URLS: IPoolGraphURLS = {
  4: "",
  1: "https://api.thegraph.com/subgraphs/name/wasif28/black-dao",
};

export * from "./networkDetails";
export * from "./helpers/v2BondDetails";
