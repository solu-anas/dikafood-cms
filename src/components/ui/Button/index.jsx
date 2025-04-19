import "./styles.scss";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  icon,
  ...rest
}) => {
  const buttonClasses = `btn btn-${variant} btn-${size} ${icon ? 'btn-icon' : ''} ${className}`;

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {icon && <span className="btn-icon-wrapper">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;