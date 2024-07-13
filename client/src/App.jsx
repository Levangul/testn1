import React from 'react';
import { Outlet } from 'react-router-dom';
import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import SearchUser from './components/SearchUser';
import cache from './utils/cache';

const httpLink = createHttpLink({
  uri: 'http://localhost:3001/graphql', 
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
});

function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <Header />
        <SearchUser />
        <Outlet />
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
