import React, { useEffect, useMemo, useState } from "react";
import "./styles.css";
import sol from "../../assets/sol.png";
import { FaPlus, FaMinus } from "react-icons/fa";
import { Snackbar } from "@material-ui/core";
import { useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { GatewayProvider } from "@civic/solana-gateway-react";
import Alert from "@material-ui/lab/Alert";

import {
  awaitTransactionSignatureConfirmation,
  CandyMachineAccount,
  CANDY_MACHINE_PROGRAM,
  getCandyMachineState,
  mintOneToken,
} from "../../utils/candy-machine";

import {
  FairLaunchAccount,
  getFairLaunchState,
  punchTicket,
  purchaseTicket,
} from "../../utils/fair-launch";
import {
  AlertState,
  formatNumber,
  getAtaForMint,
  toDate,
} from "../../utils/utils";
import { MintButton } from "./MintButton";

import "aos/dist/aos.css";
import AOS from "aos";

const FAIR_LAUNCH_LOTTERY_SIZE =
  8 + // discriminator
  32 + // fair launch
  1 + // bump
  8; // size of bitmask ones

const isWinner = (fairLaunch: FairLaunchAccount | undefined): boolean => {
  if (
    !fairLaunch?.lottery.data ||
    !fairLaunch?.lottery.data.length ||
    !fairLaunch?.ticket.data?.seq ||
    !fairLaunch?.state.phaseThreeStarted
  ) {
    return false;
  }

  const myByte =
    fairLaunch.lottery.data[
      FAIR_LAUNCH_LOTTERY_SIZE +
        Math.floor(fairLaunch.ticket.data?.seq.toNumber() / 8)
    ];

  const positionFromRight = 7 - (fairLaunch.ticket.data?.seq.toNumber() % 8);
  const mask = Math.pow(2, positionFromRight);
  const isWinner = myByte & mask;
  return isWinner > 0;
};

export interface MintProps {
  candyMachineId?: anchor.web3.PublicKey;
  fairLaunchId?: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  startDate: number;
  txTimeout: number;
  rpcHost: string;
}
const Mint = (props: MintProps) => {
  const [count, setCount] = useState(1);
  const [contributed, setContributed] = useState(0);
  const [yourSOLBalance, setYourSOLBalance] = useState<number | null>(null);

  const [showMint, setShowMint] = useState(false);
  const [fairLaunch, setFairLaunch] = useState<FairLaunchAccount>();
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
  const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT
  const [fairLaunchBalance, setFairLaunchBalance] = useState<number>(0);

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

  const wallet = useWallet();
  const anchorWallet = useMemo(() => {
    if (
      !wallet ||
      !wallet.publicKey ||
      !wallet.signAllTransactions ||
      !wallet.signTransaction
    ) {
      return;
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as anchor.Wallet;
  }, [wallet]);

  const onPunchTicket = async () => {
    if (!anchorWallet || !fairLaunch || !fairLaunch.ticket) {
      return;
    }

    console.log("punch");
    setIsMinting(true);
    try {
      await punchTicket(anchorWallet, fairLaunch);
      setIsMinting(false);
      setAlertState({
        open: true,
        message: "Congratulations! Ticket punched!",
        severity: "success",
      });
    } catch (e) {
      console.log(e);
      setIsMinting(false);
      setAlertState({
        open: true,
        message: "Something went wrong.",
        severity: "error",
      });
    }
  };

  const onMint = async () => {
    try {
      setIsMinting(true);
      document.getElementById("#identity")?.click();
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        if (
          candyMachine.state.itemsRedeemed >= 600 &&
          Date.now() < 1642352400000
        ) {
          //(GMT): Sunday, January 16, 2022 5:00:00 PM
          setAlertState({
            open: true,
            message: "Presale sold out! Please wait public launch time!",
            severity: "error",
          });
        } else {
          if (
            fairLaunch?.ticket.data?.state.unpunched &&
            isWinner(fairLaunch)
          ) {
            await onPunchTicket();
          }

          const mintTxId = (
            await mintOneToken(candyMachine, wallet.publicKey)
          )[0];

          let status: any = { err: true };
          if (mintTxId) {
            status = await awaitTransactionSignatureConfirmation(
              mintTxId,
              props.txTimeout,
              props.connection,
              "singleGossip",
              true
            );
          }

          if (!status?.err) {
            setAlertState({
              open: true,
              message: "Congratulations! Mint succeeded!",
              severity: "success",
            });
          } else {
            setAlertState({
              open: true,
              message: "Mint failed! Please try again!",
              severity: "error",
            });
          }
        }
      }
    } catch (error: any) {
      // TODO: blech:
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (!error.message) {
          message = "Transaction Timeout! Please try again.";
        } else if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          window.location.reload();
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      setIsMinting(false);
    }
  };
  useEffect(() => {
    (async () => {
      if (!anchorWallet) {
        return;
      }

      try {
        const balance = await props.connection.getBalance(
          anchorWallet.publicKey
        );
        setYourSOLBalance(balance);

        if (props.fairLaunchId) {
          const state = await getFairLaunchState(
            anchorWallet,
            props.fairLaunchId,
            props.connection
          );

          setFairLaunch(state);

          try {
            if (state.state.tokenMint) {
              const fairLaunchBalance =
                await props.connection.getTokenAccountBalance(
                  (
                    await getAtaForMint(
                      state.state.tokenMint,
                      anchorWallet.publicKey
                    )
                  )[0]
                );

              if (fairLaunchBalance.value) {
                setFairLaunchBalance(fairLaunchBalance.value.uiAmount || 0);
              }
            }
          } catch (e) {
            console.log("Problem getting fair launch token balance");
            console.log(e);
          }
        } else {
          console.log("No fair launch detected in configuration.");
        }
      } catch (e) {
        console.log("Problem getting fair launch state");
        console.log(e);
      }
      if (props.candyMachineId) {
        try {
          const cndy = await getCandyMachineState(
            anchorWallet,
            props.candyMachineId,
            props.connection
          );
          setCandyMachine(cndy);
        } catch (e) {
          console.log("Problem getting candy machine state");
          console.log(e);
        }
      } else {
        console.log("No candy machine detected in configuration.");
      }
    })();
  }, [
    anchorWallet,
    props.candyMachineId,
    props.connection,
    props.fairLaunchId,
    contributed,
  ]);

  useEffect(() => {
    AOS.init({});
  }, []);
  return (
    <div data-aos="fade-up" data-aos-duration="1000">
      <div className="presale-soon">
        <h2>PRESALE SOON</h2>
        <h2>
          0.3
          <img src={sol} alt="" />
        </h2>
      </div>
      <div className="presale-mint">
        {/* <button className="mint-btn">Mint</button> */}
        <MintButton
          candyMachine={candyMachine}
          fairLaunch={fairLaunch}
          isMinting={isMinting}
          fairLaunchBalance={fairLaunchBalance}
          onMint={onMint}
        />
        <div className="btns-group">
          <button
            onClick={() => {
              setCount(Math.max(count - 1, 0));
            }}
            className="minus-btn"
          >
            <FaMinus className="fab fa-minus-circle" />
          </button>
          <p>{count}</p>
          <button
            onClick={() => {
              setCount(count + 1);
            }}
            className="plus-btn"
          >
            <FaPlus className="fab fa-plus-circle" />
          </button>
        </div>
      </div>
      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Mint;
