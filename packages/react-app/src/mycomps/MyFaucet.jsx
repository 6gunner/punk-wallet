import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

function MyFaucet(props) {
  const [value, setValue] = useState("");

  const requestFacuet = async () => {
    debugger;
    if (!value) {
      return;
    }

    if (props.localProvider) {
      const tx = {
        to: value,
        value: ethers.utils.parseEther("0.01"),
      };
      const signer = props.localProvider.getSigner();
      const txId = await signer.sendTransaction(tx);
      console.log(txId);
    }
  };

  const handleChange = event => {
    setValue(event.target.value);
  };

  return (
    <div className="flex flex-col align-middle">
      <h1 className="text-4xl font-black text-center">
        <i className="fa fa-bath" aria-hidden="true" /> Local Smart Chain Faucet
      </h1>
      <div className="flex flex-row justify-center">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="input your address"
          className="border h-8 w-56 px-1"
        />
        <button type="button" onClick={() => requestFacuet()} className="border bg-slate-50 px-1">
          Give me ETH
        </button>
      </div>
    </div>
  );
}

export default MyFaucet;
