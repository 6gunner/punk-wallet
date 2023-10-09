import React from "react";
import Blockies from "react-blockies";

// 利用地址创造出方格头像
// provides a blockie image for the address using "react-blockies" library

export default function Blockie(props) {
  if (!props.address || typeof props.address.toLowerCase !== "function") {
    return <span />;
  }
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Blockies seed={props.address.toLowerCase()} {...props} />;
}
