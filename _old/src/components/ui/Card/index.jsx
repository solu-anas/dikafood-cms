import { useEffect, useState } from "react";
import "./styles.scss";

const Card = ({ options, setType}) => {
    const [isSelected, setIsSelected] = useState([])

    useEffect(() => {
        setIsSelected(new Array(options[0]?.options.length).fill(false))
    }, [])

    const onSelect = (index, option) => {
        setIsSelected(prev => {
            const newSelected = new Array(prev.length).fill(false);
            newSelected[index] = true;
            return newSelected;
        });
        setType(option);
    };

    return (
        <>
            {
                options.map((option, index) => {
                    return (
                        <div className="card" key={index}>
                            <p>{option.title}</p>
                            <div className="options">
                                {
                                    option.options.map((option, index) => {
                                        return (
                                            <div
                                            className={isSelected[index]? "option active" :"option"}
                                            key={index}
                                            onClick={()=>onSelect(index, option)}
                                            >
                                                <div>
                                                    <span></span>
                                                </div>
                                                {option}
                                            </div>
                                        )
                                    }
                                    )
                                }
                            </div>
                        </div>
                    )
                })
            }
        </>
    )
}

export default Card