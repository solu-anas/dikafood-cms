// import { PiCopy } from "react-icons/pi";
import "./popover.scss";
import { Children } from "react";

export default function PopOver({children}) {

  return (
    <div className="popover" onClick={(e)=>{e.stopPropagation()}}>
        {
            Children.map(children , child=>(
                <>{child}</>
            ))
        }
    </div>
  )
}
