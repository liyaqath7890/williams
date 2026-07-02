import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MessageCircle, RadioTower, Send, Users } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { addMessage, fetchChatRooms, fetchRoomMessages, setActiveRoom } from '../../redux/features/chat/chatSlice';
import { socket } from '../../sockets/socketClient';
import { SOCKET_EVENTS } from '../../sockets/socketEvents';
import { formatDate } from '../../utils/formatDate';

export default function ChatPage() {
  const dispatch = useDispatch();
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const { activeRoomId, messagesByRoom, rooms, status, typingByRoom, usersByRoom } = useSelector((state) => state.chat);
  const [message, setMessage] = useState('');

  const activeRoom = useMemo(() => rooms.find((room) => room.id === activeRoomId), [activeRoomId, rooms]);
  const roomMessages = messagesByRoom[activeRoomId] || [];
  const roomUsers = usersByRoom[activeRoomId] || [];
  const typingUsers = (typingByRoom[activeRoomId] || []).filter((item) => item.id !== user?.id);

  useEffect(() => {
    dispatch(fetchChatRooms());
  }, [dispatch]);

  useEffect(() => {
    if (!activeRoomId) return;
    dispatch(fetchRoomMessages(activeRoomId));
    socket.emit(SOCKET_EVENTS.CHAT_JOIN_ROOM, { roomId: activeRoomId });
  }, [activeRoomId, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages.length, activeRoomId]);

  const handleRoomSelect = (roomId) => {
    dispatch(setActiveRoom(roomId));
  };

  const handleChange = (event) => {
    setMessage(event.target.value);
    if (!activeRoomId || !user) return;

    socket.emit(SOCKET_EVENTS.CHAT_TYPING, {
      roomId: activeRoomId,
      user: { id: user.id, name: user.name, role: user.role }
    });

    window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => {
      socket.emit(SOCKET_EVENTS.CHAT_STOP_TYPING, {
        roomId: activeRoomId,
        user: { id: user.id, name: user.name, role: user.role }
      });
    }, 900);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const content = message.trim();
    if (!content || !activeRoomId) return;

    socket.emit(
      SOCKET_EVENTS.CHAT_MESSAGE,
      {
        roomId: activeRoomId,
        content,
        metadata: { source: 'aegis-web' }
      },
      (ack) => {
        if (ack?.ok && ack.message) {
          dispatch(addMessage(ack.message));
        }
      }
    );

    socket.emit(SOCKET_EVENTS.CHAT_STOP_TYPING, {
      roomId: activeRoomId,
      user: { id: user.id, name: user.name, role: user.role }
    });
    setMessage('');
  };

  return (
    <>
      <PageHeader title="Real-Time Chat" description="Coordinate victims, authorities, helpers, and field teams through persistent Socket.IO rooms." />

      <div className="grid min-h-[680px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm xl:grid-cols-[280px_1fr_260px]">
        <aside className="border-b border-slate-200 bg-slate-50 xl:border-b-0 xl:border-r">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-aegis-primary" />
              <h3 className="font-bold text-slate-950">Rooms</h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">{status === 'loading' ? 'Loading channels...' : `${rooms.length} available channels`}</p>
          </div>
          <div className="max-h-72 overflow-y-auto p-3 xl:max-h-[610px]">
            {rooms.map((room) => (
              <button
                className={`mb-2 w-full rounded-md border px-3 py-3 text-left ${
                  room.id === activeRoomId ? 'border-teal-200 bg-teal-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
                key={room.id}
                onClick={() => handleRoomSelect(room.id)}
                type="button"
              >
                <p className="font-semibold text-slate-900">{room.name}</p>
                <p className="mt-1 text-xs capitalize text-slate-500">{room.type} · {room.scope}</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-h-[560px] flex-col">
          <header className="border-b border-slate-200 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-950">{activeRoom?.name || 'Select a room'}</h3>
                <p className="text-xs text-slate-500">Messages persist in PostgreSQL and broadcast over Socket.IO.</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                <RadioTower className="h-3.5 w-3.5" />
                Live
              </span>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {roomMessages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">No messages yet. Start the coordination thread.</div>
            ) : (
              roomMessages.map((item) => {
                const isMine = item.senderId === user?.id;
                return (
                  <article className={`flex ${isMine ? 'justify-end' : 'justify-start'}`} key={item.id}>
                    <div className={`max-w-[78%] rounded-lg px-4 py-3 shadow-sm ${isMine ? 'bg-aegis-primary text-white' : 'border border-slate-200 bg-white text-slate-800'}`}>
                      <div className="mb-1 flex items-center gap-2 text-xs opacity-80">
                        <span className="font-semibold">{item.sender?.name || (isMine ? user?.name : 'Responder')}</span>
                        <span className="capitalize">{item.sender?.role || ''}</span>
                      </div>
                      <p className="text-sm leading-6">{item.content}</p>
                      <p className="mt-2 text-right text-[11px] opacity-70">{formatDate(item.createdAt || new Date())}</p>
                    </div>
                  </article>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-slate-200 bg-white p-4">
            <p className="mb-2 h-5 text-xs text-slate-500">
              {typingUsers.length > 0 ? `${typingUsers.map((item) => item.name).join(', ')} typing...` : ' '}
            </p>
            <form className="flex gap-2" onSubmit={handleSubmit}>
              <input
                className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-aegis-primary focus:ring-2 focus:ring-teal-100"
                disabled={!activeRoomId}
                onChange={handleChange}
                placeholder="Type an operational update..."
                value={message}
              />
              <button className="inline-flex items-center gap-2 rounded-md bg-aegis-primary px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={!message.trim()} type="submit">
                <Send className="h-4 w-4" />
                Send
              </button>
            </form>
          </div>
        </section>

        <aside className="border-t border-slate-200 bg-white xl:border-l xl:border-t-0">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-aegis-primary" />
              <h3 className="font-bold text-slate-950">Online</h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">{roomUsers.length} responders in room</p>
          </div>
          <div className="space-y-2 p-4">
            {roomUsers.length === 0 ? (
              <p className="text-sm text-slate-500">Join a room to see live users.</p>
            ) : (
              roomUsers.map((item) => (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3" key={item.socketId}>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs capitalize text-slate-500">{item.role}</p>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
