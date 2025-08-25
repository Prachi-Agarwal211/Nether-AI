import { useStore } from './useStore';
import { api } from '../services/api';

export const incrementCount = () => {
  useStore.setState((state) => {
    state.count += 1;
  });
};

export const resetCount = () => {
  useStore.setState((state) => {
    state.count = 0;
  });
};
