import React from "react";
import useGetBalance from "../myhooks/useGetBalance";

function MyBalance(props) {
  const balance = useGetBalance(props.address, props.provider);
  return (
    <div>
      <span className="text-center text-9xl font-bold">{balance}</span>
    </div>
  );
}

export default MyBalance;
