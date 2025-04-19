import "./styles.scss"
import { PiPlusBold } from 'react-icons/pi'

const GapInput = ({onChange}) => {
  return (
    <div className='gap-input'>
        <input type="file" name="file" id="file" onChange={onChange} />
        <div className="line"></div>
        <span><PiPlusBold size={"14px"} /></span>
    </div>
  )
}

export default GapInput