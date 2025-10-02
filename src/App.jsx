// import { useState } from 'react'
import React from "react";
import AuthForm from './components//auth/AuthForm';
import Dashboard from './components/dashboard/Dashboard';
import { useAuth } from './context/AuthContext';
import Loading from './components/utility/Loading';

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
