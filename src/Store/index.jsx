// Global state store (lightweight — extend with Zustand or Redux as needed)
import React, { createContext, useContext, useReducer } from 'react';

const initialState = {
  news: [],
  savedArticles: [],
  searchQuery: '',
  activeCategory: 'All',
};

const ActionTypes = {
  SET_NEWS:           'SET_NEWS',
  SAVE_ARTICLE:       'SAVE_ARTICLE',
  UNSAVE_ARTICLE:     'UNSAVE_ARTICLE',
  SET_SEARCH_QUERY:   'SET_SEARCH_QUERY',
  SET_ACTIVE_CATEGORY:'SET_ACTIVE_CATEGORY',
};

const reducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_NEWS:
      return { ...state, news: action.payload };
    case ActionTypes.SAVE_ARTICLE:
      return {
        ...state,
        savedArticles: [...state.savedArticles, action.payload],
      };
    case ActionTypes.UNSAVE_ARTICLE:
      return {
        ...state,
        savedArticles: state.savedArticles.filter((a) => a.id !== action.payload),
      };
    case ActionTypes.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };
    case ActionTypes.SET_ACTIVE_CATEGORY:
      return { ...state, activeCategory: action.payload };
    default:
      return state;
  }
};

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StoreContext.Provider value={{ state, dispatch, ActionTypes }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};

export { ActionTypes };
export default StoreContext;
