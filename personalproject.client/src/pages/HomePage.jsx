import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../servicesE/AuthService';
import { useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { Modal, Button, Carousel} from 'react-bootstrap';
import {FaRegUserCircle } from 'react-icons/fa';
import HomeCerts from '../components/HomeCerts';
import img1 from '../imgs/2bros.jpg';
import img2 from '../imgs/coding.jpg';
import img3 from '../imgs/kineza.jpg';
import img4 from '../imgs/tetragwnh-laptop.jpg';
import img5 from '../imgs/tetragwnh-programming.jpg';

const HomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('signup');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [redirectAfterAuth, setRedirectAfterAuth] = useState(null);
  const { isAuthenticated } = useAuth();
  const [transparent, setTransparent] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const navigate = useNavigate();
    

    const handleItemClick = (index) => {
        setActiveItem(index); 
    };

    const handleAuthRedirect = (targetRoute) => {
        if (!isAuthenticated) {
            setRedirectAfterAuth(targetRoute);
            setShowModal(true);
        } else {
            navigate(targetRoute);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setTransparent(true);
            } else {
                setTransparent(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
  
  const { revalidateAuth } = useAuth();

 

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !firstName || !lastName) {
        setErrorMessage("All fields are required.");
        return;
    }
    if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters long.");
        return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        setErrorMessage("Please enter a valid email.");
        return;
    }
    try {
        const registrationResponse = await AuthService.register(username, email, password, firstName, lastName);
        if (registrationResponse) {
            
            const token = await AuthService.login(username, password);
            await revalidateAuth();
            navigate('/dashboard'); 
            if (redirectAfterAuth) {
                navigate(redirectAfterAuth); 
            }
        }
    } catch (error) {
        setErrorMessage(error.response?.data || 'Registration failed');
    }
};

const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
        setErrorMessage("Both username and password are required.");
        return;
    }
    try {
        await AuthService.login(username, password);
        await revalidateAuth();
        navigate('/dashboard'); 
        if (redirectAfterAuth) {
            navigate(redirectAfterAuth); 
        }
    } catch (error) {
        setErrorMessage(error.response?.data || 'Login failed');
    }
};
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "inherit" }}>

       <>
      {transparent === false ? (
        <header className="header">
            <>
                 <a className="header-notTransparent" href="/"><h1>Certflix</h1></a>
                 <ul className="header-nav " style={{ marginTop: "10px", marginLeft: "-32px" }}>
            {[
                { text: "Start", href: "#scrollspyHeading1" },
                { text: "Products", href: "#scrollspyHeading2" },
                { text: "Programming", href: "#scrollspyHeading3" },
                { text: "Goal", href: "#scrollspyHeading4" },
                { text: "Reviews", href: "#scrollspyHeading5" },
                { text: "Join us", href: "#scrollspyHeading6" },
            ].map((item, index) => (
                <li
                    key={index}
                    className={`nav-item ${activeItem === index ? "active" : ""}`}
                    onClick={() => handleItemClick(index)}
                    style={{
                        margin: "4px",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        backgroundColor: activeItem === index ? "rgba(255, 140, 0, 0.1)" : "transparent",
                        color: activeItem === index ? "#FF8C00" : "inherit",
                        transition: "background-color 0.3s ease, color 0.3s ease",
                    }}
                >
                    <a  href={item.href} style={{ textDecoration: "none", color: "inherit" }}>
                        {item.text}
                    </a>
                </li>
            ))}
        </ul>
                 <Button
                        onClick={() => { setShowModal(true); setActiveTab('signup'); }}
                        className='green-button'
                 >
                        <FaRegUserCircle />
                 </Button>
            </>
        </header>
      ):( 
      <header  className="header header-transparent">      
      <a   href="/"><h1>Certflix</h1></a>
      <ul className="header-nav" style={{ marginTop: "10px", marginLeft: "-32px" }}>
            {[
                 { text: "Start", href: "#scrollspyHeading1" },
                 { text: "Products", href: "#scrollspyHeading2" },
                 { text: "Programming", href: "#scrollspyHeading3" },
                 { text: "Goal", href: "#scrollspyHeading4" },
                 { text: "Reviews", href: "#scrollspyHeading5" },
                 { text: "Join us", href: "#scrollspyHeading6" },
            ].map((item, index) => (
                <li
                    key={index}
                    className={`nav-item ${activeItem === index ? "active" : ""}`}
                    onClick={() => handleItemClick(index)}
                    style={{
                        margin: "4px",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        backgroundColor: activeItem === index ? "rgba(255, 140, 0, 0.1)" : "transparent",
                        color: activeItem === index ? "#FF8C00" : "inherit",
                        transition: "background-color 0.4s ease, color 0.3s ease",
                    }}
                >
                    <a href={item.href} style={{ textDecoration: "none", color: "inherit" }}>
                        {item.text}
                    </a>
                </li>
            ))}
        </ul>
      <Button onClick={() => { setShowModal(true); setActiveTab('signup'); }} className='green-button' >
 <FaRegUserCircle />
                    </Button>
    </header>
        )}
       </>

       <div
        data-bs-spy="scroll"
        data-bs-target="#navbar-example2"
        data-bs-root-margin="0px 0px -40%"
        data-bs-smooth-scroll="true"
        className="scrollspy-example p-3 rounded-2"
        tabIndex="0"
        style={{ backgroundColor: 'aliceblue',marginTop: '0px' }}
         id="scrollspyHeading1"
      > 
       
    <div className="text-center my-5" style={{margin:'0px 0px 0px 0px', color: '#607d8b ', boxShadow: '0 0px 0px rgba(0, 0, 0, 0.4)', marginBottom: '200px'}}>
        <h1 >Welcome to < span style={{color: '#FF8C00'}}>Certflix</span></h1>
        <h3 className="my-3" >
            Learning to code is like learning a new language. The more you practice, the easier it becomes.
        </h3>
    </div>
   
   
    <Carousel className='crsl'  style={{margin:'0px auto', boxShadow: '0 6px 10px rgba(0, 0, 0, 0.4)', backgroundColor: '#819b8c',opacity: '0.9',maxWidth:'900px', maxHeight:'600px',marginTop: '20px'}}>
        <Carousel.Item interval={10000} style={{marginTop: '-30px'}}>
        <img
                className="d-block w-100"
                src={img1}
                alt="Third slide"
                style={{paddingTop: '14px'}}
                height={550}

            />
            <Carousel.Caption style={{backgroundColor: 'rgba(0, 0, 0, 0.7)'}}>
                <h3>Create the future</h3>
                <p>In the age of information, knowledge is power, and Certflix is here to empower you</p>
            </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item interval={1000} style={{marginTop: '-30px'}}> 
        <img
                className="d-block w-100"
                src={img2}
                alt="Third slide"
                height={550}
                style={{paddingTop: '14px'}}
            />
            <Carousel.Caption style={{backgroundColor: 'rgba(0, 0, 0, 0.7)'}}>
                <h3>Succeed in your career</h3>
                <p>Our oroducts are specifically designed to help you succeed in your career, land your dreamjob</p>
            </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item interval={10000} style={{marginTop: '-30px'}}>
        <img
                className="d-block w-100"
                src={img3}
                alt="Third slide"
                style={{paddingTop: '14px'}}
                height={550}
            />
            <Carousel.Caption style={{backgroundColor: 'rgba(0, 0, 0, 0.7)'}}>
                <h3 >Learn with passion</h3>
                <p>Be able to learn and master new programming languages</p>
            </Carousel.Caption>
        </Carousel.Item>
    </Carousel>
    
         <div id="scrollspyHeading2" style={{borderBottom: '2px solid #607d8b', borderRadius: '0px', marginTop: '20px', maxWidth:'1200px',paddingTop: '60px',marginBottom: '120px'}}></div>
         <HomeCerts onAuthRedirect={handleAuthRedirect} />
    <div id="scrollspyHeading3" style={{borderBottom: '2px solid #607d8b', borderRadius: '0px', marginTop: '120px', maxWidth:'1200px', paddingTop: '60px'}}></div>
    <div  className="d-flex justify-content-between align-items-center my-5" style={{maxWidth:'1200px', margintop : '30px'}}>
        <div className="col-md-6">
            <h3>Learning with <span style={{color: '#FF8C00'}}>Certflix</span></h3>
            <p>We provide high-quality courses designed to help you master new programming languages and enhance your career opportunities.</p>
        </div>
        <div className="col-md-6">
            <img
                src={img5}
                className="img-fluid"
                alt="Learning Image"
            />
        </div>
    </div>

    <div id="scrollspyHeading4" style={{borderBottom: '2px solid #607d8b',paddingTop: '60px', borderRadius: '0px', marginTop: '0px', maxWidth:'1200px'}}></div>

    <div  className="d-flex justify-content-between align-items-center my-5" style={{maxWidth:'1200px'}}>
        <div className="col-md-6">
            <img
                src={img4}
                className="img-fluid"
                alt="Learning Image"
            />
        </div>
        <div className="col-md-6"  style={{paddingLeft: '20px'}}>
            <h3>Interactive Learning</h3>
            <p>We offer interactive quizzes, coding challenges, and more to ensure you understand the concepts you learn.</p>
        </div>
    </div>

    <div id="scrollspyHeading5" style={{borderBottom: '2px solid #607d8b', borderRadius: '0px', marginTop: '80px',paddingTop: '60px', marginBottom: '100px', maxWidth:'1200px'}}></div>

    <div  className="my-5 text-center" style={{maxWidth:'1200px', marginTop: '30px'}}>
        <h3>Things You Can Do with <span style={{color: '#FF8C00'}}>Certflix</span></h3>
        <ul className="list-unstyled">
            <li><i className="fas fa-check-circle"></i> Access a wide variety of programming courses.</li>
            <li><i className="fas fa-check-circle"></i> Earn certificates for completing courses.</li>
            <li><i className="fas fa-check-circle"></i> Track your progress with personalized dashboards.</li>
        </ul>
    </div>
    <div style={{borderBottom: '2px solid #607d8b', borderRadius: '0px', marginTop: '50px', maxWidth:'1200px',paddingTop: '31px'}}></div>
 
    <div className="my-5 text-center" >
        <h2>User Reviews</h2>
        <h3>What our students have to say about <span style={{color: '#FF8C00'}}>Certflix</span></h3>
        <div style={{paddingTop: '30px'}}></div>
        <div className="d-flex justify-content-around" style={{maxWidth:'1200px', marginTop: '30px'}}>
     
            <div className="card" style={{ width: '18rem', height:"200px" }}>
                <div className="card-body">
                    <p className="card-text">`Certflix helped me learn Python in just a few weeks. Highly recommend!`</p>
                    <footer className="blockquote-footer">John Doe</footer>
                </div>
            </div>

           
            <div className="card" style={{ width: '18rem' }}>
                <div className="card-body">
                    <p className="card-text">`The interactive lessons and quizzes made learning fun and easy!`</p>
                    <footer className="blockquote-footer">Jane Smith</footer>
                </div>
            </div>

            <div className="card" style={{ width: '18rem' }}>
                <div className="card-body">
                    <p className="card-text">`Thanks to Certflix, I got my first job as a developer!`</p>
                    <footer className="blockquote-footer">Michael Lee</footer>
                </div>
            </div>
        </div>
    </div>

    <div style={{borderBottom: '2px solid #607d8b', borderRadius: '0px', marginTop: '60px', maxWidth:'1200px', marginBottom: '180px'}}></div>
          <h1  style={{textAlign: 'center',color: '#607d8b',marginBottom: '50px'}}>Join the <span style={{color: '#FF8C00'}}>Certflix</span> Community</h1>
          <h3 style={{textAlign: 'center',color: '#607d8b',marginBottom: '130px'}}>Sign up today and start your journey!</h3>
    <div id="scrollspyHeading6" className="d-flex justify-content-center my-5" style={{display: 'flex', flexWrap: 'wrap' }}>
                <div className="card" style={{ width: '18rem', margin: '10px', backgroundColor: '#e9f6ef', color: '#607d8b',boxShadow: '0 6px 10px rgba(0, 0, 0, 0.4)', }}>
                    <div className="card-body">
                        <h5 className="card-title">New to <span style={{ color: '#FF8C00' }}>Certflix?</span></h5>
                        <p className="card-text">Sign up today and start your journey!</p>
                    </div>
                    <Button
                        onClick={() => { setShowModal(true); setActiveTab('signup'); }}
                        className='green-button'
                    >
                        Register
                    </Button>
                </div>

                <div className="card" style={{ width: '18rem', margin: '10px', backgroundColor: '#e9f6ef', color: '#607d8b',boxShadow: '0 6px 10px rgba(0, 0, 0, 0.4)', marginLeft: '100px' }}>
                    <div className="card-body">
                        <h5 className="card-title">Already have an account?</h5>
                        <p className="card-text">Log in to access your certificates!</p>
                    </div>
                    <Button
                        onClick={() => { setShowModal(true); setActiveTab('signin'); }}
                        className='green-button'
                    >
                        Login
                    </Button>
                </div>
            </div>
         </div>
         <div style={{marginBottom: '52px'}}></div>
         <div className="modal-container">
  <Modal
    show={showModal}
    onHide={() => setShowModal(false)}
    centered
    dialogClassName="custom-modal"
  >
    <Modal.Body style={{ padding: '30px', textAlign: 'center' }}>
      <div style={{ marginBottom: '20px' }}>
        <Button
          variant={activeTab === 'signin' ? 'success' : 'outline-success'}
          onClick={() => setActiveTab('signin')}
          style={{ marginRight: '10px' }}
        >
          Sign In
        </Button>
        <Button
          variant={activeTab === 'signup' ? 'success' : 'outline-success'}
          onClick={() => setActiveTab('signup')}
        >
          Sign Up
        </Button>
      </div>

      {errorMessage && (
        <p style={{ color: 'red', marginBottom: '20px' }}>{errorMessage}</p>
      )}

      {activeTab === 'signin' ? (
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="username" style={{ display: 'block' }}>
              Username:
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={{ display: 'block' }}>
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
            />
          </div>
          <button className="btn btn-success" type="submit">
            Sign In
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="firstName" style={{ display: 'block' }}>
              First Name:
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="form-control"
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="lastName" style={{ display: 'block' }}>
              Last Name:
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="form-control"
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="username" style={{ display: 'block' }}>
              Username:
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="email" style={{ display: 'block' }}>
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={{ display: 'block' }}>
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
            />
          </div>
          <button className="btn btn-success" type="submit">
            Sign Up
          </button>
        </form>
      )}
    </Modal.Body>
  </Modal>
</div>
      </div>
  );
};


export default HomePage;