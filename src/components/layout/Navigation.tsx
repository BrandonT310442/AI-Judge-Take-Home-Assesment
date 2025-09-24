import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  FileJson, 
  ChartBar, 
  Settings,
  Gavel,
  PlayCircle,
  ClipboardList
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Submissions', href: '/submissions', icon: FileJson },
  { name: 'Judges', href: '/judges', icon: Gavel },
  { name: 'Queues', href: '/queues', icon: ClipboardList },
  { name: 'Results', href: '/results', icon: ChartBar },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="flex-1 space-y-1 px-2 py-4">
      {navigation.map((item) => {
        const isActive = location.pathname === item.href || 
                        (item.href !== '/' && location.pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground',
              'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150'
            )}
          >
            <item.icon
              className={cn(
                isActive
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground group-hover:text-secondary-foreground',
                'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150'
              )}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}