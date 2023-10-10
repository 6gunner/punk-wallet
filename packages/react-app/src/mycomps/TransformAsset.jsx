import React, { useState } from "react";
import { Input, Button } from "antd";
import { CameraOutlined, QrcodeOutlined } from "@ant-design/icons";

import QrReader from "react-qr-reader-es6";
import { ethers } from "ethers";
import { abi } from "../helpers/ERC20Helper";

function TransformAsset(props) {
  const [scan, setScan] = useState(false);

  const startScan = () => {
    setScan(true);
  };
  const [receiveAddress, setReceiveAddress] = useState("");

  const handleScan = newValue => {
    console.log(newValue);
    if (newValue) {
      let possibleNewValue = newValue;
      possibleNewValue = possibleNewValue.replace("ethereum:", "");
      possibleNewValue = possibleNewValue.replace("eth:", "");

      console.log("possibleNewValue", possibleNewValue);
      if (possibleNewValue.indexOf("/") >= 0) {
        possibleNewValue = possibleNewValue.substr(possibleNewValue.lastIndexOf("0x"));
        console.log("CLEANED VALUE", possibleNewValue);
      }
      if (possibleNewValue.indexOf("@") >= 0) {
        possibleNewValue = possibleNewValue.substring(0, possibleNewValue.indexOf("@"));
        console.log("CLEANED VALUE", possibleNewValue);
      }
      setScan(false);
      setReceiveAddress(possibleNewValue);
    }
  };

  const handleError = err => {
    console.error(err);
  };

  const onChange = e => {
    setReceiveAddress(e.target.value);
  };

  const [mode, setMode] = useState("USDT");

  const addonAfter = title => {
    return (
      <div
        style={{ cursor: "pointer" }}
        onClick={() => {
          if (mode === "USDT") {
            setMode("ETH");
          } else if (mode === "ETH") {
            setMode("USDT");
          }
        }}
      >
        {title}
      </div>
    );
  };

  const [amount, setAmount] = useState();
  const transfer = async event => {
    const provider = props.provider;
    const signer = provider.getSigner();
    if (mode == "ETH") {
      const value = ethers.utils.parseEther(amount.toString());
      console.log(value);
      await signer.sendTransaction({
        to: receiveAddress,
        value,
      });
    } else if (mode == "USDT") {
      const usdtAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // local usdt
      const contractInstance = new ethers.Contract(usdtAddress, abi, signer);
      const decimal = await contractInstance.decimals();
      const decimalAmount = ethers.utils.parseUnits(amount.toString(), decimal);
      try {
        const txId = await contractInstance.transfer(receiveAddress, decimalAmount);
        console.log(txId);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="my-4 flex flex-col items-center">
      <h2 className="text-lg">Transfrom Assets</h2>
      <div className="flex flex-row justify-center w-10/12 ">
        <Input type="text" placeholder="输入转账地址" value={receiveAddress} onChange={onChange} />
        {scan ? (
          <div className="absolute top-0 bottom-0 left-0 right-0 m-auto w-96 h-96">
            <QrReader delay={250} resolution={1200} onScan={handleScan} />
          </div>
        ) : (
          <Button onClick={startScan}>
            <QrcodeOutlined style={{ color: "#000000", fontSize: 18 }} />
            scan
          </Button>
        )}
      </div>
      <div className="flex flex-row justify-center w-10/12 my-5">
        <Input
          placeholder={"amount in " + mode}
          addonAfter={addonAfter(mode + " 🔀")}
          onChange={e => {
            setAmount(e.target.value);
          }}
          value={amount}
        />
      </div>

      <Button onClick={transfer}>Send</Button>
    </div>
  );
}

export default TransformAsset;
