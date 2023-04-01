import { ethers } from "ethers";
import TOKEN_ABI from "../contracts/Token.sol/Token.json";
import EXCHANGE_ABI from "../contracts/Exchange.sol/Exchange.json";

export const loadProvider = (dispatch) => {
  const connection = new ethers.providers.Web3Provider(window.ethereum);
  dispatch({ type: "PROVIDER_LOADED", connection: connection });
  return connection;
};

export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork();
  dispatch({ type: "NETWORK_LOADED", chainId: chainId });
  return chainId;
};

export const loadAccount = async (dispatch, provider) => {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const account = accounts[0];
  dispatch({ type: "ACCOUNT_LOADED", account: account });

  let balance = await provider.getBalance(account);
  balance = ethers.utils.formatEther(balance);
  dispatch({ type: "ETHER_BALANCE_LOADED", balance: balance });

  return { account, balance };
};

export const loadTokens = async (provider, addresses, dispatch) => {
  let token, symbol;

  token = new ethers.Contract(addresses[0], TOKEN_ABI.abi, provider);
  symbol = await token.symbol();
  dispatch({ type: "TOKEN_1_LOADED", token, symbol });

  token = new ethers.Contract(addresses[1], TOKEN_ABI.abi, provider);
  symbol = await token.symbol();
  dispatch({ type: "TOKEN_2_LOADED", token, symbol });

  return token;
};

export const loadExchange = async (provider, address, dispatch) => {
  const exchange = new ethers.Contract(address, EXCHANGE_ABI.abi, provider);
  dispatch({ type: "EXCHANGE_LOADED", exchange });
  return exchange;
};

export const loadBalances = async (exchange, tokens, account, dispatch) => {
  let balance = ethers.utils.formatUnits(
    await tokens[0].balanceOf(account),
    18
  );
  dispatch({ type: "TOKEN_1_BALANCE_LOADED", balance });

  balance = ethers.utils.formatUnits(
    await exchange.balanceOf(tokens[0].address, account),
    18
  );
  dispatch({ type: "EXCHNGE_TOKE_1_BALANCE_LOADED", balance });

  balance = ethers.utils.formatUnits(await tokens[1].balanceOf(account), 18);
  dispatch({ type: "TOKEN_2_BALANCE_LOADED", balance });

  balance = ethers.utils.formatUnits(
    await exchange.balanceOf(tokens[1].address, account),
    18
  );
  dispatch({ type: "EXCHNGE_TOKE_2_BALANCE_LOADED", balance });
};

// Notify Events
export const subscribeToEvent = (exchange, dispatch) => {
  exchange.on("Trade", (id,user,tokenGet,amountGet,tokenGive,amountGive,creator,timestamp,event) => {
    const order = event.args;
    dispatch({ type: "ORDER_FILL_SUCCESS", order, event });
  });
  exchange.on("Cancel", (id,user,tokenGet,amountGet,tokenGive,amountGive,timestamp,event) => {
    const order = event.args;
    dispatch({ type: "ORDER_CANCEL_SUCCESS", order, event });
  });
  exchange.on("Deposit", (token, user, amount, balance, event) => {
    dispatch({ type: "TRANSFER_SUCCESS", event });
  });

  exchange.on("Withdraw", (token, user, amount, balance, event) => {
    dispatch({ type: "TRANSFER_SUCCESS", event });
  });

  exchange.on(
    "Order",(id,user,tokenGet,amountGet,tokenGive,amountGive,timestamp,event) => {
      const order = event.args;
      dispatch({ type: "NEW_ORDER_SUCCESS", order, event });
    }
  );
};

// Tokens transfer deposit  & withdraws
export const transferTokens = async (
  provider,
  exchange,
  transferType,
  token,
  amount,
  dispatch
) => {
  let transacton;

  dispatch({ type: "TRANSFER_REQUEST" });
  try {
    const singer = await provider.getSigner();
    const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18);

    if (transferType === "Deposit") {
      transacton = await token
        .connect(singer)
        .approve(exchange.address, amountToTransfer);
      await transacton.wait();
      transacton = await exchange
        .connect(singer)
        .depositToken(token.address, amountToTransfer);
      await transacton.wait();
    } else {
      transacton = await exchange
        .connect(singer)
        .withdrawToken(token.address, amountToTransfer);
    }

    await transacton.wait();
  } catch (error) {
    dispatch({ type: "TRANSFET_FAIL" });
  }
};

// Orders buy & sell
export const makeBuyOrder = async (
  provider,
  exchange,
  tokens,
  order,
  dispatch
) => {
  let transacton;

  const tokenGet = tokens[0].address;
  const amountGet = ethers.utils.parseUnits(order.amount, 18);

  const tokenGive = tokens[1].address;
  const amountGive = ethers.utils.parseUnits(
    (order.amount * order.price).toString(),
    18
  );

  dispatch({ type: "NEW_ORDER_REQUEST" });

  try {
    const singer = await provider.getSigner();

    transacton = await exchange
      .connect(singer)
      .makeOrder(tokenGet, amountGet, tokenGive, amountGive);
    await transacton.wait();

    await transacton.wait();
  } catch (error) {
    dispatch({ type: "NEW_ORDER_FAIL" });
  }
};
export const makeSellOrder = async (
  provider,
  exchange,
  tokens,
  order,
  dispatch
) => {
  let transacton;

  const tokenGet = tokens[1].address;
  const amountGet = ethers.utils.parseUnits(
    (order.amount * order.price).toString(),
    18
  );

  const tokenGive = tokens[0].address;
  const amountGive = ethers.utils.parseUnits(order.amount, 18);

  dispatch({ type: "NEW_ORDER_REQUEST" });

  try {
    const singer = await provider.getSigner();

    transacton = await exchange
      .connect(singer)
      .makeOrder(tokenGet, amountGet, tokenGive, amountGive);
    await transacton.wait();

    await transacton.wait();
  } catch (error) {
    dispatch({ type: "NEW_ORDER_FAIL" });
  }
};

// Load all orders / Query Orders

export const loadAllOrders = async (provider, exchange, dispatch) => {
  const block = await provider.getBlockNumber();

  //Fetch Cancel Orders
  const cancelStream = await exchange.queryFilter("Cancel", 0, block);
  const cancelledOrders = cancelStream.map((event) => event.args);

  dispatch({ type: "CANCELLED_ORDERS_LOADED", cancelledOrders });

  //Fetch Filled Orders
  const tradeStream = await exchange.queryFilter("Trade", 0, block);
  const filledOrders = tradeStream.map((event) => event.args);

  dispatch({ type: "FILLED_ORDERS_LOADED", filledOrders });

  //Fetch all orders
  const orderStream = await exchange.queryFilter("Order", 0, block);
  const allOrders = orderStream.map((event) => event.args);

  dispatch({ type: "ALL_ORDERS_LOADED", allOrders });
};

// Cancel Orders

export const cancelOrder = async (provider, exchange, order, dispatch) => {
  dispatch({ type: "ORDER_CANCEL_REQUEST" });

  try {
    const singer = await provider.getSigner();

    const transacton = await exchange.connect(singer).cancelOrder(order.id);
    await transacton.wait();
  } catch (error) {
    dispatch({ type: "ORDER_CANCEL_FAIL" });
  }
};

// Fill Orders

export const fillOrder = async (provider, exchange, order, dispatch) => {
  dispatch({ type: "ORDER_FILL_REQUEST" });

  try {
    const singer = await provider.getSigner();

    const transacton = await exchange.connect(singer).fillOrder(order.id);
    await transacton.wait();
  } catch (error) {
    dispatch({ type: "ORDER_FILL_FAIL" });
  }
};
