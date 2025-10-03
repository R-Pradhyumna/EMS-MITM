/**
 * Outside Click Detection Hook
 *
 * Custom React hook that detects clicks outside a specified element
 * and triggers a callback handler. Commonly used for closing modals,
 * dropdowns, and popup menus when clicking outside.
 *
 * @module useOutsideClick
 */

import { useEffect, useRef } from "react";

/**
 * Detects clicks outside a referenced element and executes a handler function.
 *
 * Attaches a global click event listener to the document that checks if clicks
 * occur outside the element referenced by the returned ref. When an outside click
 * is detected, the provided handler function is called.
 *
 * Event propagation:
 * - Uses capture phase by default (listenCapturing = true)
 * - Capture phase ensures the handler runs before child element handlers
 * - Prevents conflicts with stopPropagation() in child components
 *
 * Cleanup:
 * - Automatically removes event listener when component unmounts
 * - Updates listener when handler or listenCapturing changes
 *
 * Common use cases:
 * - Closing modals when clicking backdrop
 * - Dismissing dropdown menus
 * - Hiding context menus
 * - Closing side panels or popovers
 *
 * @param {Function} handler - Callback function executed when outside click detected
 * @param {boolean} [listenCapturing=true] - Whether to use capture phase for event listening
 * @returns {React.RefObject} Ref object to attach to the element that should detect outside clicks
 *
 * @example
 * // Close modal on outside click
 * function Modal({ onClose, children }) {
 *   const ref = useOutsideClick(onClose);
 *
 *   return (
 *     <div className="modal-backdrop">
 *       <div className="modal-content" ref={ref}>
 *         {children}
 *         <button onClick={onClose}>Close</button>
 *       </div>
 *     </div>
 *   );
 * }
 *
 * @example
 * // Dropdown menu that closes on outside click
 * function Dropdown() {
 *   const [isOpen, setIsOpen] = useState(false);
 *   const ref = useOutsideClick(() => setIsOpen(false));
 *
 *   return (
 *     <div ref={ref}>
 *       <button onClick={() => setIsOpen(!isOpen)}>Menu</button>
 *       {isOpen && (
 *         <ul className="dropdown-menu">
 *           <li>Option 1</li>
 *           <li>Option 2</li>
 *         </ul>
 *       )}
 *     </div>
 *   );
 * }
 */
function useOutsideClick(handler, listenCapturing = true) {
  const ref = useRef();

  useEffect(
    function () {
      function handleClick(e) {
        if (ref.current && !ref.current.contains(e.target)) {
          handler();
        }
      }

      document.addEventListener("click", handleClick, listenCapturing);

      return () => document.removeEventListener("click", handleClick);
    },
    [handler, listenCapturing]
  );

  return ref;
}

export default useOutsideClick;
