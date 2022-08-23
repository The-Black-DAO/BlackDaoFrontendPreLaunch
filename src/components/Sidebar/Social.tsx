import { Link } from "@material-ui/core";
import { Icon } from "@olympusdao/component-library";
import React from "react";

const Social: React.FC = () => (
  <div className="social-row">
    <Link href="https://github.com/The-Black-DAO" target="_blank">
      <Icon name="github" />
    </Link>
    <Link href="https://mirror.xyz/theblackdao.eth" target="_blank">
      <Icon name="medium" />
    </Link>
    <Link href="https://twitter.com/theblackdao" target="_blank">
      <Icon name="twitter" />
    </Link>
     <Link href="https://discord.com/invite/N9JHyZjqK9" target="_blank">
      <Icon name="discord" />
    </Link>
  </div>
);

export default Social;
