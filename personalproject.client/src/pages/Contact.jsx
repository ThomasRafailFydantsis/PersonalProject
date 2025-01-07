import { useState } from "react";
import axios from "axios";
function Contact() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
 
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
 
    function submit(e) {
        // This will prevent page refresh
        e.preventDefault();
 
        axios
            .post(
                // replace this with your own unique endpoint URL
                "https://formcarry.com/s/XXXXXXX",
                {
                    email: email,
                    message: message
                },
                {
                    headers: {
                        Accept: "application/json"
                    }
                }
            )
            .then((res) => {
                // success http code
                if (res.data.code === 200) {
                    setSubmitted(true);
                } else {
                    setError(res.data.message);
                }
            });
    }
 
    if (error) {
        return <p>{error}</p>;
    }
 
    if (submitted) {
        return <p>We've received your message, thank you for contacting us!</p>;
    }
 
    return (
        <>
        <header className="headerHome">
<a href="/"> <h1>Certflix</h1></a>
<div style={{textAlign:"center"}}>
<h1 style={{fontSize:"40px"}}>Contact</h1>
</div>
        </header>
<form onSubmit={submit}>
<label htmlFor="email">Email</label>
<input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
 
            <label htmlFor="message">Message</label>
<textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
 
            <button type="submit">Send</button>
</form>
</>
    );
}

export default Contact;