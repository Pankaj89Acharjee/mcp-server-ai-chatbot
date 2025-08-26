import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Custom hook for tracking user activity and managing session timeouts
 * @param {number} idleTimeout - Time in ms before session is considered idle (default: 900000 ms / 15 min)
 * @param {number} warningDuration - Time in ms to show warning before logout (default: 60000 ms / 1 min)
 * @param {boolean} isAuthenticated - Whether the user is authenticated
 * @param {function} onWarning - Optional callback when warning starts
 * @param {function} onTimeout - Optional callback when timeout occurs
 * @returns {Object} - Timer control functions
 */
const useIdleTimer = (
  idleTimeout = 900000, // 15 minutes default
  warningDuration = 60000, // 1 minute default
  isAuthenticated = false,
  onWarning = null,
  onTimeout = null
) => {
  const navigate = useNavigate();
  const activityTimer = useRef(null);
  const warningTimer = useRef(null);

  // Function to reset all timers
  const resetTimers = () => {
    if (activityTimer.current) clearTimeout(activityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);

    // Only set new timers if user is authenticated
    if (isAuthenticated) {
      // Set timer for showing warning
      activityTimer.current = setTimeout(() => {
        // Call warning callback if provided
        if (typeof onWarning === "function") onWarning();

        // Navigate to warning page
        navigate("/sessionwarning");

        // Set timer for final logout after warning duration
        warningTimer.current = setTimeout(() => {
          // Call timeout callback if provided
          if (typeof onTimeout === "function") onTimeout();

          // Clear session storage and cookies (handled by SessionWarn component)
        }, warningDuration);
      }, idleTimeout - warningDuration);
    }
  };

  // Reset timer on user activity
  const handleUserActivity = () => {
    resetTimers();
  };

  // Set up event listeners on component mount
  useEffect(() => {
    if (!isAuthenticated) return;

    // Activity events to listen for
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "keydown",
    ];

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    // Initial timer setup
    resetTimers();

    // Cleanup event listeners and timers on unmount
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });

      if (activityTimer.current) clearTimeout(activityTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, idleTimeout, warningDuration]);

  // Return control functions
  return {
    resetTimers,
    forceLogout: () => navigate("/sessionwarning"),
    extendSession: resetTimers,
  };
};

export default useIdleTimer;
