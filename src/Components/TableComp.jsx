import React, { Children, Fragment } from 'react';
import "./table-comp.scss";

export default function TableComp({ header, body, gridTempCol, gridCol, active}) {
    const childToClassList = (child) => {
        return child.props.className ? child.props.className.trim().split(/\s+/) : []
    }
    const elementToArrayChildren = (element) => {
        return Children.toArray(Children.only(element).props.children)
    }

    return (
        <div className="table" style={{ "--grid-template-columns": gridTempCol }}>
            <div className="thead">
                {Children.map(header, (child, index) => (
                    <Fragment key={index}>
                        {child}
                    </Fragment>
                ))}
            </div>
            <div className="tbody" style={{'--grid-column' : gridCol}}>
                {
                    childToClassList(Children.only(body)).includes("body") &&
                    elementToArrayChildren(body)
                        .filter(row => childToClassList(row).includes("row"))
                        .map((row, index) => {
                            return (
                                <div className={active[index]? 'row active' :'row'} key={index} style={{'--grid-column' : gridCol}}>
                                    {
                                        elementToArrayChildren(row)
                                            .filter(colGroup => childToClassList(colGroup).includes("col-group"))
                                            .map((colGroup, index) => (
                                                <Fragment key={index}>
                                                    <div {...colGroup.props}>
                                                        {
                                                            elementToArrayChildren(colGroup)
                                                                .filter(cell => childToClassList(cell).includes("cell"))
                                                                .map(cell => {
                                                                    return (
                                                                        <>{cell}</>
                                                                    )
                                                                })
                                                        }
                                                    </div>
                                                    {
                                                        index < elementToArrayChildren(row).length - 1
                                                        &&
                                                        <div className="separator">
                                                            <div></div>
                                                        </div>
                                                    }
                                                </Fragment>
                                            ))
                                    }
                                </div>
                            )
                        })
                }
            </div>
        </div>
    );
}