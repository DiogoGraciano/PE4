import { describe, expect, it } from 'vitest';
import uiReducer, { toggleSidebar, setSidebarOpen } from './uiSlice';

describe('uiSlice', () => {
  it('has initialState with sidebarOpen=true', () => {
    expect(uiReducer(undefined, { type: '@@INIT' })).toEqual({ sidebarOpen: true });
  });

  it('toggleSidebar flips the value', () => {
    let state = uiReducer(undefined, toggleSidebar());
    expect(state.sidebarOpen).toBe(false);
    state = uiReducer(state, toggleSidebar());
    expect(state.sidebarOpen).toBe(true);
  });

  it('setSidebarOpen overrides the value', () => {
    expect(uiReducer({ sidebarOpen: true }, setSidebarOpen(false))).toEqual({ sidebarOpen: false });
    expect(uiReducer({ sidebarOpen: false }, setSidebarOpen(true))).toEqual({ sidebarOpen: true });
  });
});
