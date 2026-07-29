// 마감일이 365일 넘게 남은 경우(온통청년 API의 상시/미정 정책은 999로 고정)는
// 사실상 상시모집으로 본다.
const ROLLING_THRESHOLD = 365;

export function isRolling(dDay) {
  return dDay > ROLLING_THRESHOLD;
}

export function formatDDay(dDay) {
  return isRolling(dDay) ? "상시모집" : `D-${dDay}`;
}
