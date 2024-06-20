import React from 'react';
import { Outlet } from 'react-router-dom';
import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import './App.css';
import { AuthProvider } from "./context/authContext";
import Header from './components/Header';
import cache from './utils/cache'

const httpLink = createHttpLink({
  uri: "/graphql",
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("id_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
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
        <Outlet />
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
