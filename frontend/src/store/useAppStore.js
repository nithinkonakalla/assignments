import { create } from 'zustand';
import { api } from '../services/api';

export const useAppStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('charttrader_token'),
  activeSymbol: 'NIFTY',
  candles: {},
  openTrades: [],
  closedTrades: [],
  accountBalance: 0,
  currentPnl: 0,
  replay: { enabled: false, speed: 1, date: '2024-05-20' },

  setSymbol: (symbol) => set({ activeSymbol: symbol }),
  setReplay: (replay) => set({ replay: { ...get().replay, ...replay } }),

  upsertCandle: (symbol, candle) =>
    set((state) => {
      const prev = state.candles[symbol] || [];
      return { candles: { ...state.candles, [symbol]: [...prev.slice(-300), candle] } };
    }),

  signup: async (payload) => {
    const { data } = await api.post('/auth/signup', payload);
    localStorage.setItem('charttrader_token', data.token);
    set({ token: data.token, user: data.user, accountBalance: data.user.virtual_balance });
  },

  login: async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    localStorage.setItem('charttrader_token', data.token);
    set({ token: data.token, user: data.user, accountBalance: data.user.virtual_balance });
  },

  logout: () => {
    localStorage.removeItem('charttrader_token');
    set({ token: null, user: null });
  },

  placeOrder: async (order) => {
    await api.post('/trading/orders', order);
    await get().loadPortfolio();
  },

  loadPortfolio: async () => {
    const { data } = await api.get('/trading/portfolio');
    set({
      openTrades: data.openTrades,
      closedTrades: data.closedTrades,
      currentPnl: data.currentPnl,
      accountBalance: data.accountBalance
    });
  }
}));
