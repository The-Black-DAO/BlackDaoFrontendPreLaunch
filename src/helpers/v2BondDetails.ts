import { OHMTokenStackProps } from "@olympusdao/component-library";
import { ethers } from "ethers";

import { NetworkId } from "../networkDetails";
import { IERC20__factory, UniswapV2Lp__factory } from "../typechain";
import { getTokenByContract, getTokenPrice } from "./";

const pricingFunctionHelper = async (
  provider: ethers.providers.JsonRpcProvider,
  quoteToken: string,
  firstToken: string,
  secondToken: string,
) => {
  const baseContract = UniswapV2Lp__factory.connect(quoteToken, provider);
  const reserves = await baseContract.getReserves();
  const totalSupply = +(await baseContract.totalSupply()) / Math.pow(10, await baseContract.decimals());

  const token0Contract = IERC20__factory.connect(await baseContract.token0(), provider);
  const token0Decimals = await token0Contract.decimals();
  const token0Amount = +reserves._reserve0 / Math.pow(10, token0Decimals);
  const token0TotalValue = (await getTokenPrice(firstToken)) * token0Amount;

  const token1Contract = IERC20__factory.connect(await baseContract.token1(), provider);
  const token1Decimals = await token1Contract.decimals();
  const token1Amount = +reserves._reserve1 / Math.pow(10, token1Decimals);
  const token1TotalValue = (await getTokenPrice(secondToken)) * token1Amount;

  const totalValue = token0TotalValue + token1TotalValue;
  const valuePerLpToken = totalValue / totalSupply;

  return valuePerLpToken;
};

export interface V2BondDetails {
  name: string;
  bondIconSvg: OHMTokenStackProps["tokens"];
  pricingFunction(provider: ethers.providers.JsonRpcProvider, quoteToken: string): Promise<number>;
  isLP: boolean;
  lpUrl: { [key: number]: string };
}

const DaiDetails: V2BondDetails = {
  name: "DAI",
  bondIconSvg: ["DAI"],
  pricingFunction: async () => {
    return getTokenPrice("dai");
  },
  isLP: false,
  lpUrl: {},
};

const FraxDetails: V2BondDetails = {
  name: "FRAX",
  bondIconSvg: ["FRAX"],
  pricingFunction: async () => {
    return 1.0;
  },
  isLP: false,
  lpUrl: {},
};

const EthDetails: V2BondDetails = {
  name: "ETH",
  bondIconSvg: ["wETH"],
  pricingFunction: async () => {
    return getTokenPrice("ethereum");
  },
  isLP: false,
  lpUrl: {},
};

const CvxDetails: V2BondDetails = {
  name: "CVX",
  bondIconSvg: ["CVX"],
  pricingFunction: async () => {
    return getTokenPrice("convex-finance");
  },
  isLP: false,
  lpUrl: {},
};

const UstDetails: V2BondDetails = {
  name: "UST",
  bondIconSvg: ["UST"],
  pricingFunction: async () => {
    return getTokenByContract("0xa693b19d2931d498c5b318df961919bb4aee87a5");
  },
  isLP: false,
  lpUrl: {},
};

const WbtcDetails: V2BondDetails = {
  name: "wBTC",
  bondIconSvg: ["wBTC"],
  pricingFunction: async () => {
    return getTokenByContract("0x2260fac5e5542a773aa44fbcfedf7c193bc2c599");
  },
  isLP: false,
  lpUrl: {},
};

const OhmDaiDetails: V2BondDetails = {
  name: "BLKD-DAI LP",
  bondIconSvg: ["OHM", "DAI"],
  async pricingFunction(provider, quoteToken) {
    return pricingFunctionHelper(provider, quoteToken, "olympus", "dai");
  },
  isLP: true,
  lpUrl: {
    [NetworkId.TESTNET_RINKEBY]:
      "https://app.sushi.com/add/0x5eD8BD53B0c3fa3dEaBd345430B1A3a6A4e8BD7C/0x1e630a578967968eb02EF182a50931307efDa7CF",
    [NetworkId.MAINNET]:
      "https://app.sushi.com/add/0xe7DA1d8327AE1F320BbC23ca119b02AD3f85dceB/0x916B12723De3707372174cB2016e087C66DDFc39",
  },
};

const OhmEthDetails: V2BondDetails = {
  name: "BLKD-ETH LP",
  bondIconSvg: ["OHM", "wETH"],
  async pricingFunction(provider, quoteToken) {
    return pricingFunctionHelper(provider, quoteToken, "olympus", "ethereum");
  },
  isLP: true,
  lpUrl: {
    [NetworkId.MAINNET]:
      "https://app.sushi.com/add/0xe7DA1d8327AE1F320BbC23ca119b02AD3f85dceB/0xb7126C86caD05E7153C7dc35612b7E3ed438822c",
  },
};

export const UnknownDetails: V2BondDetails = {
  name: "unknown",
  bondIconSvg: ["OHM"],
  pricingFunction: async () => {
    return 1;
  },
  isLP: false,
  lpUrl: "",
};

/**
 * DOWNCASE ALL THE ADDRESSES!!! for comparison purposes
 */
export const v2BondDetails: { [key: number]: { [key: string]: V2BondDetails } } = {
  [NetworkId.TESTNET_RINKEBY]: {
    [("0x2eE127e04b1AF4ebb77f6c0405B9C277c9079e74").toLowerCase()]: DaiDetails,
   // ["0x5ed8bd53b0c3fa3deabd345430b1a3a6a4e8bd7c"]: DaiDetails,
    [("0x03B40c5d740d6f4D76dDB484d7D4D9A0FD6202A5").toLowerCase()]: FraxDetails,
    [("0xc778417e063141139fce010982780140aa0cd5ab").toLowerCase()]: EthDetails,
    // ["0xb2180448f8945c8cc8ae9809e67d6bd27d8b2f2c"]: CvxDetails, // we do not have CVX rinkeby in previous bonds
    [("0x97aa6b330967fc46Bd819535ae86701275a872d9").toLowerCase()]: OhmDaiDetails,
  },
  [NetworkId.MAINNET]: {
    ["0x6b175474e89094c44da98b954eedeac495271d0f"]: DaiDetails,
    ["0x853d955acef822db058eb8505911ed77f175b99e"]: FraxDetails,
    ["0xa693b19d2931d498c5b318df961919bb4aee87a5"]: UstDetails,
    ["0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"]: WbtcDetails,
    ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"]: EthDetails,
    ["0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b"]: CvxDetails,
    [("0xb7126C86caD05E7153C7dc35612b7E3ed438822c".toLowerCase())]: OhmEthDetails,
    [("0x17724357aB08aa3b9b6CfBf86a16e585ad98534F".toLowerCase())]: OhmDaiDetails,
  },
};
