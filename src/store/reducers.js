export const provider = (state = {}, action) => {
    switch (action.type) {
        case 'PROVIDER_LOADED':
            return{
                ...state,
                connection: action.connection
            }

        case 'NETWORK_LOADED':
            return{
                ...state,
                chainId: action.chainId
            }
        case 'ACCOUNT_LOADED':
            return{
                ...state,
                account: action.account
            }
        case 'ETHER_BALANCE_LOADED':
            return{
                ...state,
                balance: action.balance
            }
        default:
            return state
    }

}

const DEFAULT_TOKENS_STATE = {
    loaded: false,
    contracts: [],
    symbols: []
}

export const tokens = (state = DEFAULT_TOKENS_STATE, action) => {
    switch (action.type) {
        case 'TOKEN_1_LOADED':
            return{
                ...state,
                loaded: true,
                contracts: [action.token],
                symbols: [action.symbol]
            }
        case 'TOKEN_1_BALANCE_LOADED':
            return{
                ...state,
                balances: [action.balance]
            }
        case 'TOKEN_2_LOADED':
            return{
                ...state,
                loaded: true,
                contracts: [...state.contracts, action.token],
                symbols: [...state.symbols, action.symbol]
            }
        case 'TOKEN_2_BALANCE_LOADED':
            return{
                ...state,
                balances: [...state.balances, action.balance]                
            }
       
        default:
            return state
    }

}

const DEFAULT_EXCHANGE_STATE = { 
    loaded: false,
    contract: {},
    transaction: {isSuccessful: false},
    allOrders: {
        loaded: false,
        data: []
    },
    events: [],

    filledOrders: {
        data: []
    },
    cancelledOrders: {
        data: []
    },

}

export const exchange = (state = DEFAULT_EXCHANGE_STATE, action) => {
    let index, data

    switch (action.type) {
        case 'EXCHANGE_LOADED':
            return{
                ...state,
                loaded: true,
                contract: action.exchange,
            }
            // Load all orders
        case 'ALL_ORDERS_LOADED':
            return{
                ...state,
                allOrders: {
                    loaded: true,
                    data: action.allOrders
                },
            }

            //Order cancel request
        case 'ORDER_CANCEL_REQUEST':
            return{
                ...state,
                transaction: {
                    transactionType: 'Cancel',
                    isPending: true,
                    isSuccessful: false
                },
            }

            //Order cancel Success
        case 'ORDER_CANCEL_SUCCESS':
            return{
                ...state,
                transaction: {
                    transactionType: 'Cancel',
                    isPending: false,
                    isSuccessful: true
                },
                cancelledOrders: {
                    ...state.cancelledOrders,
                    data: [
                        ...state.cancelledOrders.data,
                        action.order
                    ]
                },
                events: [action.event, ...state.events]
            }

            //Order cancel fail
            case 'ORDER_CANCEL_FAIL':
            return{
                ...state,
                transaction: {
                    transactionType: 'Cancel',
                    isPending: false,
                    isSuccessful: false,
                    isError: true
                },
            }

            // Filling orders
            case 'ORDER_FILL_REQUEST':
            return{
                ...state,
                transaction: {
                    transactionType: 'Fill Order',
                    isPending: true,
                    isSuccessful: false,
                }
            }
            case 'ORDER_FILL_SUCCESS':
                index = state.filledOrders.data.findIndex(order => order.id.toString() === action.order.id.toString());
                if (index === -1) {
                    data = [...state.filledOrders.data, action.order]
                } else {
                    data = state.filledOrders.data                    
                }
            return{
                ...state,
                transaction: {
                    transactionType: 'Fill Order',
                    isPending: false,
                    isSuccessful: true,
                },
                filledOrders: {
                    ...state.filledOrders,
                    data
                },
                events: [action.event, ...state.events]
            }

            case 'ORDER_FILL_FAIL':
            return{
                ...state,
                transaction: {
                    transactionType: 'Fill Order',
                    isPending: false,
                    isSuccessful: false,
                    isError: true
                }
            }

            
            
        case 'CANCELLED_ORDERS_LOADED':
            return{
                ...state,
                cancelledOrders: {
                    loaded: true,
                    data: action.cancelledOrders
                },
            }
        case 'FILLED_ORDERS_LOADED':
            return{
                ...state,
                filledOrders: {
                    loaded: true,
                    data: action.filledOrders
                },
            }

        case 'EXCHNGE_TOKE_1_BALANCE_LOADED':
            return{
                ...state,
                balances: [action.balance]
            }
        case 'EXCHNGE_TOKE_2_BALANCE_LOADED':
            return{
                ...state,
                balances: [...state.balances, action.balance]
            }

        // Transaction
        case 'TRANSFER_REQUEST':
            return{
                ...state,
                transaction: {
                    transactionType: 'Transfer',
                    isPending: true,
                    isSuccessful: false
                },
                transferInProgress: true,
                events: [action.event, ...state.events ]
            }
        case 'TRANSFER_SUCCESS':
            return{
                ...state,
                transaction: {
                    transactionType: 'Transfer',
                    isPending: false,
                    isSuccessful: true
                },
                transferInProgress: false
            }
        case 'TRANSFET_FAIL':
            return{
                ...state,
                transaction: {
                    transactionType: 'Transfer',
                    isPending: false,
                    isSuccessful: false,
                    isError: true
                },
                transferInProgress: false
            }

            //Making orders
        case 'NEW_ORDER_REQUEST':
            return{
                ...state,
                transaction: {
                    transactionType: 'New Order',
                    isPending: true,
                    isSuccessful: false,
                },
            }

        case 'NEW_ORDER_SUCCESS':
            // Prevent Duplicate Orders

            index = state.allOrders.data.findIndex(order => order.id.toString() === action.order.id.toString());

            if(index === -1){
                data = [...state.allOrders.data, action.order]
            }
            else{
                data = state.allOrders.data
            }
            return{
                ...state,
                allOrders: {
                    ...state.allOrders,
                    data
                },
                transaction: {
                    transactionType: 'New Order',
                    isPending: false,
                    isSuccessful: true,
                },
                events: [action.event, ...state.events]

                // prevent duplicate order
            }
        case 'NEW_ORDER_FAIL':
            return{
                ...state,
                transaction: {
                    transactionType: 'New Order',
                    isPending: false,
                    isSuccessful: false,
                    isError: true
                },
            }
       
        default:
            return state
    }

}