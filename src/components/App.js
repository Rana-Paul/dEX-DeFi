import { useEffect } from "react";
import "../App.css";
import config from "../config.json";
import { useDispatch } from "react-redux";

import {
  loadAccount,
  loadAllOrders,
  loadExchange,
  loadNetwork,
  loadProvider,
  loadTokens,
  subscribeToEvent
} from "../store/interaction";
import Navbar from "./Navbar";
import Markets from "./Markets";
import Balance from "./Balance";
import Order from "./Order";
import OrderBook from "./OrderBook";
import PriceChart from "./PriceChart";
import Trades from "./Trades";
import Transactions from "./Transactions";
import Alert from "./Alert";


function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const loadBlockchainData = async () => {
    // Connect ether to blockchain
    const provider = loadProvider(dispatch);
    const chainId = await loadNetwork(provider, dispatch);

    //Rload page when network change
    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

    // fetch current account & balancefrom metamask

    window.ethereum.on('accountsChanged', () => {
      loadAccount(dispatch, provider);
    })

    //  Dapp Token Smart Contract
    await loadTokens(
      provider,
      [config[chainId].DApp.address, config[chainId].mETH.address],
      dispatch
    );

    // Load Exchange
    const exchange = await loadExchange(
      provider,
      config[chainId].exchange.address,
      dispatch
    );

    //Fetch all  orders
    loadAllOrders(provider, exchange, dispatch)
    
    // Listen to Event
    subscribeToEvent(exchange, dispatch)
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar />

      <main className="exchange grid">
        <section className="exchange__section--left grid">
          {/* Markets */}
          <Markets />

          {/* Balance */}
          <Balance />

          {/* Order */}
          <Order />
        </section>
        <section className="exchange__section--right grid">
          {/* PriceChart */}
          <PriceChart />

          {/* My Transactions */}
          <Transactions />
          

          {/* Trades */}
          <Trades />

          {/* OrderBook */}
          <OrderBook />
        </section>
      </main>

      {/* Alert */}
      <Alert />
    </div>
  );
}

export default App;
