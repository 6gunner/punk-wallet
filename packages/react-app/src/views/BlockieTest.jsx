import React, { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { Layout, Button } from "antd";
import { QRPunkBlockie } from "../components";
import MyFaucet from "../mycomps/MyFaucet";
import MyBalance from "../mycomps/Balance";
import WalletConnectDemo from "../mycomps/WalletConnectDemo";
import TransformAsset from "../mycomps/TransformAsset";
import { formatAddress } from "../helpers/utils";
import useGetAddress from "../myhooks/useGetAddress";
import styles from "./BlockieTest.module.css";

const { Header, Footer, Sider, Content } = Layout;

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
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className="flex-1"></div>
        <div className={styles.headerRight}>
          <span style={{ verticalAlign: "middle", paddingLeft: 8, fontSize: 28, color: "white" }}>
            {formatAddress(walletAddress)}
          </span>
          {
            walletAddress ?
              <Button onClick={() => disconnectWallet()} className="border  bg-slate-50 px-1">disconnect</Button>
              :
              <Button onClick={() => connectWallet()} className="border bg-slate-50 px-1">connect</Button>
          }
        </div>
      </Header>
      <Content >
        <MyBalance address={walletAddress} provider={injectedProvider}></MyBalance>

        <div className="my-6">
          <QRPunkBlockie withQr address={walletAddress} showAddress />
        </div>

        <MyFaucet localProvider={localProvider}></MyFaucet>

        <TransformAsset provider={injectedProvider}>

        </TransformAsset>

        <WalletConnectDemo></WalletConnectDemo>
      </Content >

    </Layout >
  );
}

export default BlockieTestPage;
