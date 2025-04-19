import React, { useContext, useEffect } from 'react'
import { Context } from '../App';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const { isAuthenticated, isChecked, isManager } = useContext(Context);
    const navigate = useNavigate();
    useEffect(() => {
        if (isChecked && (!isAuthenticated || !isManager) ) {
            navigate("/login");
        } 
        else if (isChecked && isAuthenticated && isManager) {
            navigate("/manage/orders");
        }
    }, [isManager, isChecked, isAuthenticated, navigate]);
    return (
        <>
            {isChecked && <p>Redirecting ...</p>}
            {!isChecked && <p>Checking Auth Status ...</p>}
        </>
    )
}