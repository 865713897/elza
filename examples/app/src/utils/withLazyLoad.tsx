import React, { Suspense } from 'react';

function withLazyLoad<P>(LazyComponent: React.ComponentType<P>) {
  const LazyComponentWrapper: React.FC<P> = (props) => (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );

  return LazyComponentWrapper;
}

export default withLazyLoad;
