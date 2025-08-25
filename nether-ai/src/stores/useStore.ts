import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { StoreApi } from 'zustand';

type StoreState = {
  // Define your state shape here
  count: number;
};

const initialState: StoreState = {
  count: 0,
};

export const useStore = create<StoreState>()(
  immer((set) => ({
    ...initialState,
  }))
);

export type Store = StoreApi<StoreState>;
