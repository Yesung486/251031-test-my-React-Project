import React from 'react';
import { Outlet } from 'react-router-dom';
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';

const Layout = () => {
  return (
    <div>
      <NavigationBar />
      <Outlet /> {/* 이 부분에 페이지 내용이 바뀔 거야 */}
      <Footer />
    </div>
  );
};

export default Layout;