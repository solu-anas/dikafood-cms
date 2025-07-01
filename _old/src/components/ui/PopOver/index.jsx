import "./styles.scss";
import { Children } from "react";

const PopOver = ({children}) => {
  return (
    <div className="popover" onClick={(e)=>{e.stopPropagation()}}>
        {
            Children.map(children, child=>(
                <>{child}</>
            ))
        }
    </div>
  )
}

export default PopOver