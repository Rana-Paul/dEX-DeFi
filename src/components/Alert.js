import { useRef, useEffect } from 'react'
import { useSelector } from 'react-redux';

const Alert = () => {
  const alertRef = useRef(null)

  const account = useSelector(state => state.provider.account)
  const isPending = useSelector(state => state.exchange.transaction.isPending)
  const isError = useSelector(state => state.exchange.transaction.isError)

  const removeHandler = async (e) => {
    alertRef.current.className = 'alert--remove'
  }

  useEffect(() => {
    if((isPending || isError) && account) {
      alertRef.current.className = 'alert'
    }
  }, [ isPending, isError, account])

  return (
    <div>
        {isPending ? (

          <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
            <h1>Transaction Pending...</h1>
          </div>

        ) : isError ? (

          <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
            <h1>Transaction Will Fail</h1>
          </div>

        ) : !isPending ? (

          <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
            <h1>Transaction Successful</h1>
          </div>

        ) : (
          <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}></div>
        )}
    </div>
  );
}

export default Alert;
