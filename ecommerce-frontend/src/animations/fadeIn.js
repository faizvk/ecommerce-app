export function fadeIn({
  direction = "up",
  distance = 40,
  duration = 0.6,
  delay = 0,
} = {}) {
  const axis = direction === "left" || direction === "right" ? "X" : "Y";
  const sign = direction === "up" || direction === "left" ? 1 : -1;

  return {
    "data-fade": "true",
    "data-direction": direction,
    "data-distance": `${distance}px`,
    style: {
      opacity: 0,
      transform: `translate${axis}(${sign * distance}px)`,
      transition: `opacity ${duration}s ease-out ${delay}s,
                   transform ${duration}s ease-out ${delay}s`,
    },
  };
}
