import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  Paper,
  Tab,
  Tabs,
  Typography,
  Zoom,
  SvgIcon,
  makeStyles,
  Select,
  MenuItem,
} from "@material-ui/core";
import { InfoTooltip } from "@olympusdao/component-library";
import { ReactComponent as ArrowUp } from "../../assets/icons/arrow-up.svg";

import { getOhmTokenImage, getTokenImage, trim, formatCurrency } from "../../helpers";
import { changeApproval, changeWrapV2 } from "../../slices/WrapThunk";
import { migrateWithType, migrateCrossChainWSOHM } from "../../slices/MigrateThunk";
import { switchNetwork } from "../../helpers/NetworkHelper";
import { useWeb3Context } from "src/hooks/web3Context";
import { isPendingTxn, txnButtonText, txnButtonTextMultiType } from "src/slices/PendingTxnsSlice";
import { Skeleton } from "@material-ui/lab";
import { error } from "../../slices/MessagesSlice";
import { NETWORKS } from "../../constants";
import { ethers } from "ethers";
import "../Stake/stake.scss";
import { Metric, MetricCollection } from "@olympusdao/component-library";
import { t } from "@lingui/macro";
import { useAppSelector } from "src/hooks";
import WrapCrossChain from "./WrapCrossChain";
import { loadAccountDetails } from "src/slices/AccountSlice";
import { DataRow } from "@olympusdao/component-library";

function Wrap() {
  const dispatch = useDispatch();
  const { provider, address, connect, networkId } = useWeb3Context();

  const [zoomed, setZoomed] = useState(false);
  const [assetFrom, setAssetFrom] = useState("sBLKD");
  const [assetTo, setAssetTo] = useState("gBLKD");
  const [quantity, setQuantity] = useState("");

  const chooseCurrentAction = () => {
    if (assetFrom === "sBLKD") return "Wrap from";
    if (assetTo === "sBLKD") return "Unwrap from";
    return "Transform";
  };
  const currentAction = chooseCurrentAction();

  const isAppLoading = useSelector(state => state.app.loading);
  const isAccountLoading = useSelector(state => state.account.loading);
  const currentIndex = useSelector(state => {
    return state.app.currentIndex;
  });

  const sOhmPrice = useSelector(state => {
    return state.app.marketPrice;
  });

  const gOhmPrice = useSelector(state => {
    return state.app.marketPrice * state.app.currentIndex;
  });

  const sohmBalance = useAppSelector(state => {
    return state.account.balances && state.account.balances.sohm;
  });

  const gohmBalance = useAppSelector(state => {
    return state.account.balances && state.account.balances.gohm;
  });

  const unwrapGohmAllowance = useAppSelector(state => {
    return state.account.wrapping && state.account.wrapping.gOhmUnwrap;
  });

  const wrapSohmAllowance = useAppSelector(state => {
    return state.account.wrapping && state.account.wrapping.sohmWrap;
  });

  const pendingTransactions = useSelector(state => {
    return state.pendingTransactions;
  });

  const avax = NETWORKS[43114];
  const arbitrum = NETWORKS[42161];

  const isAvax = useMemo(() => networkId != 1 && networkId != 4 && networkId != -1, [networkId]);

  const wrapButtonText =
    assetTo === "gBLKD" ? (assetFrom === "wsBLKD" ? "Migrate" : "Wrap") + " to gBLKD" : `${currentAction} ${assetFrom}`;

  const setMax = () => {
    if (assetFrom === "sBLKD") setQuantity(sohmBalance);
    if (assetFrom === "gBLKD") setQuantity(gohmBalance);
  };

  const handleSwitchChain = id => {
    return () => {
      switchNetwork({ provider: provider, networkId: id });
    };
  };

  const hasCorrectAllowance = useCallback(() => {
    if (assetFrom === "sBLKD" && assetTo === "gBLKD") return wrapSohmAllowance > Number(sohmBalance);
    if (assetFrom === "gBLKD" && assetTo === "sBLKD") return unwrapGohmAllowance > Number(gohmBalance);

    return 0;
  }, [unwrapGohmAllowance, wrapSohmAllowance, assetTo, assetFrom, sohmBalance, gohmBalance]);

  const isAllowanceDataLoading = currentAction === "Unwrap";
  // const convertedQuantity = 0;
  const convertedQuantity = useMemo(() => {
    if (assetFrom === "sBLKD") {
      return quantity / currentIndex;
    } else if (assetTo === "sBLKD") {
      return quantity * currentIndex;
    } else {
      return quantity;
    }
  }, [quantity]);

  let modalButton = [];

  modalButton.push(
    <Button variant="contained" color="primary" className="connect-button" onClick={connect} key={1}>
      Connect Wallet
    </Button>,
  );

  let temporaryStore = assetTo;

  const changeAsset = () => {
    setQuantity("");
    setAssetTo(assetFrom);
    setAssetFrom(temporaryStore);
  };

  const approveWrap = token => {
    dispatch(changeApproval({ address, token: token.toLowerCase(), provider, networkID: networkId }));
  };

  const unwrapGohm = () => {
    dispatch(changeWrapV2({ action: "unwrap", value: quantity, provider, address, networkID: networkId }));
  };

  const wrapSohm = () => {
    dispatch(changeWrapV2({ action: "wrap", value: quantity, provider, address, networkID: networkId }));
  };

  const approveCorrectToken = () => {
    if (assetFrom === "sBLKD" && assetTo === "gBLKD") approveWrap("sBLKD");
    if (assetFrom === "gBLKD" && assetTo === "sBLKD") approveWrap("gBLKD");
  };

  const chooseCorrectWrappingFunction = () => {
    if (assetFrom === "sBLKD" && assetTo === "gBLKD") wrapSBLKD();
    if (assetFrom === "gBLKD" && assetTo === "sBLKD") unwrapGohm();
  };

  const chooseInputArea = () => {
    if (!address || isAllowanceDataLoading) return <Skeleton width="150px" />;
    if (assetFrom === assetTo) return "";
    if (!hasCorrectAllowance() && assetTo === "gBLKD")
      return (
        <div className="no-input-visible">
          First time wrapping to <b>gBLKD</b>?
          <br />
          Please approve Olympus to use your <b>{assetFrom}</b> for this transaction.
        </div>
      );
    else if (!hasCorrectAllowance() && assetTo === "sBLKD")
      return (
        <div className="no-input-visible">
          First time unwrapping <b>{assetFrom}</b>?
          <br />
          Please approve Olympus to use your <b>{assetFrom}</b> for unwrapping.
        </div>
      );

    return (
      <FormControl className="ohm-input" variant="outlined" color="primary">
        <InputLabel htmlFor="amount-input"></InputLabel>
        <OutlinedInput
          id="amount-input"
          type="number"
          placeholder="Enter an amount"
          className="stake-input"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          labelWidth={0}
          endAdornment={
            <InputAdornment position="end">
              <Button variant="text" onClick={setMax} color="inherit">
                Max
              </Button>
            </InputAdornment>
          }
        />
      </FormControl>
    );
  };

  const chooseButtonArea = () => {
    if (!address) return "";
    if (assetFrom === assetTo) return "";
    if (!hasCorrectAllowance())
      return (
        <Button
          className="stake-button wrap-page"
          variant="contained"
          color="primary"
          disabled={
            isPendingTxn(pendingTransactions, "approve_wrapping") ||
            isPendingTxn(pendingTransactions, "approve_migration")
          }
          onClick={approveCorrectToken}
        >
          {txnButtonTextMultiType(pendingTransactions, ["approve_wrapping", "approve_migration"], "Approve")}
        </Button>
      );

    if (hasCorrectAllowance())
      return (
        <Button
          className="stake-button wrap-page"
          variant="contained"
          color="primary"
          disabled={isPendingTxn(pendingTransactions, "wrapping") || isPendingTxn(pendingTransactions, "migrate")}
          onClick={chooseCorrectWrappingFunction}
        >
          {txnButtonTextMultiType(pendingTransactions, ["wrapping", "migrate"], wrapButtonText)}
        </Button>
      );
  };

  if (!isAvax) {
    return (
      <div id="stake-view" className="wrapper">
        <Zoom in={true} onEntered={() => setZoomed(true)}>
          <Paper className={`ohm-card`}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <div className="card-header">
                  <Typography variant="h5">Wrap / Unwrap</Typography>
                  <Link
                    className="migrate-sohm-button"
                    style={{ textDecoration: "none" }}
                    href={
                      assetTo === "wsBLKD"
                        ? "https://docs.olympusdao.finance/main/contracts/tokens#wsohm"
                        : "https://docs.olympusdao.finance/main/contracts/tokens#gohm"
                    }
                    aria-label="wsohm-wut"
                    target="_blank"
                  >
                    <Typography>gBLKD</Typography>{" "}
                    <SvgIcon component={ArrowUp} color="primary" style={{ marginLeft: "5px", width: ".8em" }} />
                  </Link>
                </div>
              </Grid>
              <Grid item>
                <MetricCollection>
                  <Metric
                    label={`sBLKD ${t`Price`}`}
                    metric={formatCurrency(sOhmPrice, 2)}
                    isLoading={sOhmPrice ? false : true}
                  />
                  <Metric
                    label={t`Current Index`}
                    metric={trim(currentIndex, 1)}
                    isLoading={currentIndex ? false : true}
                  />
                  <Metric
                    label={`gBLKD ${t`Price`}`}
                    metric={formatCurrency(gOhmPrice, 2)}
                    isLoading={gOhmPrice ? false : true}
                    tooltip={`gBLKD = sBLKD * index\n\nThe price of gBLKD is equal to the price of sBLKD multiplied by the current index`}
                  />
                </MetricCollection>
              </Grid>
              <div className="staking-area">
                {!address ? (
                  <div className="stake-wallet-notification">
                    <div className="wallet-menu" id="wallet-menu">
                      {modalButton}
                    </div>
                    <Typography variant="h6">Connect your wallet</Typography>
                  </div>
                ) : (
                  <>
                    <Box className="stake-action-area">
                      <Box style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <>
                          <Typography>
                            <span className="asset-select-label">{currentAction}</span>
                          </Typography>
                          <FormControl
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              margin: "0 10px",
                              height: "33px",
                              minWidth: "69px",
                            }}
                          >
                            <Select
                              id="asset-select"
                              value={assetFrom}
                              label="Asset"
                              onChange={changeAsset}
                              disableUnderline
                            >
                              <MenuItem value={"sBLKD"}>sBLKD</MenuItem>
                              <MenuItem value={"gBLKD"}>gBLKD</MenuItem>
                            </Select>
                          </FormControl>

                          <Typography>
                            <span className="asset-select-label"> to </span>
                          </Typography>
                          <FormControl
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              margin: "0 10px",
                              height: "33px",
                              minWidth: "69px",
                            }}
                          >
                            <Select
                              id="asset-select"
                              value={assetTo}
                              label="Asset"
                              onChange={changeAsset}
                              disableUnderline
                            >
                              <MenuItem value={"gBLKD"}>gBLKD</MenuItem>
                              <MenuItem value={"sBLKD"}>sBLKD</MenuItem>
                            </Select>
                          </FormControl>
                        </>
                      </Box>
                      <Box display="flex" alignItems="center" style={{ paddingBottom: 0 }}>
                        <div className="stake-tab-panel wrap-page">
                          {chooseInputArea()}
                          {chooseButtonArea()}
                        </div>
                      </Box>
                    </Box>
                    <div className={`stake-user-data`}>
                      <>
                        <DataRow
                          title={t`sBLKD Balance`}
                          balance={`${trim(sohmBalance, 4)} sBLKD`}
                          isLoading={isAppLoading}
                        />
                        <DataRow
                          title={t`gBLKD Balance`}
                          balance={`${trim(gohmBalance, 4)} gBLKD`}
                          isLoading={isAppLoading}
                        />
                        <Divider />
                        <Box width="100%" align="center" p={1}>
                          <Typography variant="body1" style={{ margin: "15px 0 10px 0" }}>
                            Got wsBLKD on Avalanche or Arbitrum? Click below to switch networks and migrate to gBLKD (no
                            bridge required!)
                          </Typography>
                          <Button
                            onClick={handleSwitchChain(43114)}
                            variant="outlined"
                            p={1}
                            style={{ margin: "0.3rem" }}
                          >
                            <img height="28px" width="28px" src={avax.image} alt={avax.imageAltText} />
                            <Typography variant="h6" style={{ marginLeft: "8px" }}>
                              {avax.chainName}
                            </Typography>
                          </Button>
                          <Button
                            onClick={handleSwitchChain(42161)}
                            variant="outlined"
                            p={1}
                            style={{ margin: "0.3rem" }}
                          >
                            <img height="28px" width="28px" src={arbitrum.image} alt={arbitrum.imageAltText} />
                            <Typography variant="h6" style={{ marginLeft: "8px" }}>
                              {arbitrum.chainName}
                            </Typography>
                          </Button>
                        </Box>
                      </>
                    </div>
                  </>
                )}
              </div>
            </Grid>
          </Paper>
        </Zoom>
      </div>
    );
  } else {
    return <WrapCrossChain />;
  }
}

export default Wrap;
