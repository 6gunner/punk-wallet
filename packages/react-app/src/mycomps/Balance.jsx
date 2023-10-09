import React from "react";
import useGetBalance from "../myhooks/useGetBalance";

function MyBalance(props) {
  const balance = useGetBalance(props.address, props.provider);
  return (
    <div>
      <span>{balance}</span>
    </div>
  );
}

export default MyBalance;
