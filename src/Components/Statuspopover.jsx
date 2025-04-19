import "./status-popover.scss"

export default function Statuspopover({statusList, handleClickStatus, orderStatus}) {

    return (
        <div className="list-status" onClick={(e) => { e.stopPropagation() }}>
            <ul>
                {statusList.map((status, index) => {
                        return (
                            <li key={index} onClick={()=>handleClickStatus(status)}>
                                <span>
                                    <div className={(orderStatus.toLowerCase() === status.replace(/\s+/g, '-').toLowerCase()) ? "radio active" : "radio"}>
                                        <div></div>
                                    </div>
                                </span>
                                {status}
                            </li>
                        )
                    })}
            </ul>
        </div>
    )
}
