import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';

interface State {
  googleInfo: any;
  youtubeInfo: any;
  instaInfo: any;
  facebookInfo: any;
  tiktokInfo: any;
  isLoggedIn: boolean;
}

interface Action {
  type:
    | 'SET_GOOGLE_INFO'
    | 'SET_YOUTUBE_INFO'
    | 'SET_INSTA_INFO'
    | 'SET_FACEBOOK_INFO'
    | 'SET_TIKTOK_INFO'
    | 'LOGOUT';
  payload?: any;
}

const initialState: State = {
  googleInfo: null,
  youtubeInfo: null,
  instaInfo: null,
  facebookInfo: null,
  tiktokInfo: null,
  isLoggedIn: false,
};

const AuthContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | undefined>(undefined);

const authReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_GOOGLE_INFO':
      return { ...state, googleInfo: action.payload, isLoggedIn: true };
    case 'SET_YOUTUBE_INFO':
      return { ...state, youtubeInfo: action.payload };
    case 'SET_INSTA_INFO':
      return { ...state, instaInfo: action.payload, isLoggedIn: true };
    case 'SET_FACEBOOK_INFO':
      return { ...state, facebookInfo: action.payload, isLoggedIn: true };
    case 'SET_TIKTOK_INFO':
      return { ...state, tiktokInfo: action.payload, isLoggedIn: true };
    case 'LOGOUT':
    return {...state, isLoggedIn: false};
    default:
      return state;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
  
    useEffect(() => {
      const savedState = localStorage.getItem('authState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'SET_GOOGLE_INFO', payload: parsedState.googleInfo });
        dispatch({ type: 'SET_YOUTUBE_INFO', payload: parsedState.youtubeInfo });
        dispatch({ type: 'SET_INSTA_INFO', payload: parsedState.instaInfo });
        dispatch({ type: 'SET_FACEBOOK_INFO', payload: parsedState.facebookInfo });
        dispatch({ type: 'SET_TIKTOK_INFO', payload: parsedState.tiktokInfo });
      }
    }, []);
  
    useEffect(() => {
      if (state.isLoggedIn) {
        localStorage.setItem('authState', JSON.stringify(state));
      } else {
        localStorage.removeItem('authState'); // Clear localStorage if not logged in
      }
    }, [state]);
  
    return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>;
  };
  

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
