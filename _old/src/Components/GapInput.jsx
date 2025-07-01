import "./gap-input.scss"
import { PiPlusBold } from 'react-icons/pi'

export default function GapInput({onChange}) {
  return (
    <div className='gap-input'>
        <input type="file" name="file" id="file" onChange={onChange} />
        <div className="line"></div>
        <span><PiPlusBold size={"14px"} /></span>
    </div>
  )
}
