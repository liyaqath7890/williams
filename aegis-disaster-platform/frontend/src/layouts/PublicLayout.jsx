import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background elements to match the premium mesh theme */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/5 blur-[120px] rounded-full" />
      </div>
      
      <Outlet />
    </main>
  );
}
