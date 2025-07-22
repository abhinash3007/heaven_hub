import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userSlice from "./user/userSlice";

const rootReducer = combineReducers({ user: userSlice });

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    }),
});

export { store };