import "@testing-library/jest-dom/vitest";

// Stub the IntersectionObserver used by useFadeInScroll so JSDOM doesn't choke
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.IntersectionObserver ||= IntersectionObserverStub;

// jsdom doesn't implement matchMedia
globalThis.matchMedia ||= () => ({
  matches: false,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});

// Quiet localStorage between tests so wishlist/recently-viewed don't leak
beforeEach(() => {
  localStorage.clear();
});
