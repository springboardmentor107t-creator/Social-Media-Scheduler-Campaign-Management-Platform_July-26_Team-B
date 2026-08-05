export function evaluatePasswordStrength(password) {
  if (!password) {
    return { score: 0, label: "Weak", missing: ["Minimum 8 characters", "1 uppercase letter", "1 lowercase letter", "1 number", "1 special character"] };
  }

  const missing = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    missing.push("Minimum 8 characters");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    missing.push("1 uppercase letter");
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    missing.push("1 lowercase letter");
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    missing.push("1 number");
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    missing.push("1 special character");
  }

  let label = "Weak";
  if (score === 5) {
    label = "Strong";
  } else if (score === 4) {
    label = "Good";
  } else if (score === 3) {
    label = "Fair";
  }

  return { score, label, missing };
}
