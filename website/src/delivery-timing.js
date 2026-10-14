// Distance-based motion starts accelerating immediately, then surges after the second bend.
export function createFlightTiming(total, secondTurn, initialSpeed = 27) {
  secondTurn = Math.min(Math.max(0, secondTurn), total);
  const earlyAcceleration = 4;
  const lateAcceleration = 24;
  const earlyDistance = time => initialSpeed * time + earlyAcceleration * time * time / 2;
  const turnTime = (Math.sqrt(initialSpeed * initialSpeed + 2 * earlyAcceleration * secondTurn) - initialSpeed) / earlyAcceleration;
  const turnSpeed = initialSpeed + earlyAcceleration * turnTime;
  const afterTurn = time => secondTurn + turnSpeed * time + earlyAcceleration * time * time / 2 + lateAcceleration * time * time * time;
  let low = 0, high = Math.max(1, (total - secondTurn) / turnSpeed);
  while (afterTurn(high) < total) high *= 2;
  for (let i = 0; i < 60; i++) {
    const middle = (low + high) / 2;
    if (afterTurn(middle) < total) low = middle;
    else high = middle;
  }
  const duration = turnTime + (low + high) / 2;
  return {
    duration,
    turnTime,
    distanceAt(time) {
      time = Math.max(0, time);
      return Math.min(total, time <= turnTime ? earlyDistance(time) : afterTurn(time - turnTime));
    },
  };
}
