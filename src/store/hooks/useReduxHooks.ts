/**
 * Store Hooks
 *
 * Type-safe hooks for using Redux state and dispatch.
 * Following Planora's architectural principles with consistent naming.
 */
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../storeApi";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
