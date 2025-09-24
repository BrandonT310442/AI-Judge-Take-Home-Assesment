import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MoonIcon, SunIcon, Gavel } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Layout() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex w-64 flex-col">
            <div className="flex min-h-0 flex-1 flex-col border-r bg-card">
              <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                <div className="flex flex-shrink-0 items-center px-4 mb-5">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary rounded-lg">
                      <Gavel className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold">AI Judge</h1>
                      <p className="text-xs text-muted-foreground">Evaluation Platform</p>
                    </div>
                  </div>
                </div>
                <Separator className="mx-4 mb-4" />
                <Navigation />
              </div>
              <div className="flex flex-shrink-0 border-t p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="w-full justify-start"
                >
                  {theme === 'light' ? (
                    <>
                      <MoonIcon className="mr-2 h-4 w-4" />
                      Dark Mode
                    </>
                  ) : (
                    <>
                      <SunIcon className="mr-2 h-4 w-4" />
                      Light Mode
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <div className="py-8 px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}