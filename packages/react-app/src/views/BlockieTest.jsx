import React, { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";

import { QRPunkBlockie } from "../components";
import MyFaucet from "../mycomps/MyFaucet";
import MyBalance from "../mycomps/Balance";
import useGetAddress from "../myhooks/useGetAddress";

const autoConnect = false;

function BlockieTestPage(props) {
  const [injectedProvider, setInjectedProvider] = useState();
  const [cachedProviderId, setCachedProviderId] = useState(localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER"));
  const walletAddress = useGetAddress(injectedProvider);

  const connectWallet = useCallback(async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    setInjectedProvider(provider);
    setCachedProviderId("injected");
    localStorage.setItem("WEB3_CONNECT_CACHED_PROVIDER", "injected");
  }, [setInjectedProvider, setCachedProviderId]);

  const disconnectWallet = async () => {
    if (injectedProvider && injectedProvider.provider && injectedProvider.provider.disconnect) {
      await injectedProvider.provider.disconnect();
      setInjectedProvider();
      setCachedProviderId();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  useEffect(() => {
    if (autoConnect) {
      connectWallet();
    }
  }, []);

  useEffect(() => {
    if (cachedProviderId) {
      connectWallet();
    }
  }, []);

  function handleAccountsChanged(accounts) {
    // Handle new accounts, or lack thereof.
    console.log(accounts);
    debugger;
    setTimeout(() => {
      window.location.reload();
    }, 1);
  }
  /* eslint-disable */


  useEffect(() => {
    window.ethereum &&
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    }
  }, []);

  const localProvider = new ethers.providers.JsonRpcProvider();

  return (
    <div>
      <div>
        <span style={{ verticalAlign: "middle", paddingLeft: 8, fontSize: props.fontSize ? props.fontSize : 28 }}>
          {walletAddress}
        </span>
        <MyBalance address={walletAddress} provider={injectedProvider}></MyBalance>
        {
          walletAddress ?
            <button onClick={() => disconnectWallet()}>disconnect</button>
            :
            <button onClick={() => connectWallet()}>connect</button>
        }
      </div>
      <QRPunkBlockie withQr address={walletAddress} showAddress />

      <MyFaucet localProvider={localProvider}></MyFaucet>

    </div>
  );
}

export default BlockieTestPage;
