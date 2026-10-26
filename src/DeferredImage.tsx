import React, { useEffect, useRef, useState } from 'react';

const callbacks = new WeakMap<Element, () => void>();
let observer: IntersectionObserver | undefined;

function observeImage(element: Element, ready: () => void) {
  if (!('IntersectionObserver' in window)) { ready(); return () => {}; }
  observer ??= new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      callbacks.get(entry.target)?.();
      callbacks.delete(entry.target);
      observer?.unobserve(entry.target);
    }
  }, { rootMargin: '700px 0px' });
  callbacks.set(element, ready);
  observer.observe(element);
  return () => { callbacks.delete(element); observer?.unobserve(element); };
}

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'loading'> & { priority?: boolean };

export function DeferredImage({ priority = false, src, ...props }: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(priority);
  useEffect(() => {
    if (ready || !ref.current) return;
    return observeImage(ref.current, () => setReady(true));
  }, [ready]);
  return <img {...props} ref={ref} style={{ ...props.style, ...(props.width && props.height ? { aspectRatio: `${props.width} / ${props.height}` } : {}), visibility: ready ? props.style?.visibility : 'hidden' }} src={ready ? src : undefined} loading="eager" decoding="async" {...{ fetchpriority: priority ? 'high' : 'low' }} data-image-ready={ready ? 'true' : 'false'}/>;
}
