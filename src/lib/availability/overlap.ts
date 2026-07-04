export type TimeRange = {
  startAt: Date;
  endAt: Date;
};

export function assertValidTimeRange(range: TimeRange, now = new Date()) {
  if (range.startAt < now) {
    throw new Error("Start datetime must not be in the past.");
  }

  if (range.endAt <= range.startAt) {
    throw new Error("End datetime must be after start datetime.");
  }
}

export function rangesOverlap(left: TimeRange, right: TimeRange) {
  return left.startAt < right.endAt && left.endAt > right.startAt;
}
