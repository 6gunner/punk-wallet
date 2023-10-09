import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import usePoller from "./usePoller";

function useGetBalance(address, provider, pollerTime) {
  const [balance, setBalance] = useState(0);

  const fetchBalance = useCallback(async () => {
    const val = await provider.getBalance(address);
    setBalance(ethers.utils.formatEther(val));
  }, [address, provider]);

  useEffect(() => {
    if (address && provider) {
      fetchBalance();
    }
  }, [fetchBalance]);

  usePoller(async () => {
    if (provider && pollerTime > 0 && address) {
      fetchBalance();
    }
  }, pollerTime);

  useEffect(() => {
    if (!pollerTime && address && provider) {
      const listener = val => {
        console.log("New Block: " + val);
        fetchBalance();
      };
      provider.on("block", listener);
      return () => {
        provider.off("block", listener);
      };
    }
  }, [pollerTime, address, provider]);

  return balance;
}

export default useGetBalance;
