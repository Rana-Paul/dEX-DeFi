import React from "react";
import logo from "../assets/logo.png";
import eth from "../assets/eth.svg";
import { useDispatch, useSelector } from "react-redux";
import Blockies from "react-blockies";
import { loadAccount } from "../store/interaction";

import config from "../config.json";


function Navbar() {
  const provider = useSelector((state) => state.provider.connection);
  const chainId = useSelector((state) => state.provider.chainId);
  const account = useSelector((state) => state.provider.account);
  const balance = useSelector((state) => state.provider.balance);

  const dispatch = useDispatch();

  const connectHandeler = async () => {
    //Load Account
    await loadAccount(dispatch, provider);
  };

  const networkHandeler = async (e) => {
    //Load Account
    console.log(e.target.value);
    window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{chainId: e.target.value}]
    })
  };
  return (
    <div className="exchange__header grid">
      <div className="exchange__header--brand flex">
        <img src={logo} alt="logo" className="logo" />
        <h1>Dapp Token Exchange</h1>
      </div>

      <div className="exchange__header--networks flex">
        <img src={eth} alt="ETH LOGO" className="Eth Logo" />
        {chainId && (
        <select name="neworks" id="networks" value={config[chainId] ? `0x${chainId}` : `0x5`} onChange={networkHandeler}>
          <option value="0x7A69" >
            Localhost
          </option>
          <option value="0x5" >
            Goerli
          </option>
        </select>
        )}
      </div>

      <div className="exchange__header--account flex">
        {balance ? (
          <p>
            <small>My Balance</small>
            {Number(balance).toFixed(4)}
          </p>
        ) : (
          <p>
            <small>My Balance</small>0 ETH
          </p>
        )}

        {account ? (
          <a 
          href={config[chainId] ? `${config[chainId].explorerURL}/address/${account}` : '#'}
          target='_blank'
          rel="noreferre"
          >
            {account.slice(0, 5) + "..." + account.slice(38, 42)}
            <Blockies
              account={account}
              className="identicon"
              size={10}
              scale={3}
              color="#2187D0"
              bgColor="#F1F2F9"
              spotColor="#767F92"
            />
          </a>
        ) : (
          <button className="button" onClick={() => connectHandeler()}>
            Connect
          </button>
        )}
      </div>
    </div>
  );
}

export default Navbar;
