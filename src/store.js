import { create } from "zustand";

const { max, min } = Math;

const useStore = create((set) => ({
  capture: null,
  setCapture: (capture) => set({ capture }),
  angle: { azimuth: 0, polaris: Math.PI / 2 },
  setAngle: (angle) => set({ angle }),
  fov: 60,
  circleCapture: true,
  setCircleCapture: (circleCapture) => set({ circleCapture }),
  noting: false,
  setNoting: (noting) => set({ noting }),
  addFov: (val) =>
    set((state) => ({ fov: min(max(state.fov + val, 30), 120) })),
}));

export default useStore;
