import { RoomTypeForm } from '../room-type-form';
import { createRoomType } from '../actions';

export default function NewRoomTypePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">New room type</h1>
      <RoomTypeForm action={createRoomType} />
    </div>
  );
}
