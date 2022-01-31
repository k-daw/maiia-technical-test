import { createSlice } from '@reduxjs/toolkit';

interface appointmentsState {
  lastUpdatedTimestamp: number;
}

const initialState: appointmentsState = {
  lastUpdatedTimestamp: Date.now(),
};

export const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    updateTimestamp: (state) => {
      state.lastUpdatedTimestamp = Date.now();
    },
  },
});

export const { updateTimestamp } = appointmentsSlice.actions;

export const selectLastUpdatedTimestamp = (state) =>
  state.appointments.lastUpdatedTimestamp;

export default appointmentsSlice;
