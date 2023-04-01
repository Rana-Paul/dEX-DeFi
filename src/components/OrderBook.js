import React from "react";
import { useDispatch, useSelector } from "react-redux";
import sort from "../assets/sort.svg";
import { fillOrder } from "../store/interaction";
import { orderBookSelector } from "../store/selectors";
function OrderBook() {
  const symbols = useSelector((state) => state.tokens.symbols);

  const orderBook = useSelector(orderBookSelector);
  const exchange = useSelector(state => state.exchange.contract);
  const provider = useSelector(state => state.provider.connection);
  const dispatch = useDispatch();


  const fillOrderHandler = (order) => {
    fillOrder(provider, exchange, order, dispatch);
  }

  return (
    <div className="component exchange__orderbook">
      <div className="component__header flex-between">
        <h2>Order Book</h2>
      </div>

      <div className="flex">

        {/* Sell Orders */}
        {!orderBook || orderBook.sellOrders.length === 0 ? (
          <p className="flex-center">No Sell Orders</p>
        ) : (
          <table className="exchange__orderbook--sell">
            <caption>Selling</caption>
            <thead>
              <tr>
                <th>
                  {symbols && symbols[0]}
                  <img src={sort} alt="Sort" />
                </th>
                <th>
                  {symbols && symbols[0]}/{symbols && symbols[1]}
                  <img src={sort} alt="Sort" />
                </th>
                <th>
                  {symbols && symbols[1]}
                  <img src={sort} alt="Sort" />
                </th>
              </tr>
            </thead>
            <tbody>
              {orderBook &&
                orderBook.sellOrders.map((order, index) => {
                  return (
                    <tr key={index} onClick={() => fillOrderHandler(order)}>
                      <td>{order.token0Amount}</td>
                      <td style={{ color: '#F45353' }}>
                        {order.tokenPrice}
                      </td>
                      <td>{order.token1Amount}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}

        <div className="divider"></div>

        {/* Buy Orders */}

        {!orderBook || orderBook.buyOrders.length === 0 ? (
          <p className="flex-center">No Buy Orders</p>
        ) : (
          <table className="exchange__orderbook--buy">
            <caption>Buying</caption>
            <thead>
              <tr>
                <th>
                  {symbols && symbols[0]}
                  <img src={sort} alt="Sort" />
                </th>
                <th>
                  {symbols && symbols[0]}/{symbols && symbols[1]}
                  <img src={sort} alt="Sort" />
                </th>
                <th>
                  {symbols && symbols[1]}
                  <img src={sort} alt="Sort" />
                </th>
              </tr>
            </thead>
            <tbody>

            {orderBook &&
                orderBook.buyOrders.map((order, index) => {
                  return (
                    <tr key={index} onClick={() => fillOrderHandler(order)}>
                      <td>{order.token0Amount}</td>
                      <td style={{ color: '#25CE8F' }}>
                        {order.tokenPrice}
                      </td>
                      <td>{order.token1Amount}</td>
                    </tr>
                  );
                })}
              
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default OrderBook;
