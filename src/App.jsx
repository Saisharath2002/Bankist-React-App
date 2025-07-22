import React, { useEffect, useState } from 'react';
import './style.css';

// Sample accounts with full names for unique usernames
const accountsData = [
  {
    owner: 'Sai Kumar',
    movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
    interestRate: 1.2,
    pin: 1111,
  },
  {
    owner: 'Sharath Reddy',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,
  },
  {
    owner: 'Steven Paul',
    movements: [200, -200, 340, -300, -20, 50, 400, -460],
    interestRate: 0.7,
    pin: 3333,
  },
  {
    owner: 'Sarah Connor',
    movements: [430, 1000, 700, 50, 90],
    interestRate: 1,
    pin: 4444,
  },
];

// Generate usernames from initials
accountsData.forEach(acc => {
  acc.username = acc.owner
    .toLowerCase()
    .split(' ')
    .map(name => name[0])
    .join('');
});

// Helper formatter for Indian Rupee with thousand separators
const formatINR = val =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(val);

export default function App() {
  const [accounts, setAccounts] = useState(accountsData);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [sorted, setSorted] = useState(false);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPin, setLoginPin] = useState('');

  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  const [loanAmount, setLoanAmount] = useState('');

  const [closeUsername, setCloseUsername] = useState('');
  const [closePin, setClosePin] = useState('');

  // Calculate balance (in Euro) but display in INR assuming 1 EUR = 89.5 INR (adjust as you like)
  // Here I use a fixed exchange rate:
  const exchangeRate = 89.5;

  const toINR = eurAmount => formatINR(eurAmount * exchangeRate);

  const updateAccount = () => {
    setAccounts(accounts.map(acc =>
      acc.username === currentAccount.username ? currentAccount : acc
    ));
    setCurrentAccount({ ...currentAccount });
  };

  const handleLogin = e => {
    e.preventDefault();
    const acc = accounts.find(acc => acc.username === loginUsername);
    if (acc?.pin === Number(loginPin)) {
      setCurrentAccount(acc);
      setLoginUsername('');
      setLoginPin('');
    }
  };

  const handleTransfer = e => {
    e.preventDefault();
    const amount = Number(transferAmount);
    const receiverAcc = accounts.find(acc => acc.username === transferTo);
    if (
      amount > 0 &&
      receiverAcc &&
      currentAccount.balance >= amount &&
      receiverAcc?.username !== currentAccount.username
    ) {
      currentAccount.movements.push(-amount);
      receiverAcc.movements.push(amount);
      updateAccount();
    }
    setTransferTo('');
    setTransferAmount('');
  };

  const handleLoan = e => {
    e.preventDefault();
    const amount = Number(loanAmount);
    if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
      currentAccount.movements.push(amount);
      updateAccount();
    }
    setLoanAmount('');
  };

  const handleClose = e => {
    e.preventDefault();
    if (
      closeUsername === currentAccount.username &&
      Number(closePin) === currentAccount.pin
    ) {
      setAccounts(accounts.filter(acc => acc.username !== currentAccount.username));
      setCurrentAccount(null);
    }
    setCloseUsername('');
    setClosePin('');
  };

  const handleSort = () => {
    setSorted(!sorted);
  };

  const displayMovements = (movements, sort = false) => {
    const movs = sort ? [...movements].sort((a, b) => a - b) : movements;
    return movs.map((mov, i) => {
      const type = mov > 0 ? 'deposit' : 'withdrawal';
      return (
        <div className="movements__row" key={i}>
          <div className={`movements__type movements__type--${type}`}>
            {i + 1} {type}
          </div>
          <div className="movements__value">{toINR(mov)}</div>
        </div>
      );
    });
  };

  const calcBalance = acc => acc.movements.reduce((sum, mov) => sum + mov, 0);

  return (
    <>
      <nav>
        <p className="welcome">
          {currentAccount
            ? `Welcome back, ${currentAccount.owner.split(' ')[0]}`
            : 'Log in to get started'}
        </p>
        <img src="/logo.png" alt="Logo" className="logo" />
        <form className="login" onSubmit={handleLogin}>
          <input
            type="text"
            value={loginUsername}
            onChange={e => setLoginUsername(e.target.value)}
            placeholder="user"
            className="login__input login__input--user"
          />
          <input
            type="text"
            value={loginPin}
            onChange={e => setLoginPin(e.target.value)}
            placeholder="PIN"
            maxLength="4"
            className="login__input login__input--pin"
          />
          <button className="login__btn">&rarr;</button>
        </form>
      </nav>

      <main className="app" style={{ opacity: currentAccount ? 1 : 0 }}>
        {currentAccount && (
          <>
            {/* Balance */}
            <div className="balance">
              <div>
                <p className="balance__label">Current balance</p>
                <p className="balance__date">
                  As of{' '}
                  <span className="date">
                    {new Date().toLocaleDateString('en-IN')}
                  </span>
                </p>
              </div>
              <p className="balance__value">{toINR(calcBalance(currentAccount))}</p>
              {currentAccount.balance = calcBalance(currentAccount)} {/* store balance */}
            </div>

            {/* Movements */}
            <div className="movements">
              {displayMovements(currentAccount.movements, sorted)}
            </div>

            {/* Summary */}
            <div className="summary">
              <p className="summary__label">In</p>
              <p className="summary__value summary__value--in">
                {toINR(
                  currentAccount.movements
                    .filter(m => m > 0)
                    .reduce((a, b) => a + b, 0)
                )}
              </p>
              <p className="summary__label">Out</p>
              <p className="summary__value summary__value--out">
                {toINR(
                  Math.abs(
                    currentAccount.movements
                      .filter(m => m < 0)
                      .reduce((a, b) => a + b, 0)
                  )
                )}
              </p>
              <p className="summary__label">Interest</p>
              <p className="summary__value summary__value--interest">
                {toINR(
                  currentAccount.movements
                    .filter(m => m > 0)
                    .map(deposit => (deposit * currentAccount.interestRate) / 100)
                    .filter(int => int >= 1)
                    .reduce((a, b) => a + b, 0)
                )}
              </p>
              <button className="btn--sort" onClick={handleSort}>
                &downarrow; SORT
              </button>
            </div>

            {/* Transfer */}
            <div className="operation operation--transfer">
              <h2>Transfer money</h2>
              <form className="form form--transfer" onSubmit={handleTransfer}>
                <input
                  type="text"
                  className="form__input form__input--to"
                  value={transferTo}
                  onChange={e => setTransferTo(e.target.value)}
                />
                <input
                  type="number"
                  className="form__input form__input--amount"
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                />
                <button className="form__btn form__btn--transfer">&rarr;</button>
                <label className="form__label">Transfer to</label>
                <label className="form__label">Amount</label>
              </form>
            </div>

            {/* Loan */}
            <div className="operation operation--loan">
              <h2>Request loan</h2>
              <form className="form form--loan" onSubmit={handleLoan}>
                <input
                  type="number"
                  className="form__input form__input--loan-amount"
                  value={loanAmount}
                  onChange={e => setLoanAmount(e.target.value)}
                />
                <button className="form__btn form__btn--loan">&rarr;</button>
                <label className="form__label form__label--loan">Amount</label>
              </form>
            </div>

            {/* Close */}
            <div className="operation operation--close">
              <h2>Close account</h2>
              <form className="form form--close" onSubmit={handleClose}>
                <input
                  type="text"
                  className="form__input form__input--user"
                  value={closeUsername}
                  onChange={e => setCloseUsername(e.target.value)}
                />
                <input
                  type="password"
                  className="form__input form__input--pin"
                  value={closePin}
                  onChange={e => setClosePin(e.target.value)}
                />
                <button className="form__btn form__btn--close">&rarr;</button>
                <label className="form__label">Confirm user</label>
                <label className="form__label">Confirm PIN</label>
              </form>
            </div>

            {/* Logout Timer */}
            <p className="logout-timer">
              You will be logged out in <span className="timer">05:00</span>
            </p>
          </>
        )}
      </main>
    </>
  );
}
