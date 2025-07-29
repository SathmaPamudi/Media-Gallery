import React from 'react';

const Layout = ({ children }) => {
  return (
    <main className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </main>
  );
};

export default Layout; 