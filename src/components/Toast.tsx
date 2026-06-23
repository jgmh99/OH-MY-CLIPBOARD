type ToastProps = {
  message: string;
  visible: boolean;
};

export default function Toast({ message, visible }: ToastProps) {
  return (
    <div id="toast" className={`toast ${visible ? 'show' : ''}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
