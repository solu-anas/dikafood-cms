import "./toggle-button.scss";

export default function ToggleButton({isOn, toggleButton}) {
    
  return (
    <div className={isOn ? "toggle-button active" :'toggle-button' } onClick={toggleButton}>
        <div>
        </div>
    </div>
  )
}