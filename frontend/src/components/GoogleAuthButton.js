import React from 'react';
import { FcGoogle } from 'react-icons/fc';

/**
 * Modern Google Sign-in / Sign-up button adhering to official Google Identity guidelines
 */
const GoogleAuthButton = ({
  text = 'Continue with Google',
  onClick,
  disabled = false,
  className = '',
  style = {}
}) => {
  return (
    <button
      type="button"
      className={`btn-google ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      <FcGoogle size={20} style={{ flexShrink: 0 }} />
      <span>{text}</span>
    </button>
  );
};

export default GoogleAuthButton;
