import "./styles.scss"
import { PiPlus, PiX } from 'react-icons/pi'

const Category = ({ isActive, categName, onClick }) => {
    return (
        <div className={isActive ? 'category active' :'category'} onClick={onClick}>
            <p>
                {categName}
            </p>
            <span>
                {
                    isActive ?
                        <PiX size={"12px"} />
                        :
                        <PiPlus size={"12px"} />
                }
            </span>
        </div>
    )
}

export default Category