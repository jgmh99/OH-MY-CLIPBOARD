export default function Toast({ message, visible }) {
  return (
    <div id="toast" className={`toast ${visible ? 'show' : ''}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
