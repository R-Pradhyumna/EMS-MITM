import { useState, useEffect } from "react";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";
import ButtonIcon from "./ButtonIcon";
import { useDarkMode } from "../context/DarkModeContext";

function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 👇 This effect now manages the two new classes for the crossfade
  useEffect(() => {
    const body = document.body;
    // Determine which theme we are changing TO
    const changingTo = isDarkMode ? "dark" : "light";

    if (isTransitioning) {
      body.classList.add(`theme-changing-to-${changingTo}`);
    } else {
      // Clean up both classes after the transition is done
      body.classList.remove(
        "theme-changing-to-dark",
        "theme-changing-to-light"
      );
    }
  }, [isTransitioning, isDarkMode]);

  function handleToggle() {
    // Prevent clicking again while the animation is running
    if (isTransitioning) return;

    setIsTransitioning(true);
    toggleDarkMode();

    // 👇 The duration should match the NEW CSS animation (0.6s = 600ms)
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  }

  return (
    <ButtonIcon onClick={handleToggle} disabled={isTransitioning}>
      {isDarkMode ? <HiOutlineSun /> : <HiOutlineMoon />}
    </ButtonIcon>
  );
}

export default DarkModeToggle;

// import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";
// import { useDarkMode } from "../context/DarkModeContext";
// import ButtonIcon from "./ButtonIcon";

// function DarkModeToggle() {
//   const { isDarkMode, toggleDarkMode } = useDarkMode();
//   const label = isDarkMode ? "Switch to light mode" : "Switch to dark mode";

//   return (
//     <ButtonIcon onClick={toggleDarkMode} aria-label={label}>
//       {isDarkMode ? <HiOutlineSun /> : <HiOutlineMoon />}
//     </ButtonIcon>
//   );
// }

// export default DarkModeToggle;
