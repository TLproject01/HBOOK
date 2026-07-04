export type RoomFilterableEvent = {
  roomId: string;
};

export function filterEventsByRoom<TEvent extends RoomFilterableEvent>(
  events: TEvent[],
  selectedRoomId: string,
) {
  if (selectedRoomId === "all") {
    return events;
  }

  return events.filter((event) => event.roomId === selectedRoomId);
}
