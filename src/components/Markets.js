import React from "react";
import config from "../config.json";
import { useDispatch, useSelector } from "react-redux";
import { loadTokens } from "../store/interaction";

function Markets() {
    const provider = useSelector(state => state.provider.connection);
    const chainId = useSelector((state) => state.provider.chainId);
    const dispatch = useDispatch();


    const marketHandeler = async(e) => {
        let addresses = (e.target.value).split(',');
        console.log(addresses);
        await loadTokens(provider,addresses,dispatch)

    }
  return (
    <div className="component exchange__markets">
      <div className="component__header">
        <h2>Select Market</h2>
      </div>
      <select name="markets" id="markets" onChange={marketHandeler}>
        {chainId && config[chainId] ? (
          <>
            <option
              value={`${config[chainId].DApp.address},${config[chainId].mETH.address}`}
            >
              Dapp / mETH
            </option>

            <option
              value={`${config[chainId].DApp.address},${config[chainId].mDAI.address}`}
            >
              Dapp / mDAI
            </option>
          </>
        ) : (
          <div>Not Deploy to Network</div>
        )}
      </select>

      <hr />
    </div>
  );
}

export default Markets;
