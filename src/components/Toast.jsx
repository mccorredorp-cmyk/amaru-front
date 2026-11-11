import { useApp } from '../context/AppContext.jsx';

export default function Toast() {
  const { toast } = useApp();
  return (
    <div className={`app-toast${toast.visible ? ' show' : ''}`} role="status" aria-live="polite">
      {toast.texto}
    </div>
  );
}
