import { useEffect, useState } from "react";

function useGetAddress(provider) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const fetchUserAddress = async () => {
      const signer = provider.getSigner();
      if (signer) {
        const address = await signer.getAddress();
        setValue(address);
      }

      // debugger;
      // const accounts = await provider.listAccounts();
      // if (accounts && accounts.size) {
      //   setValue(accounts[0]);
      // }
    };
    if (provider) {
      fetchUserAddress();
    }
  }, [provider]);

  return value;
}

export default useGetAddress;
