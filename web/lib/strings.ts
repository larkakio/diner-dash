export const strings = {
  title: "Neon Diner Dash",
  tagline: "Swipe the floor. Serve the future.",
  connectWallet: "Connect wallet",
  disconnect: "Disconnect",
  wrongNetwork: "Wrong network — switch to Base",
  switchNetwork: "Switch to Base",
  checkIn: "Daily check-in",
  checkingIn: "Confirm in wallet…",
  checkedInToday: "Checked in today",
  canCheckIn: "Ready to check in",
  streak: (n: number) => `Streak: ${n} day${n === 1 ? "" : "s"}`,
  configureContract:
    "Set NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS after deploying the contract.",
  builderNote:
    "Builder Code suffix is appended via ox (set NEXT_PUBLIC_BUILDER_CODE).",
  score: "Score",
  time: "Time",
  combo: "Combo",
  shiftEnd: "Shift over",
  playAgain: "Play again",
  swipeHint: "Swipe to move · Tap when next to tables & stations",
  gameOverPatience: "Guest walked out!",
} as const;
