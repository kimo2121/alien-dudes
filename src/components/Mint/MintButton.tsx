import styled from "styled-components";
import Button from "@material-ui/core/Button";
import { CandyMachineAccount } from "../../utils/candy-machine";
import { FairLaunchAccount } from "../../utils/fair-launch";
import { CircularProgress } from "@material-ui/core";
import { GatewayStatus, useGateway } from "@civic/solana-gateway-react";
import { useEffect, useState } from "react";

export const CTAButton = styled(Button)`
  font-size: 60px !important;
  text-transform: uppercase !important ;
  color: #000 !important ;
  position: relative !important ;
  font-family: "classic_robotregular" !important ;
  background: #71fb73 !important ;
  padding: 0px 30px !important ;
  border-radius: 71px !important ;
  line-height: 65px !important ;
  margin-right: 20px !important ;
  width: 213px !important ;
  cursor: pointer !important ;
  height: 65px !important ;
  @media screen and (max-width: 1400px) {
    font-size: 50px !important ;
    width: 188px !important ;
  }
  @media screen and (max-width: 1200px) {
    font-size: 40px !important ;
    width: 162px !important ;
  }
  @media screen and (max-width: 990px) {
    font-size: 30px !important ;
    width: 177px !important ;
    height: 60px !important ;
  }
  @media screen and (max-width: 576px) {
    margin-right: 0 !important ;
  }
`; // add your styles here

export const MintButton = ({
  onMint,
  candyMachine,
  fairLaunch,
  isMinting,
  fairLaunchBalance,
}: {
  onMint: () => Promise<void>;
  candyMachine: CandyMachineAccount | undefined;
  fairLaunch?: FairLaunchAccount | undefined;
  isMinting: boolean;
  fairLaunchBalance: number;
}) => {
  const { requestGatewayToken, gatewayStatus } = useGateway();
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (gatewayStatus === GatewayStatus.ACTIVE && clicked) {
      console.log("Minting");
      onMint();
      setClicked(false);
    }
  }, [gatewayStatus, clicked, setClicked, onMint]);
  return (
    <CTAButton
      disabled={
        candyMachine?.state.isSoldOut ||
        isMinting ||
        !candyMachine?.state.isActive ||
        (fairLaunch?.ticket?.data?.state.punched && fairLaunchBalance === 0)
      }
      onClick={async () => {
        setClicked(true);
        if (candyMachine?.state.isActive && candyMachine?.state.gatekeeper) {
          if (gatewayStatus === GatewayStatus.ACTIVE) {
            setClicked(true);
          } else {
            await requestGatewayToken();
          }
        } else {
          await onMint();
          setClicked(false);
        }
      }}
      variant="contained"
    >
      {fairLaunch?.ticket?.data?.state.punched && fairLaunchBalance === 0 ? (
        "MINTED"
      ) : candyMachine?.state.isSoldOut ? (
        "SOLD OUT"
      ) : isMinting ? (
        <CircularProgress />
      ) : (
        "MINT"
      )}
    </CTAButton>
  );
};
