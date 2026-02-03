import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const AppLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-notion-bg">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
