import { useEffect, useState } from 'react';
import App from './App';
import { LandingApp } from './landing/LandingApp';

const LANDING_PREFIX = '/landing-page';

/**
 * Marketing pages are served at /landing-page-<slug>; everything else is the
 * dashboard. Bare /landing-page is the same page as /landing-page-home.
 */
function landingSlug(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, '');
  if (path === LANDING_PREFIX) return 'home';
  if (path.startsWith(`${LANDING_PREFIX}-`)) return path.slice(LANDING_PREFIX.length + 1) || 'home';
  return null;
}

/**
 * The app has one route split and no router dependency. Vite already serves
 * index.html for these deep paths (appType: 'spa'), so nothing else is needed.
 */
export function Root() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const slug = landingSlug(path);
  return slug ? <LandingApp slug={slug} /> : <App />;
}
