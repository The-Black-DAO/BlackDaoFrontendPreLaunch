import { Trans } from "@lingui/macro";
import { ReactElement } from "react";

export interface ExternalUrl {
  title: ReactElement;
  url: string;
  icon: string;
}

const externalUrls: ExternalUrl[] = [
  {
    title: <Trans>Forum</Trans>,
    url: "https://discord.com/invite/N9JHyZjqK9",
    icon: "forum",
  },
  {
    title: <Trans>Governance</Trans>,
    url: "https://vote.blk.finance/#/theblackdao.eth",
    icon: "governance",
  },
  {
    title: <Trans>Docs</Trans>,
    url: "https://docs.blk.finance/",
    icon: "docs",
  },
  // {
  //   title: <Trans>Bug Bounty</Trans>,
  //   url: "https://immunefi.com/bounty/olympus/",
  //   icon: "bug-report",
  // },
];

export default externalUrls;
