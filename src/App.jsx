// import { useState } from 'react'
import React from "react";
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import { useAuth } from './context/AuthContext';
import Loading from './components/Loading';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />
  }

  return (
    <>
      {user ? <Dashboard /> : <AuthForm />}
    </>  
  );
}

export default App;
