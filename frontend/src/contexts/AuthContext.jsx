import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getMe } from '../api/authApi';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('hostay_token') || null,
  isAuthenticated: false,
  loading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      if (state.token) {
        try {
          const res = await getMe();
          dispatch({ type: 'SET_USER', payload: res.data });
        } catch (error) {
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, [state.token]);

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    localStorage.setItem('hostay_token', res.token);
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user: res.data, token: res.token } });
  };

  const register = async (userData) => {
    const res = await apiRegister(userData);
    localStorage.setItem('hostay_token', res.token);
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user: res.data, token: res.token } });
  };

  const logout = () => {
    localStorage.removeItem('hostay_token');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
