import { applyMiddleware, combineReducers, compose } from "redux";
import { Tuple, configureStore } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import fileReducer from "./reducer/fileReducer/fileReducer";
const store = configureStore({
  reducer: {
    fileReducer: fileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { warnAfter: 500 },
      immutableCheck: { warnAfter: 500 },
    }),
});

export default store;
