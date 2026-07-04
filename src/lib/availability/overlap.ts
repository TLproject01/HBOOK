export type TimeRange = {
  startAt: Date;
  endAt: Date;
};

export function assertValidTimeRange(range: TimeRange, now = new Date()) {
  if (range.startAt < now) {
    throw new Error("เวลาเริ่มต้นต้องไม่เป็นอดีต");
  }

  if (range.endAt <= range.startAt) {
    throw new Error("เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น");
  }
}

export function rangesOverlap(left: TimeRange, right: TimeRange) {
  return left.startAt < right.endAt && left.endAt > right.startAt;
}
