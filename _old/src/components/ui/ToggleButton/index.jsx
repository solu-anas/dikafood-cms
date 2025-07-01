import "./styles.scss";

const ToggleButton = ({isOn, toggleButton}) => {
  return (
    <div className={isOn ? "toggle-button active" :'toggle-button' } onClick={toggleButton}>
        <div>
        </div>
    </div>
  )
}

export default ToggleButton