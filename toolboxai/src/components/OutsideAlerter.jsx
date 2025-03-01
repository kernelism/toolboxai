import React, { useRef, useEffect } from "react";

/**
 * Hook that triggers a callback when clicking outside of the passed ref
 */
function useOutsideAlerter(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback(); // Call the function to close the popup
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}

/**
 * Wrapper component to handle clicks outside
 */
function OutsideAlerter({ children, onOutsideClick }) {
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, onOutsideClick);

  return <div ref={wrapperRef}>{children}</div>;
}

export default OutsideAlerter;
