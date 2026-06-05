import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ToastProvider } from './components/ui/Toast';
import { SplashScreen } from './components/ui/SplashScreen';
import { useAppStore } from './store/useAppStore';

function App() {
  const [splashDone, setSplashDone] = useState(false);
  const initializeDB = useAppStore((s) => s.initializeDB);
  const loadRemoteRecords = useAppStore((s) => s.loadRemoteRecords);

  useEffect(() => {
    initializeDB().then(() => loadRemoteRecords());
  }, []);

  return (
    <ToastProvider>
      {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}
      <div style={{
        opacity: splashDone ? 1 : 0,
        transition: 'opacity 0.5s ease 0.1s',
        height: '100%',
      }}>
        <RouterProvider router={router} />
      </div>
    </ToastProvider>
  );
}

export default App;
