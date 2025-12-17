import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Layout: React.FC = () => {
  const location = useLocation();
  const isNotHomePage = location.pathname !== '/';

  return (
    <div className="app-container">
      <Header />
      
      {isNotHomePage && (
        <div className="container mx-auto px-4 sm:px-8">
          <Link to="/" className="back-to-home-link glass-panel">
            &larr; 홈으로 돌아가기
          </Link>
        </div>
      )}

      <main className="main-content">
        {isNotHomePage ? (
          <div className="glass-panel w-full h-full overflow-hidden flex flex-col">
            <Outlet />
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;