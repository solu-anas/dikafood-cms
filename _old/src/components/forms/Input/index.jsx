import "./styles.scss"
import { PiPencilSimple, PiCheck, PiX } from "react-icons/pi"

const Input = ({ value, onchange, onClose, onConfirm, placeholder, type, icon, onClick }) => {
    return (
        <div className="input-container" onClick={onClick}>
            <div className="container">
                <div className="input">
                    <span>
                        <PiPencilSimple color="var(--dark-grey)" />
                    </span>
                    <input
                        type={type || "text"}
                        placeholder={placeholder || "edit"}
                        value={value}
                        onChange={onchange}
                    />
                </div>
                <div className="buttons">
                    <span className="check" onClick={onConfirm}>
                        {
                            icon ||
                            <PiCheck size={"16px"} color="var(--blue)" />
                        }
                    </span>
                    <span className="close" onClick={onClose}>
                        <PiX color="var(--dark-grey)" />
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Input