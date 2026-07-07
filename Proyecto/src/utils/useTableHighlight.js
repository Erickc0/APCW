import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useTableHighlight(onHighlight) {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const [highlightedId, setHighlightedId] = useState(null);
  const rowRefs = useRef({});
  const onHighlightRef = useRef(onHighlight);

  useEffect(() => {
    onHighlightRef.current = onHighlight;
  }, [onHighlight]);

  useEffect(() => {
    const id = highlightId;

    if (!id) {
      return;
    }

    if (onHighlightRef.current) {
      onHighlightRef.current();
    }

    setHighlightedId(id);

    setTimeout(() => {
      rowRefs.current[id]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 80);

    const timeoutId = setTimeout(() => {
      setHighlightedId(null);
    }, 3200);

    return () => clearTimeout(timeoutId);
  }, [highlightId]);

  function getRowProps(id) {
    return {
      ref: (element) => {
        if (element) {
          rowRefs.current[id] = element;
        }
      },
      className: highlightedId === id ? 'fila-resaltada' : undefined
    };
  }

  return { getRowProps };
}
