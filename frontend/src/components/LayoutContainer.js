import React from 'react';

const LayoutContainer = ({ as: Component = 'div', className = '', children, ...props }) => {
  const baseClassName = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8';
  const combinedClassName = className ? `${baseClassName} ${className}` : baseClassName;

  return (
    <Component className={combinedClassName} {...props}>
      {children}
    </Component>
  );
};

export default LayoutContainer;
