import React, { useEffect, useState } from "react";
import { Core } from "@walletconnect/core";
import { ethers } from "ethers";
import { Web3Wallet } from "@walletconnect/web3wallet";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import { Input, Button, Modal } from "antd";

import WalletConnectTransactionDisplay from "../components/WalletConnectTransactionDisplay";
import { SUPPORTED_CHAIN_IDS, NETWORKS } from "../constants";
import useUserProvider from "../hooks/UserProvider";

import useGetAddress from "../myhooks/useGetAddress";

const targetNetwork = NETWORKS.goerli; // 暂时写死一个网络
const localProvider = new ethers.providers.JsonRpcProvider(targetNetwork.rpcUrl);

const core = new Core({
  projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
});

const initWeb3wallet = async (address, userProvider) => {
  const web3wallet = await Web3Wallet.init({
    core, // <- pass the shared `core` instance
    metadata: {
      name: "Demo app",
      description: "Demo Client as Wallet/Peer",
      url: "www.walletconnect.com",
      icons: [],
    },
  });
  // 建立连接
  web3wallet.on("session_proposal", sessionProposal => handleSessionProposal(web3wallet, address, sessionProposal));

  web3wallet.on("session_request", async requestEvent => {
    console.log("session_request requestEvent", requestEvent);
    popUpTxModal(web3wallet, requestEvent, userProvider, targetNetwork.chainId);
  });

  // todo 弹出一个modal，然后去展示我们的信息
  web3wallet.on("session_update", async event => {
    console.log("session_update event", event);
  });

  web3wallet.on("session_delete", async event => {
    console.log("session_delete event", event);

    await disconnectFromWalletConnect(web3wallet);
  });
  // 监听到钱包event消息
  web3wallet.on("session_event", async event => {
    console.log("session_event", event);
  });

  web3wallet.on("session_ping", async event => {
    console.log("session_ping", event);
  });

  web3wallet.on("session_expire", async event => {
    console.log("session_expire", event);
  });

  web3wallet.on("session_extend", async event => {
    console.log("session_extend", event);
  });

  web3wallet.on("proposal_expire", async event => {
    console.log("proposal_expire", event);
  });
  return web3wallet;
};

// 处理sessionProposal, 返回一个session
const handleSessionProposal = async (web3wallet, address, sessionProposal) => {
  console.log("session_proposal", sessionProposal);

  const { id, params } = sessionProposal;

  let approvedNamespaces;

  try {
    approvedNamespaces = buildApprovedNamespaces({
      proposal: params,
      supportedNamespaces: {
        eip155: {
          chains: SUPPORTED_CHAIN_IDS().map(chainId => `eip155:${chainId}`),
          methods: [
            "eth_sendTransaction",
            "eth_signTransaction",
            "personal_sign",
            "eth_sign",
            "eth_signTypedData",
            "eth_signTypedData_v4",
          ],
          events: ["accountsChanged", "chainChanged"],
          accounts: SUPPORTED_CHAIN_IDS().map(chainId => `eip155:${chainId}:${address}`),
          // [
          // 'eip155:1:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb',
          // 'eip155:137:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb'
          // ],
        },
      },
    });
  } catch (error) {
    console.error(error);
    web3wallet.rejectSession({
      id,
      reason: getSdkError("UNSUPPORTED_CHAINS"), // Best guess, we could parse the error message to figure out the exact reason
    });
  }
  console.log(approvedNamespaces);
  // 调用sdk的建立session的方法
  await web3wallet.approveSession({
    id,
    namespaces: approvedNamespaces,
  });
};

const disconnectFromWalletConnect = async web3wallet => {
  console.log("Disconnecting from Wallet Connect 2 session");
  // Wallet Connect V2 has a lot more options than V1, we could have multiple sessions and pairings
  // But for now let's use only one session and disconnect from all sessions (there should be only one though right now)
  const topics = Object.keys(web3wallet.getActiveSessions());
  for (const topic of topics) {
    console.log("Disconnecting from session ", topic);
    web3wallet.disconnectSession({ topic, reason: getSdkError("USER_DISCONNECTED") });
  }
};

const getTitle = method => {
  // https://github.com/WalletConnect/walletconnect-test-wallet/blob/7b209c10f02014ed5644fc9991de94f9d96dcf9d/src/engines/ethereum.ts#L45-L104
  let title;
  switch (method) {
    case "eth_sendTransaction":
      title = "Send Transaction?";
      break;
    case "eth_signTransaction":
      title = "Sign Transaction?";
      break;
    case "eth_sign":
      title = "Sign Message?危险";
      break;
    case "personal_sign":
      title = "Personal Sign?";
      break;
    case "eth_signTypedData":
    case "eth_signTypedData_v4":
      title = "Sign Typed Data?";
      break;
    default:
      title = "Unknown method";
      break;
  }
  return title;
};
const popUpTxModal = (web3wallet, requestEvent, userProvider, chainId) => {
  const { topic, params, id } = requestEvent;
  const { request } = params;

  Modal.confirm({
    width: "90%",
    size: "medium",
    title: getTitle(request.method),
    content: <WalletConnectTransactionDisplay payload={request} chainId={chainId} currentlySelectedChainId={chainId} />,
    onOk: async () => {
      let result;
      const privateKey = localStorage.getItem("metaPrivateKey");
      const ethersWallet = new ethers.Wallet(privateKey);
      if (request.method === "eth_signTransaction") {
        const [requestParamsMessage] = request.params;

        if (requestParamsMessage.gas) {
          requestParamsMessage.gasLimit = requestParamsMessage.gas;
          delete requestParamsMessage.gas;
        }
        result = await ethersWallet.signTransaction(requestParamsMessage);
      } else if (request.method == "personal_sign") {
        const [requestParamsMessage] = request.params;
        const signer = userProvider.getSigner();
        let message = requestParamsMessage;
        if (ethers.utils.isHexString(message)) {
          message = ethers.utils.toUtf8String(message);
        }
        result = await signer.signMessage(message);
      } else if (request.method == "eth_sign") {
        const [address, requestParamsMessage] = request.params;
        const signer = userProvider.getSigner();
        let message = requestParamsMessage;
        if (ethers.utils.isHexString(message)) {
          message = ethers.utils.toUtf8String(message);
        }
        result = await signer.signMessage(message);
      } else if (request.method == "eth_signTypedData") {
        const [address, typedDataStr] = request.params;
        const typedData = JSON.parse(typedDataStr);
        const types = typedData.types;
        if (types.EIP712Domain) {
          delete types.EIP712Domain;
        }
        const signer = userProvider.getSigner();
        result = await signer._signTypedData(typedData.domain, types, typedData.message);
      }
      const response = { id, result, jsonrpc: "2.0" };
      web3wallet.respondSessionRequest({ topic, response });
    },
    onCancel: async () => { },
  });
};

function WalletConnectDemo() {
  const [web3Wallet, setWeb3Wallet] = useState();

  const userProvider = useUserProvider(null, localProvider);
  const address = useGetAddress(userProvider);

  useEffect(() => {
    if (!address) {
      return;
    }
    initWeb3wallet(address, userProvider).then(wallet => {
      setWeb3Wallet(wallet);
    });
  }, [address]);

  const [uri, setUri] = useState();

  const handleConnect = e => {
    web3Wallet.pair({ uri });
  };
  return (
    <div className="flex flex-row  justify-center my-11">
      <div className="flex flex-row w-9/12">
        <Input type="text" value={uri} onChange={e => setUri(e.target.value)} />
        <Button onClick={handleConnect}>connect</Button>
      </div>
    </div>
  );
}
export default WalletConnectDemo;
