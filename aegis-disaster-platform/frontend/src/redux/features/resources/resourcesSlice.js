import { createSlice } from '@reduxjs/toolkit';

const resourcesSlice = createSlice({
  name: 'resources',
  initialState: {
    inventory: []
  },
  reducers: {
    setResources: (state, action) => {
      state.inventory = action.payload;
    }
  }
});

export const { setResources } = resourcesSlice.actions;
export default resourcesSlice.reducer;
