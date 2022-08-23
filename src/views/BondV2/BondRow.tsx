import "./ChooseBond.scss";

import { t, Trans } from "@lingui/macro";
import { Link, Paper, Slide, SvgIcon, TableCell, TableRow, Typography } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { TertiaryButton, TokenStack } from "@olympusdao/component-library";
import { NavLink } from "react-router-dom";
import { getEtherscanUrl } from "src/helpers";
import { useAppSelector } from "src/hooks";
import { IBondV2 } from "src/slices/BondSliceV2";

import { ReactComponent as ArrowUp } from "../../assets/icons/arrow-up.svg";
import { NetworkId } from "../../constants";
import { DisplayBondDiscount, DisplayBondPrice } from "./BondV2";

export function BondDataCard({ bond, networkId }: { bond: IBondV2; networkId: NetworkId }) {
  const isBondLoading = useAppSelector(state => state.bondingV2.loading);

  return (
    <Slide direction="up" in={true}>
      <Paper id={`${bond.index}--bond`} className="bond-data-card ohm-card">
        <div className="bond-pair">
          <TokenStack tokens={bond.bondIconSvg} />
          <div className="bond-name">
            <Typography>{bond.displayName}</Typography>
            {bond && bond.isLP ? (
              <div>
                <Link href={bond.lpUrl} target="_blank">
                  <Typography variant="body1">
                    <Trans>Get LP</Trans>
                    <SvgIcon component={ArrowUp} htmlColor="#A3A3A3" />
                  </Typography>
                </Link>
              </div>
            ) : (
              <div>
                <Link href={getEtherscanUrl({ bond, networkId })} target="_blank">
                  <Typography variant="body1">
                    <Trans>View Asset</Trans>
                    <SvgIcon component={ArrowUp} htmlColor="#A3A3A3" />
                  </Typography>
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="data-row">
          <Typography>
            <Trans>Price</Trans>
          </Typography>
          <Typography className="bond-price">
            <>{isBondLoading ? <Skeleton width="50px" /> : <DisplayBondPrice key={bond.index} bond={bond} />}</>
          </Typography>
        </div>
        <div className="data-row">
          <Typography>
            <Trans>ROI</Trans>
          </Typography>
          <Typography>
            {isBondLoading ? <Skeleton width="50px" /> : <DisplayBondDiscount key={bond.index} bond={bond} />}
          </Typography>
        </div>
        <div className="data-row">
          <Typography>
            <Trans>Duration</Trans>
          </Typography>
          <Typography>{isBondLoading ? <Skeleton width="50px" /> : bond.duration}</Typography>
        </div>

        {/* <div className="data-row">
          <Typography>
            <Trans>Purchased</Trans>
          </Typography>
          <Typography>
            {isBondLoading ? (
              <Skeleton width="80px" />
            ) : (
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
              }).format(bond.purchased)
            )}
          </Typography>
        </div> */}
        <Link component={NavLink} to={`/bonds/${bond.index}`}>
          <TertiaryButton fullWidth disabled={bond.soldOut}>
            {bond.soldOut ? t`Sold Out` : t`Bond ${bond.displayName}`}
          </TertiaryButton>
        </Link>
      </Paper>
    </Slide>
  );
}

export function BondTableData({ bond, networkId }: { bond: IBondV2; networkId: NetworkId }) {
  // Use BondPrice as indicator of loading.
  const isBondLoading = !bond.priceUSD ?? true;

  return (
    <TableRow id={`${bond.index}--bond`}>
      <TableCell align="left" className="bond-name-cell">
        <svg width="58" height="34" viewBox="0 0 58 34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M41 1C49.8374 1 57 8.16407 57 17C57 25.8374 49.8374 33 41 33C32.1641 33 25 25.8366 25 17C25 8.16407 32.1641 1 41 1Z" fill="#F0B90B" />
          <path d="M41.2388 18.5819H47.0514C47.1753 18.5819 47.2338 18.5819 47.2428 18.4196C47.2903 17.8286 47.2903 17.2342 47.2428 16.6426C47.2428 16.5277 47.1857 16.4802 47.0611 16.4802H35.493C35.3498 16.4802 35.3113 16.5277 35.3113 16.6618V18.3625C35.3113 18.5819 35.3113 18.5819 35.5405 18.5819H41.2388V18.5819ZM46.5937 14.4927C46.6102 14.4494 46.6102 14.4019 46.5937 14.3592C46.4966 14.148 46.3816 13.9464 46.2481 13.7573C46.0471 13.4339 45.8103 13.136 45.5405 12.8684C45.4131 12.7067 45.2658 12.5616 45.1006 12.4384C44.2732 11.7347 43.2895 11.2366 42.2321 10.9861C41.6987 10.8664 41.1535 10.8093 40.6069 10.8142H35.473C35.3299 10.8142 35.3106 10.8713 35.3106 10.9958V14.3874C35.3106 14.5305 35.3106 14.5691 35.4923 14.5691H46.5248C46.5248 14.5691 46.6205 14.5498 46.6398 14.4927H46.593H46.5937ZM46.5937 20.5695C46.4312 20.5516 46.2674 20.5516 46.1049 20.5695H35.5026C35.3595 20.5695 35.3113 20.5695 35.3113 20.7607V24.0767C35.3113 24.2294 35.3113 24.2679 35.5026 24.2679H40.3976C40.6317 24.2858 40.8657 24.2693 41.095 24.2205C41.8054 24.1696 42.5041 24.0155 43.1704 23.7616C43.4127 23.6777 43.6467 23.5683 43.8677 23.4369H43.9345C45.082 22.8404 46.0141 21.9034 46.6019 20.7531C46.6019 20.7531 46.6687 20.6087 46.5937 20.5708V20.5695ZM33.39 25.9872V25.9301V23.7038V22.9491V20.7036C33.39 20.5791 33.39 20.5605 33.2372 20.5605H31.1625C31.0475 20.5605 31 20.5605 31 20.4078V18.5923H33.2179C33.3418 18.5923 33.39 18.5923 33.39 18.4299V16.6336C33.39 16.5187 33.39 16.4905 33.2372 16.4905H31.1625C31.0475 16.4905 31 16.4905 31 16.3378V14.6564C31 14.5512 31 14.523 31.1528 14.523H33.2083C33.3515 14.523 33.39 14.523 33.39 14.3413V9.19125C33.39 9.03853 33.39 9 33.5814 9H40.7515C41.2719 9.02064 41.7888 9.07774 42.3003 9.17199C43.3542 9.36668 44.3668 9.743 45.2926 10.2803C45.9067 10.6415 46.4718 11.0776 46.975 11.5799C47.3536 11.9727 47.6951 12.3978 47.9979 12.8505C48.2988 13.3094 48.5486 13.7999 48.7448 14.3124C48.7689 14.4459 48.897 14.536 49.0305 14.5133H50.7418C50.9614 14.5133 50.9614 14.5133 50.971 14.7238V16.291C50.971 16.4438 50.9139 16.4823 50.7604 16.4823H49.4408C49.3072 16.4823 49.2687 16.4823 49.2783 16.6543C49.3306 17.2363 49.3306 17.8204 49.2783 18.4024C49.2783 18.5647 49.2783 18.584 49.4607 18.584H50.9703C51.0371 18.67 50.9703 18.756 50.9703 18.8427C50.98 18.9534 50.98 19.0656 50.9703 19.1763V20.3328C50.9703 20.4952 50.9228 20.5433 50.779 20.5433H48.972C48.846 20.5192 48.7235 20.5997 48.6946 20.7249C48.2643 21.8429 47.576 22.8452 46.6866 23.6488C46.3617 23.9412 46.0203 24.2164 45.6637 24.4702C45.2809 24.6904 44.9085 24.9195 44.5162 25.1011C43.7941 25.4258 43.0369 25.6652 42.2597 25.8172C41.5217 25.9493 40.7735 26.0092 40.0225 25.9989H33.3873V25.9892L33.39 25.9872Z" fill="white" />
          <circle cx="17" cy="17" r="15" fill="black" stroke="#FFB805" stroke-width="2" />
          <path d="M9.58752 9L17.0918 16.5791L22.9991 10.6504C22.3203 10.61 21.6394 10.6162 20.9615 10.6691C20.4009 10.7276 19.8811 10.9891 19.4999 11.4042C19.1187 11.8194 18.9024 12.3596 18.8918 12.9231C18.8918 13.6708 18.4378 14.01 17.9731 14.488C17.8342 12.8696 17.885 11.3875 19.3084 10.354C19.7796 9.96175 20.363 9.72895 20.9748 9.689C22.4223 9.67298 23.8697 9.689 25.2958 9.689L17.8182 17.1372L23.7549 23.13L23.875 23.1086C23.827 22.3234 23.8751 21.5196 23.7121 20.7532C23.6034 20.2547 23.328 19.8081 22.9314 19.4872C22.5347 19.1663 22.0405 18.9902 21.5303 18.9879C20.7505 19.0226 20.422 18.5312 19.9493 18.0345C21.298 17.9678 22.5665 17.9357 23.6107 18.8731C23.946 19.1457 24.2196 19.4864 24.4134 19.8726C24.6073 20.2589 24.7169 20.6819 24.735 21.1137C24.7643 22.5344 24.735 23.9552 24.735 25.44L17.2894 17.933L11.3581 23.8564C12.0593 23.8924 12.762 23.8871 13.4625 23.8403C14.5147 23.7175 15.4761 22.684 15.4414 21.6478C15.412 20.8466 15.8927 20.4995 16.3975 20.0321C16.5443 21.6558 16.4402 23.138 15.0168 24.1768C14.4216 24.6273 13.6935 24.8669 12.9471 24.8578C11.6465 24.8418 10.346 24.8578 9 24.8578L16.515 17.3802L10.6104 11.4623C9.99612 13.0032 10.7733 14.95 12.226 15.4254C12.4153 15.5115 12.6217 15.5535 12.8296 15.5482C13.588 15.4254 13.9218 15.9782 14.3945 16.4536C12.9898 16.5417 11.6706 16.5817 10.6104 15.5295C10.0018 14.9696 9.63814 14.1924 9.5982 13.3664C9.55548 11.9617 9.58752 10.5516 9.58752 9Z" fill="white" />
          <path d="M16.3975 14.496C15.9008 14.018 15.4147 13.6762 15.4334 12.8937C15.4628 11.6866 14.3171 10.6718 13.0299 10.621C12.7629 10.621 12.4958 10.621 12.2047 10.621V9.689C12.7232 9.60586 13.2534 9.63153 13.7614 9.76441C14.2694 9.89728 14.7443 10.1344 15.1557 10.4608C16.4536 11.4943 16.5203 12.9257 16.3975 14.496Z" fill="white" />
          <path d="M9.60089 22.2193C9.30713 19.4339 11.1739 17.5992 14.3946 18.0639C13.9219 18.4912 13.6281 19.0013 12.8617 18.9826C11.6385 18.9505 10.621 20.0054 10.5463 21.2312C10.5249 21.5543 10.5463 21.8775 10.5463 22.2193H9.60089Z" fill="white" />
          <path d="M22.1045 24.8071C20.0214 25.1703 17.4497 23.8323 17.9758 20.0401C18.4004 20.4914 18.8837 20.7692 18.8837 21.5169C18.8837 22.8789 20.0027 23.8724 21.3674 23.8777H22.1045V24.8071Z" fill="white" />
          <path d="M23.8217 12.2955H24.6683C25.4 14.8111 23.066 16.8782 19.9628 16.4348C20.4141 15.9969 20.7372 15.5509 21.4903 15.5322C22.8764 15.4975 23.8137 14.3919 23.8217 13.0032V12.2955Z" fill="white" />
        </svg>
        {/* <TokenStack tokens={bond.bondIconSvg} /> */}
        <div className="bond-name">
          {bond && bond.isLP ? (
            <>
              <Typography variant="body1">{bond.displayName}</Typography>
              <Link color="primary" href={bond.lpUrl} target="_blank">
                <Typography variant="body1">
                  <Trans>Get LP</Trans>
                  <SvgIcon component={ArrowUp} htmlColor="#A3A3A3" />
                </Typography>
              </Link>
            </>
          ) : (
            <>
              <Typography variant="body1">{bond.displayName}</Typography>
              <Link color="primary" href={getEtherscanUrl({ bond, networkId })} target="_blank">
                <Typography variant="body1">
                  <Trans>View Asset</Trans>
                  <SvgIcon component={ArrowUp} htmlColor="#A3A3A3" />
                </Typography>
              </Link>
            </>
          )}
          {/* <Typography>{bond.fixedTerm ? t`Fixed Term` : t`Fixed Expiration`}</Typography> */}
        </div>
      </TableCell>
      <TableCell align="left">
        <Typography>
          <>{isBondLoading ? <Skeleton width="50px" /> : <DisplayBondPrice key={bond.index} bond={bond} />}</>
        </Typography>
      </TableCell>
      <TableCell align="left">
        {isBondLoading ? <Skeleton width="50px" /> : <DisplayBondDiscount key={bond.index} bond={bond} />}
      </TableCell>
      <TableCell align="left">{isBondLoading ? <Skeleton /> : bond.duration}</TableCell>
      <TableCell>
        <Link component={NavLink} to={`/bonds/${bond.index}`}>
          <TertiaryButton fullWidth disabled={bond.soldOut}>
            {bond.soldOut ? t`Sold Out` : t`do_bond`}
          </TertiaryButton>
        </Link>
      </TableCell>
    </TableRow>
  );
}
