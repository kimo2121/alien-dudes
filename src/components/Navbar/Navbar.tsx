import React, { useEffect } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-material-ui";
import "./styles.css";
import twitter from "../../assets/twitter.png";
import discord from "../../assets/discord.png";

import { fadeInUp } from "react-animations";
import { StyleSheet, css } from "aphrodite";

const styles = StyleSheet.create({
  fade: {
    animationName: fadeInUp,
    animationDuration: "1.5s",
  },
});

const Navbar = () => {
  return (
    <div className={`navbar ${css(styles.fade)}`}>
      {/* <button className="connect-btn">CONNECT</button> */}
      <WalletMultiButton className="connect-btn" />
      <div className="nav-links">
        <a target="_blank" href="https://twitter.com/thealiendudes">
          <img src={twitter} alt="" />
        </a>
        <a target="_blank" href="https://discord.gg/thealiendudes">
          <img src={discord} alt="" />
        </a>
      </div>
    </div>
  );
};

export default Navbar;
