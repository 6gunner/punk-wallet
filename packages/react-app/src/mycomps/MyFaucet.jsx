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
    <div>
      <h1 className="text-center">
        <i className="fa fa-bath" aria-hidden="true" /> Local Smart Chain Faucet
      </h1>
      <div className="flex">
        <input type="text" value={value} onChange={handleChange} placeholder="input your address" />
        <button type="button" onClick={() => requestFacuet()}>
          Give me ETH
        </button>
      </div>
    </div>
  );
}

export default MyFaucet;
