export function sendNotification(store, onUpdate, payload) {
  const now = new Date().toISOString();
  const note = { id: `N${Date.now().toString(36).toUpperCase()}`, createdAt: now, ...payload };
  const updated = { ...store, notifications: [...(store.notifications||[]), note] };
  if (typeof onUpdate === 'function') onUpdate(updated);
  return note;
}
