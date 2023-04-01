//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;
    uint256 public orderCount;

    // Orders structure
    struct _Order {
        uint256 id; //unique id for order
        address user; //who made  order
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
    }

    mapping(address => mapping(address => uint256)) public tokens;
    // tokenAdd -> userAdd -> how many tokens are depoit

    //Order mapping
    mapping(uint256 => _Order) public orders;

    // Cancel order maping
    mapping(uint256 => bool) public orderFilled;

    // Filled order maping
    mapping(uint256 => bool) public orderCancelled;

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );
    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Cancel(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Trade(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address creator,
        uint256 timestamp
    );

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // Deposit & Withdraw Token

    function depositToken(address _token, uint256 _amount) public {
        // Transfer tokens to exchange
        require(Token(_token).trasferFrom(msg.sender, address(this), _amount));

        //update user balance
        tokens[_token][msg.sender] += _amount;

        // emit event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
        // Ensure user has enough tokens to withdraw
        require(tokens[_token][msg.sender] >= _amount);

        //transfer token to user
        Token(_token).transfer(msg.sender, _amount);

        //update user balance
        tokens[_token][msg.sender] -= _amount;

        //emit event
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    // Check Balance

    function balanceOf(address _token, address _user)
        public
        view
        returns (uint256)
    {
        return tokens[_token][_user];
    }

    // Make & Cancel orders

    function makeOrder(
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) public {
        require(
            balanceOf(_tokenGive, msg.sender) >= _amountGive,
            "insufficien balance"
        );
        orderCount++;
        //token give (the token they want to spent) - which token,how much?
        //token get (the token they want to recive) - which token,how much?

        orders[orderCount] = _Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
        emit Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
    }

    function cancelOrder(uint256 _id) public {
        // Fetch Order
        _Order storage _order = orders[_id];

        require(
            address(_order.user) == msg.sender,
            "You have no right to cancel  the order"
        );

        // order must exist
        require(_order.id == _id, "order does not exist");

        // Cancel the Order
        orderCancelled[_id] = true;

        emit Cancel(
            _order.id,
            msg.sender,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive,
            block.timestamp
        );
    }

    // EXCUTING ORDER

    function fillOrder(uint256 _id) public {
        require(_id > 0 &&_id <= orderCount, "Order does not exist");
        require(!orderFilled[_id], "Order is already filled");
        require(!orderCancelled[_id], "Order is cancelled");
        // Fetch Order
        _Order storage _order = orders[_id];

        // Swapping token
        _trade(
            _order.id,
            _order.user,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive
        );

        orderFilled[_order.id] = true;
    }

    function _trade(
        uint256 _orderId,
        address _user,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) internal {
        // Fee is paid by the user who filed the order (msg.sender)
        // Fee is deducted from _amountGet
        // user is who create the order
        uint256 _feeAmount = (_amountGet * feePercent) / 100;

        tokens[_tokenGet][msg.sender] -= (_amountGet + _feeAmount);
        tokens[_tokenGet][_user] += _amountGet;

        // Charge fee
        tokens[_tokenGet][feeAccount] += _feeAmount;

        tokens[_tokenGive][_user] -= _amountGive;
        tokens[_tokenGive][msg.sender] += _amountGive;

        emit Trade(
            _orderId,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            _user,
            block.timestamp
        );
    }
}
