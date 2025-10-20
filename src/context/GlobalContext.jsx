import { message } from 'antd';
import { createContext, useState } from 'react';
import { auth0Balance, auth0Transactions } from '../api/auth0Api';
import { useAuth0 } from '@auth0/auth0-react';

export const GlobalContext = createContext([]);

export const GlobalProvider = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [balance, setBalance] = useState(0);
  const [transfers, setTransfers] = useState([]);
  const [picture, setPicture] = useState('');
  const [totpToken, setTotpToken] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const { user, isAuthenticated } = useAuth0();

  const refreshData = async () => {
    setLoadingData(true);
    try {
      if (isAuthenticated && user?.email) {
        const resTransactions = await auth0Transactions({ email: user.email });
        const resTransactionsData = resTransactions?.data;

        const resBalance = await auth0Balance({ email: user.email });
        const resBalanceData = resBalance?.data;

        if (resTransactionsData?.success && resBalanceData?.success) {
          const transactions = resTransactionsData.transactions || [];
          setName(resTransactionsData.user?.name || '');
          setUsername(resTransactionsData.user?.username || '');
          setBalance(resBalanceData.user?.balance || 0);
          setTransfers(Array.isArray(transactions) ? transactions : []);
          setPicture(user?.picture);
        } else {
          messageApi.error('Error al obtener datos de usuario');
        }
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Error al obtener datos de usuario';
      messageApi.error(msg);
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        messageApi,
        name,
        setName,
        email,
        setEmail,
        username,
        setUsername,
        balance,
        setBalance,
        transfers,
        setTransfers,
        totpToken,
        setTotpToken,
        loadingData,
        setLoadingData,
        refreshData,
        picture,
        setPicture
      }}
    >
      {contextHolder}
      {children}
    </GlobalContext.Provider>
  );
};