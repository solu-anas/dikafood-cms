import { PiX } from "react-icons/pi"
import "./add-new-customer.scss"
import { useState } from "react"
import config from "../config"
import PasswordInput from "./PasswordInput"

export default function AddNewCustomer({ onClose, setMessage, setRefresh }) {

    const [formData, setFormData] = useState({
        fName: "",
        lName: "",
        email: "",
        phone: '',
        password: ""
    });
    const [errors, setErrors] = useState({
        email: '',
        phone: '',
        password: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validate = () => {
        let newErrors = { phone: '', email: "", password: "" };
        let isValid = true;

        const phonePattern = /^\+(\d{1,4})(\d{7,15})$/;

        if (!phonePattern.test(formData.phone)) {
            newErrors.phone = 'Phone number must start with a "+" followed by a valid country code and phone number';
            isValid = false;
        }
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

        if (!passwordPattern.test(formData.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const addCustomer = () => {
        if (validate()) {
            setIsSubmitting(true)
            fetch(config.API_BASE + "/management/customers/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    "firstName": formData.fName,
                    "lastName": formData.lName,
                    "email": formData.email,
                    "phone": formData.phone,
                    "password": formData.password
                })
            }).then(res => res.json())
                .then(data => {
                    console.log(data)
                    if (data.success) {
                        setMessage("Customer Created successfully")
                        onClose();
                        setRefresh(p => !p)
                        setTimeout(() => {
                            setMessage("");
                        }, 3000)
                    }
                    else {
                        setMessage("Faild to create customer")
                        onClose()
                        setRefresh(p => !p)
                        setTimeout(() => {
                            setMessage("");
                        }, 3000)
                    }
                }).catch(err => {
                    console.log(err)
                })
        }
    }
    
    return (
        <div className="add-customer">
            <div className="header">
                <p>Add new Customer</p>
                <span onClick={onClose}>
                    <PiX size={"18px"} />
                </span>
            </div>
            <div className="body">
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="First Name *"
                        name="fName"
                        required
                        value={formData.fName}
                        onChange={(e) => handleChange(e)} />
                    <input
                        type="text"
                        placeholder="Last Name *"
                        name="lName"
                        required
                        value={formData.lName}
                        onChange={(e) => handleChange(e)}
                    />
                    <input
                        type="text"
                        placeholder="Email *"
                        name="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange(e)}
                    />
                    <input
                        type="text"
                        placeholder="Phone *"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={(e) => handleChange(e)}
                    />
                    <PasswordInput
                        placeholder={"password"}
                        value={formData.password}
                        onChange={(e) => handleChange(e)} />
                    {(errors.email || errors.phone || errors.password) && (
                        <div className="errors">
                            {Object.entries(errors).map(([key, value], index) => (
                                value && <p key={index}>{value}</p>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="footer">
                <button className="cancel" onClick={onClose}>Cancel</button>
                <button className="add" onClick={addCustomer} disabled={isSubmitting}>Add new Customer</button>
            </div>
        </div>
    )
}
