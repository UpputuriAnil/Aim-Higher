import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  isAuthenticated: false
};

// Action types
const AUTH_SUCCESS = 'AUTH_SUCCESS';
const AUTH_FAILURE = 'AUTH_FAILURE';
const LOGOUT = 'LOGOUT';
const SET_LOADING = 'SET_LOADING';
const UPDATE_USER = 'UPDATE_USER';

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    case AUTH_FAILURE:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    case LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    case SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set axios default header
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      if (localStorage.getItem('token')) {
        try {
          const res = await axios.get('/api/auth/me');
          dispatch({
            type: AUTH_SUCCESS,
            payload: {
              user: res.data.user,
              token: localStorage.getItem('token')
            }
          });
        } catch (error) {
          dispatch({ type: AUTH_FAILURE });
          localStorage.removeItem('token');
        }
      } else {
        dispatch({ type: SET_LOADING, payload: false });
      }
    };

    loadUser();
  }, []);

  // Student login
  const studentLogin = async (formData) => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      const res = await axios.post('/api/auth/student/login', formData);
      
      dispatch({
        type: AUTH_SUCCESS,
        payload: {
          user: res.data.user,
          token: res.data.token
        }
      });

      toast.success(res.data.message);
      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_FAILURE });
      const data = error.response?.data;
      const message = data?.message || (typeof data === 'string' ? data : (error.message || 'Login failed'));
      toast.error(message);
      return { 
        success: false, 
        message, 
        isRoleMismatch: !!data?.isRoleMismatch,
        registeredRole: data?.registeredRole
      };
    }
  };

  // Teacher login
  const teacherLogin = async (formData) => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      const res = await axios.post('/api/auth/teacher/login', formData);
      
      dispatch({
        type: AUTH_SUCCESS,
        payload: {
          user: res.data.user,
          token: res.data.token
        }
      });

      toast.success(res.data.message);
      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_FAILURE });
      const data = error.response?.data;
      const message = data?.message || (typeof data === 'string' ? data : (error.message || 'Login failed'));
      toast.error(message);
      return { 
        success: false, 
        message, 
        isRoleMismatch: !!data?.isRoleMismatch,
        registeredRole: data?.registeredRole
      };
    }
  };

  // Student register
  const studentRegister = async (formData) => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      const res = await axios.post('/api/auth/student/register', formData);
      
      dispatch({
        type: AUTH_SUCCESS,
        payload: {
          user: res.data.user,
          token: res.data.token
        }
      });

      toast.success(res.data.message);
      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_FAILURE });
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Teacher register
  const teacherRegister = async (formData) => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      const res = await axios.post('/api/auth/teacher/register', formData);
      
      dispatch({
        type: AUTH_SUCCESS,
        payload: {
          user: res.data.user,
          token: res.data.token
        }
      });

      toast.success(res.data.message);
      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_FAILURE });
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    dispatch({ type: LOGOUT });
    toast.success('Logged out successfully');
  };

  // Update profile
  const updateProfile = async (formData) => {
    try {
      const res = await axios.put('/api/auth/profile', formData);
      dispatch({
        type: UPDATE_USER,
        payload: res.data.user
      });
      toast.success(res.data.message);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Change password
  const changePassword = async (formData) => {
    try {
      const res = await axios.put('/api/auth/change-password', formData);
      toast.success(res.data.message);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Google login / registration (Firebase)
  const loginWithGoogle = async (firebaseUser, role = 'student') => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      const res = await axios.post('/api/auth/google', {
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        avatar: firebaseUser.photoURL,
        uid: firebaseUser.uid,
        role
      });

      dispatch({
        type: AUTH_SUCCESS,
        payload: {
          user: res.data.user,
          token: res.data.token
        }
      });

      toast.success(res.data.message || 'Logged in with Google successfully');
      return { success: true, role: res.data.user.role };
    } catch (error) {
      dispatch({ type: AUTH_FAILURE });
      const message = error.response?.data?.message || 'Google authentication failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    ...state,
    studentLogin,
    teacherLogin,
    studentRegister,
    teacherRegister,
    loginWithGoogle,
    logout,
    updateProfile,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
