import React, { useEffect, useMemo } from "react";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import header from "./assets/header.png";
import Mint from "./components/Mint/Mint";
import Team from "./components/Team/Team";
import Roadmap from "./components/Roadmap/Roadmap";
import Comms from "./components/Comms/Comms";

import * as anchor from "@project-serum/anchor";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
} from "@solana/wallet-adapter-wallets";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";

import { WalletDialogProvider } from "@solana/wallet-adapter-material-ui";

import { fadeInUp } from "react-animations";
import { StyleSheet, css } from "aphrodite";

const candyMachineId = process.env.REACT_APP_CANDY_MACHINE_ID
  ? new anchor.web3.PublicKey(process.env.REACT_APP_CANDY_MACHINE_ID)
  : undefined;

const fairLaunchId = process.env.REACT_APP_FAIR_LAUNCH_ID
  ? new anchor.web3.PublicKey(process.env.REACT_APP_FAIR_LAUNCH_ID)
  : undefined;

const network = process.env.REACT_APP_SOLANA_NETWORK as WalletAdapterNetwork;

const rpcHost = process.env.REACT_APP_SOLANA_RPC_HOST!;
const connection = new anchor.web3.Connection(rpcHost);

const startDateSeed = parseInt(process.env.REACT_APP_CANDY_START_DATE!, 10);

const txTimeout = 30000; // milliseconds (confirm this works for your project)

const styles = StyleSheet.create({
  fade: {
    animationName: fadeInUp,
    animationDuration: "1.5s",
  },
});
function App() {
  const endpoint = useMemo(() => clusterApiUrl(network), []);

  const wallets = useMemo(
    () => [getPhantomWallet(), getSolflareWallet(), getSolletWallet()],
    []
  );
  return (
    <ConnectionProvider endpoint={clusterApiUrl("mainnet-beta")}>
      <WalletProvider wallets={wallets}>
        <WalletDialogProvider>
          <div className="App">
            <Navbar />
            <div className={`welcome ${css(styles.fade)}`}>
              <h1>
                The Alien <br /> Dudes
              </h1>
              <img className={`${css(styles.fade)}`} src={header} alt="" />
            </div>
            <Mint
              candyMachineId={candyMachineId}
              fairLaunchId={fairLaunchId}
              connection={connection}
              startDate={startDateSeed}
              txTimeout={txTimeout}
              rpcHost={rpcHost}
            />
            <Team />
            <Roadmap />
            <Comms />
          </div>
        </WalletDialogProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
