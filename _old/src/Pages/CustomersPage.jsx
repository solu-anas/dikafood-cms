import { PiBank, PiChatText, PiClipboardText, PiGridFour, PiTruck, PiUserList } from 'react-icons/pi'
import Tabs from '../Components/Tabs'
import './customers-page.scss'
import Customers from '../Sections/Customers'
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../App";
import Loader from '../Components/Loader';

export default function CustomersPage() {
  const { isAuthenticated, isChecked, isManager } = useContext(Context);
  const [pageVisible, setPageVisible] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (isChecked && isAuthenticated && isManager) {
      navigate('/manage/customers');
      setPageVisible(true)
    };
    if (isChecked && (!isAuthenticated || !isManager)) {
      setPageVisible(false)
      navigate("/login")
    }
  }, [isChecked, isAuthenticated, navigate, isManager])
  if (pageVisible) {
    return (
      <div className='customers-page'>
        <Tabs titles={[
          { icon: <PiClipboardText size={"24px"} color={window.location.pathname === "/manage/orders" ? "var(--dark-green-1)" : "var(--dark-grey)"} />, tabName: "Orders", link: "/manage/orders" },
          { icon: <PiGridFour size={"24px"} color={window.location.pathname === "/manage/products" ? "var(--dark-green-1)" : "var(--dark-grey)"} />, tabName: "Products", link: "/manage/products" },
          { icon: <PiUserList size={"24px"} color={window.location.pathname === "/manage/customers" ? "var(--dark-green-1)" : "var(--dark-grey)"} />, tabName: "Customers", link: "/manage/customers" },
          { icon: <PiChatText size={"24px"} color={window.location.pathname === "/manage/reviews" ? "var(--dark-green-1)" : "var(--dark-grey)"} />, tabName: "Reviews", link: "/manage/reviews" },
          { icon: <PiTruck size={"24px"} color={window.location.pathname === "/manage/delivery" ? "var(--dark-green-1)" : "var(--dark-grey)"} />, tabName: "Delivery", link: "/manage/delivery" },
          { icon: <PiBank size={"24px"} color={window.location.pathname === "/manage/payment" ? "var(--dark-green-1)" : "var(--dark-grey)"} />, tabName: "Payment", link: "/manage/payment" }
        ]} />
        <Customers />
      </div>
    )
  }
  else {
    return <div className="customers-page"><Loader /></div>
  }
}
