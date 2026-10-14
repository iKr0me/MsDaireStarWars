// World-distance timing keeps speed continuous through pickup and then ramps acceleration.
export function createFlightTiming(total,turn,speed=14){
  turn=Math.min(turn,total);const turnTime=turn/speed,remaining=total-turn;
  const distanceAfter=t=>speed*t+9*t*t*t;
  let low=0,high=Math.max(1,remaining/speed);
  for(let i=0;i<60;i++){const mid=(low+high)/2;if(distanceAfter(mid)<remaining)low=mid;else high=mid;}
  const duration=turnTime+(low+high)/2;
  return {duration,turnTime,distanceAt(time){
    time=Math.max(0,time);
    return Math.min(total,time<=turnTime?speed*time:turn+distanceAfter(time-turnTime));
  }};
}
