import { t } from "@lingui/macro";
import {
  Accordion as MuiAccordion,
  AccordionDetails,
  AccordionSummary as MuiAccordionSummary,
  Box,
  Button,
  Typography,
  useTheme,
  withStyles
  // SvgIcon
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { Icon, OHMTokenProps, Token as TokenSVG } from "@olympusdao/component-library";
import { ChangeEvent, useState } from "react";
import { useQuery } from "react-query";
import { addresses, NETWORKS } from "src/constants";
import { NetworkId } from "src/constants";
import { formatCurrency } from "src/helpers";
import { segmentUA } from "src/helpers/userAnalyticHelpers";
import { useAppSelector } from "src/hooks";
import { useWeb3Context } from "src/hooks/web3Context";
import { fetchCrossChainBalances } from "src/lib/fetchBalances";
// import { ReactComponent as BlkdIcon } from "../../../../src/assets/BLKD.svg";

const Accordion = withStyles({
  root: {
    backgroundColor: "inherit",
    backdropFilter: "none",
    "-webkit-backdrop-filter": "none",
    boxShadow: "none",
    "&:before": {
      display: "none",
    },
    "&$expanded": {
      margin: 0,
    },
  },
  expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles(theme => ({
  root: {
    minHeight: "36px",
    height: "36px",
    padding: theme.spacing(0),
    "&$expanded": {
      padding: theme.spacing(0),
      minHeight: "36px",
    },
  },
  content: {
    margin: 0,
    "&$expanded": {
      margin: 0,
    },
  },
  expanded: {},
}))(MuiAccordionSummary);

export interface IToken {
  symbol: string;
  address: string;
  decimals: number;
  icon: OHMTokenProps["name"];
  balance: string;
  price: number;
  crossChainBalances?: { balances: Record<NetworkId, string>; isLoading: boolean };
  vaultBalances?: { [vaultName: string]: string };
  totalBalance: string;
}

const addTokenToWallet = async (token: IToken, userAddress: string) => {
  if (!window.ethereum) return;
  const host = window.location.origin;
  try {
    await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals,
          image: `${host}/${token.icon}`,
        },
      },
    });
    segmentUA({
      address: userAddress,
      type: "Add Token",
      tokenName: token.symbol,
    });
  } catch (error) {
    console.log(error);
  }
};

interface TokenProps extends IToken {
  expanded: boolean;
  onChangeExpanded: (event: ChangeEvent<any>, isExpanded: boolean) => void;
  onAddTokenToWallet: () => void;
  decimals: number;
}

const BalanceValue = ({
  balance,
  balanceValueUSD,
  isLoading = false,
  sigFigs,
}: {
  balance: string;
  balanceValueUSD: number;
  isLoading?: boolean;
  sigFigs: number;
}) => (
  <Box sx={{ textAlign: "right", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
    <Typography variant="body2" style={{ fontWeight: 600 }}>
      {!isLoading ? balance.substring(0, sigFigs) : <Skeleton variant="text" width={50} />}
    </Typography>
    <Typography variant="body2" color="textSecondary">
      {!isLoading ? (
        formatCurrency(balanceValueUSD === NaN ? 0 : balanceValueUSD, 2)
      ) : (
        <Skeleton variant="text" width={50} />
      )}
    </Typography>
  </Box>
);

const TokenBalance = ({
  balanceLabel,
  balance,
  balanceValueUSD,
  sigFigs,
}: {
  balanceLabel: string;
  balance: string;
  balanceValueUSD: number;
  sigFigs: number;
}) => (
  <Box display="flex" flexDirection="row" justifyContent="space-between" key={balanceLabel}>
    <Typography color="textSecondary">{balanceLabel}</Typography>
    <Typography color="textSecondary">
      <BalanceValue balance={balance} sigFigs={sigFigs} balanceValueUSD={balanceValueUSD} />
    </Typography>
  </Box>
);

export const Token = ({
  symbol,
  decimals,
  icon,
  price = 0,
  crossChainBalances,
  vaultBalances,
  totalBalance,
  onAddTokenToWallet,
  expanded,
  onChangeExpanded,
}: TokenProps) => {
  const theme = useTheme();
  const isLoading = useAppSelector(s => s.account.loading || s.app.loadingMarketPrice || s.app.loading);
  const balanceValue = parseFloat(totalBalance) * price;

  // cleanedDecimals provides up to 7 sigFigs on an 18 decimal token (gOHM) & 5 sigFigs on 9 decimal Token
  const sigFigs = decimals === 18 ? 7 : 5;

  return (
    <Accordion expanded={expanded} onChange={onChangeExpanded}>
      <AccordionSummary expandIcon={<Icon name="more" color="disabled" />}>
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>

          {/* <TokenSVG name={icon} style={{ fontSize: 28, marginRight: theme.spacing(1) }} /> */}
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="17" cy="17" r="15" fill="black" stroke="#FFB805" stroke-width="2"/>
          <path d="M9.58752 9L17.0918 16.5791L22.9991 10.6504C22.3203 10.61 21.6394 10.6162 20.9615 10.6691C20.4009 10.7276 19.8811 10.9891 19.4999 11.4042C19.1187 11.8194 18.9024 12.3596 18.8918 12.9231C18.8918 13.6708 18.4378 14.01 17.9731 14.488C17.8342 12.8696 17.885 11.3875 19.3084 10.354C19.7796 9.96175 20.363 9.72895 20.9748 9.689C22.4223 9.67298 23.8697 9.689 25.2958 9.689L17.8182 17.1372L23.7549 23.13L23.875 23.1086C23.827 22.3234 23.8751 21.5196 23.7121 20.7532C23.6034 20.2547 23.328 19.8081 22.9314 19.4872C22.5347 19.1663 22.0405 18.9902 21.5303 18.9879C20.7505 19.0226 20.422 18.5312 19.9493 18.0345C21.298 17.9678 22.5665 17.9357 23.6107 18.8731C23.946 19.1457 24.2196 19.4864 24.4134 19.8726C24.6073 20.2589 24.7169 20.6819 24.735 21.1137C24.7643 22.5344 24.735 23.9552 24.735 25.44L17.2894 17.933L11.3581 23.8564C12.0593 23.8924 12.762 23.8871 13.4625 23.8403C14.5147 23.7175 15.4761 22.684 15.4414 21.6478C15.412 20.8466 15.8927 20.4995 16.3975 20.0321C16.5443 21.6558 16.4402 23.138 15.0168 24.1768C14.4216 24.6273 13.6935 24.8669 12.9471 24.8578C11.6465 24.8418 10.346 24.8578 9 24.8578L16.515 17.3802L10.6104 11.4623C9.99612 13.0032 10.7733 14.95 12.226 15.4254C12.4153 15.5115 12.6217 15.5535 12.8296 15.5482C13.588 15.4254 13.9218 15.9782 14.3945 16.4536C12.9898 16.5417 11.6706 16.5817 10.6104 15.5295C10.0018 14.9696 9.63814 14.1924 9.5982 13.3664C9.55548 11.9617 9.58752 10.5516 9.58752 9Z" fill="white"/>
          <path d="M16.3975 14.496C15.9008 14.018 15.4147 13.6762 15.4334 12.8937C15.4628 11.6866 14.3171 10.6718 13.0299 10.621C12.7629 10.621 12.4958 10.621 12.2047 10.621V9.689C12.7232 9.60586 13.2534 9.63153 13.7614 9.76441C14.2694 9.89728 14.7443 10.1344 15.1557 10.4608C16.4536 11.4943 16.5203 12.9257 16.3975 14.496Z" fill="white"/>
          <path d="M9.60089 22.2193C9.30713 19.4339 11.1739 17.5992 14.3946 18.0639C13.9219 18.4912 13.6281 19.0013 12.8617 18.9826C11.6385 18.9505 10.621 20.0054 10.5463 21.2312C10.5249 21.5543 10.5463 21.8775 10.5463 22.2193H9.60089Z" fill="white"/>
          <path d="M22.1045 24.8071C20.0214 25.1703 17.4497 23.8323 17.9758 20.0401C18.4004 20.4914 18.8837 20.7692 18.8837 21.5169C18.8837 22.8789 20.0027 23.8724 21.3674 23.8777H22.1045V24.8071Z" fill="white"/>
          <path d="M23.8217 12.2955H24.6683C25.4 14.8111 23.066 16.8782 19.9628 16.4348C20.4141 15.9969 20.7372 15.5509 21.4903 15.5322C22.8764 15.4975 23.8137 14.3919 23.8217 13.0032V12.2955Z" fill="white"/>
          </svg>

          {/* <SvgIcon
            color="primary"
            component={BlkdIcon}
            viewBox="0 0 151 100"
            style={{ minWidth: "151px", minHeight: "98px", width: "151px" }}
          /> */}
          <Typography  style={{ margin:8 }}>{symbol}</Typography>
        </Box>
        <BalanceValue
          balance={totalBalance}
          sigFigs={sigFigs}
          balanceValueUSD={balanceValue}
          isLoading={isLoading || crossChainBalances?.isLoading}
        />
      </AccordionSummary>
      <AccordionDetails style={{ margin: "auto", padding: theme.spacing(1, 0) }}>
        <Box
          sx={{ display: "flex", flexDirection: "column", flex: 1, mx: "32px", justifyContent: "center" }}
          style={{ gap: theme.spacing(1) }}
        >
          {!!crossChainBalances?.balances &&
            Object.entries(crossChainBalances.balances).map(
              ([networkId, balance]) =>
                parseFloat(balance) > 0.01 && (
                  <TokenBalance
                    balanceLabel={`${NETWORKS[networkId as any].chainName}:`}
                    balance={balance}
                    balanceValueUSD={parseFloat(balance) * price}
                    sigFigs={sigFigs}
                  />
                ),
            )}
          {!!vaultBalances &&
            Object.entries(vaultBalances).map(
              ([vaultName, balance]) =>
                parseFloat(balance) > 0.01 && (
                  <TokenBalance
                    balanceLabel={`${vaultName}:`}
                    balance={balance}
                    balanceValueUSD={parseFloat(balance) * price}
                    sigFigs={sigFigs}
                  />
                ),
            )}
          <Box className="ohm-pairs" style={{ width: "100%" }}>
            <Button variant="contained" color="secondary" fullWidth onClick={onAddTokenToWallet}>
              <Typography>{t`Add to Wallet`}</Typography>
            </Button>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export const MigrateToken = ({ symbol, icon, balance = "0.0", price = 0 }: IToken) => {
  const theme = useTheme();
  const balanceValue = parseFloat(balance) * price;
  return (
    <Box sx={{ display: "flex", flexDirection: "row" }}>
      <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
        <TokenSVG name={icon} style={{ fontSize: 28, marginRight: theme.spacing(1) }} />
        <Typography>{symbol}</Typography>
      </Box>
      {/* <Button variant="contained" color="primary" size="small" onClick={() => true}>
        Migrate v2
      </Button> */}
      <Box
        sx={{
          mx: theme.spacing(0.5),
          textAlign: "right",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="body2" style={{ fontWeight: 600 }}>
          {balance.substring(0, 5)}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {formatCurrency(balanceValue, 2)}
        </Typography>
      </Box>
    </Box>
  );
};

const sumObjValues = (obj: Record<string, string> = {}) =>
  Object.values(obj).reduce((sum, b = "0.0") => sum + (parseFloat(b) || 0), 0);

export const useWallet = (
  userAddress: string,
  chainId: NetworkId,
  providerInitialized: boolean,
): Record<string, IToken> => {
  // default to mainnet while not initialized
  const networkId = providerInitialized ? chainId : NetworkId.MAINNET;

  const connectedChainBalances = useAppSelector(s => s.account.balances);
  const ohmPrice = useAppSelector(s => s.app.marketPrice);
  const currentIndex = useAppSelector(s => s.app.currentIndex);

  const { gohm, wsohm, isLoading } = useCrossChainBalances(userAddress);

  const tokens = {
    // ohmV1: {
    //   symbol: "BLKD V1",
    //   address: addresses[networkId].OHM_ADDRESS,
    //   balance: connectedChainBalances.ohmV1,
    //   price: ohmPrice || 0,
    //   icon: "OHM",
    //   decimals: 9,
    // },
    // sohmV1: {
    //   symbol: "sBLKD V1",
    //   address: addresses[networkId].SOHM_ADDRESS,
    //   balance: connectedChainBalances.sohmV1,
    //   price: ohmPrice || 0,
    //   icon: "sOHM",
    //   decimals: 9,
    // },
    ohm: {
      symbol: "BLKD",
      address: addresses[networkId].OHM_V2,
      balance: connectedChainBalances.ohm,
      price: ohmPrice || 0,
      icon: "OHM",
      decimals: 9,
    },
    sohm: {
      symbol: "sBLKD",
      address: addresses[networkId].SOHM_V2,
      balance: connectedChainBalances.sohm,
      price: ohmPrice || 0,
      vaultBalances: {
        "Fuse Olympus Pool Party": connectedChainBalances.fsohm,
      },
      icon: "sOHM",
      decimals: 9,
    },
    wsohm: {
      symbol: "wsBLKD",
      address: addresses[networkId].WSOHM_ADDRESS,
      balance: connectedChainBalances.wsohm,
      price: (ohmPrice || 0) * Number(currentIndex || 0),
      crossChainBalances: { balances: wsohm, isLoading },
      icon: "wsOHM",
      decimals: 18,
    },
    pool: {
      symbol: "33T",
      address: addresses[networkId].PT_TOKEN_ADDRESS,
      balance: connectedChainBalances.pool,
      price: ohmPrice || 0,
      icon: "33T",
      decimals: 9,
    },
    gohm: {
      symbol: "gBLKD",
      address: addresses[networkId].GOHM_ADDRESS,
      balance: connectedChainBalances.gohm,
      price: (ohmPrice || 0) * Number(currentIndex || 0),
      crossChainBalances: { balances: gohm, isLoading },
      vaultBalances: {
        "gOHM on Tokemak": connectedChainBalances.gOhmOnTokemak,
        "Fuse Olympus Pool Party": connectedChainBalances.fgohm,
      },
      icon: "wsOHM",
      decimals: 18,
    },
  } as Record<string, Omit<IToken, "totalBalance">>;

  return Object.entries(tokens).reduce((wallet, [key, token]) => {
    const crossChainBalances = sumObjValues(token.crossChainBalances?.balances);
    const vaultBalances = sumObjValues(token.vaultBalances);
    const balance = crossChainBalances || parseFloat(token.balance) || 0;
    return {
      ...wallet,
      [key]: {
        ...token,
        totalBalance: (balance + vaultBalances).toString(),
      } as IToken,
    };
  }, {});
};

export const useCrossChainBalances = (address: string) => {
  const { isLoading, data } = useQuery(["crossChainBalances", address], () => fetchCrossChainBalances(address), {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  return { isLoading, ...data };
};

export const Tokens = () => {
  const { address: userAddress, networkId, providerInitialized } = useWeb3Context();
  const tokens = useWallet(userAddress, networkId, providerInitialized);
  const isLoading = useAppSelector(s => s.account.loading || s.app.loadingMarketPrice || s.app.loading);
  const [expanded, setExpanded] = useState<string | null>(null);

  const v1Tokens = [tokens.ohmV1, tokens.sohmV1];
  const alwaysShowTokens = [tokens?.ohm, tokens?.sohm, tokens?.gohm];
  const onlyShowWhenBalanceTokens = [tokens?.wsohm, tokens?.pool];

  const tokenProps = (token: IToken) => ({
    ...token,
    expanded: expanded === token.symbol,
    onChangeExpanded: (e: any, isExpanded: boolean) => setExpanded(isExpanded ? token.symbol : null),
    onAddTokenToWallet: () => addTokenToWallet(token, userAddress),
  });
  console.log("ddddd", alwaysShowTokens)

  return (
    <>
      {alwaysShowTokens.map(token => (
        <Token key={token.symbol} {...tokenProps(token)} />
      ))}
      {!isLoading &&
        onlyShowWhenBalanceTokens.map(
          token => parseFloat(token?.totalBalance) > 0.01 && <Token key={token?.symbol} {...tokenProps(token)} />,
        )}
      {!isLoading &&
        v1Tokens.map(token => parseFloat(token?.totalBalance) > 0.01 && <MigrateToken {...token} key={token?.symbol} />)}
    </>
  );
};
