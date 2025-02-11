import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../servicesE/AuthService';
import { useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { Modal, Button, Carousel} from 'react-bootstrap';
import {FaRegUserCircle,FaFacebook,FaTwitter, FaInstagram } from 'react-icons/fa';
import HomeCerts from '../components/HomeCerts';
//import img1 from '../imgs/2bros.jpg';
//import img2 from '../imgs/coding.jpg';
//import img3 from '../imgs/kineza.jpg';
import img4 from '../imgs/tetragwnh-laptop.jpg';
import img5 from '../imgs/tetragwnh-programming.jpg';
import img6 from '../imgs/istockphoto-1205715897-612x612.jpg';
import img7 from '../imgs/istockphoto-1271367687-612x612.jpg';
import img8 from '../imgs/istockphoto-1302155443-612x612.jpg';
import img9 from '../imgs/istockphoto-1311896951-612x612.jpg';


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
  const [showModal2, setShowModal2] = useState(false);
  const navigate = useNavigate();

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
    const enter = `\n`;
    const passwordErrors = [];
    if (password.length < 8) passwordErrors.push("Password must be at least 8 characters long.");
    if (!/[a-z]/.test(password)) passwordErrors.push(`Password must include at least one lowercase letter.${enter}`);
    if (!/[A-Z]/.test(password)) passwordErrors.push("Password must include at least one uppercase letter.");
    if (!/\d/.test(password)) passwordErrors.push("Password must include at least one digit.");
    if (!/\W/.test(password)) passwordErrors.push("Password must include at least one special character.");
    if (passwordErrors.length > 0) {
      setErrorMessage(passwordErrors.map(error => <span key={error}>{error}<br /></span>));
      return;
      }

    if (!/\S+@\S+\.\S+/.test(email)) {
        setErrorMessage("Please enter a valid email.");
        return;
    }
    
    try {
        const registrationResponse = await AuthService.register(username, email, password, firstName, lastName);
        if (registrationResponse) {
            
            await AuthService.login(username, password);
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
const handleScrollToSection = (sectionId, index) => {
  const section = document.querySelector(sectionId);

  if (section) {
      section.scrollIntoView({
          behavior: "smooth",
          block: "start",
      });

      const viewportHeight = window.innerHeight;
      const sectionHeight = section.offsetHeight;
      const additionalOffset = viewportHeight - sectionHeight;

      if (additionalOffset > 0) {
          window.scrollBy({ top: -additionalOffset / 2, behavior: "smooth" });
      }

      setActiveItem(index);
  }
};
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "inherit" }}>

       <>
       <header className={`headerHome ${transparent ? "header-transparent" : ""}`}>
    <a  href="/" className="header-title"><h1 style={{fontSize:"40px"}}>Certflix</h1></a>
    <ul className="header-nav" style={{marginTop:"1rem"}}>
    {[
        { text: "Home", href: "#scrollspyHeading1" },
        { text: "About", href: "#scrollspyHeading2" },
        { text: "Products", href: "#scrollspyHeading3" },
       
        // { text: "Goal", href: "#scrollspyHeading4" },
        { text: "Reviews", href: "#scrollspyHeading5" },
        { text: "Join us", href: "#scrollspyHeading6" },
    ].map((item, index) => (
        <li
            key={index}
            className={`nav-item ${activeItem === index ? "active" : ""}`}
            onClick={(e) => {
                e.preventDefault(); // Prevent default anchor scroll behavior
                handleScrollToSection(item.href, index);
            }}
        >
            <a href={item.href}>{item.text}</a>
        </li>
    ))}
     </ul>
    <Button onClick={() => { setShowModal(true); setActiveTab('signin'); }} style={{ backgroundColor: 'transparent', border: 'none', color:"#FF8C00" }}>
        <FaRegUserCircle size={30} />
    </Button>
     </header>
       </>
       <div id="scrollspyHeading1" className="full-screen-section"  style={{ backgroundColor: 'aliceblue', display: 'flex',flexDirection: 'column', justifyContent: 'center', alignItems: 'space-between' }}>
    <div className="text-center my-5" style={{color: '#607d8b ', boxShadow: '0 0px 0px rgba(0, 0, 0, 0.4)'}}>
        <h1  >Welcome to < span style={{color: '#FF8C00'}}>Certflix</span></h1>
        <h5 className="my-3" >
            Learning to code is like learning a new language. The more you practice, the easier it becomes.
        </h5>
        <>
       <Carousel className='crsl'  style={{margin:'0px auto',width: '40rem', color: '#607d8b' , boxShadow: '0 6px 10px rgba(0, 0, 0, 0.4)', marginTop: '4rem'}}>
       <Carousel.Item interval={10000} style={{marginTop: '-30px'}}>
            <img
                className="d-block w-100"
                src={img7}
                alt="Third slide"
                style={{paddingTop: '14px', height: '400px', maxWidth: '100%'}}
                
            />
            <Carousel.Caption style={{backgroundColor: 'rgba(0, 0, 0, 0.7)'}}>
                <h3>Create the future</h3>
                <p>In the age of information, knowledge is power, and Certflix is here to empower you</p>
            </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item interval={10000} style={{marginTop: '-30px'}}> 
        <img
                className="d-block w-100"
                src={img8}
                alt="Third slide"
                style={{paddingTop: '14px', height: '400px',  maxWidth: '100%'}}
            />
            <Carousel.Caption style={{backgroundColor: 'rgba(0, 0, 0, 0.7)'}}>
                <h3>Succeed in your career</h3>
                <p>Our oroducts are specifically designed to help you succeed in your career, land your dreamjob</p>
            </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item interval={10000} style={{marginTop: '-30px'}}>
        <img
                className="d-block w-100"
                src={img9}
                alt="Third slide"
                style={{paddingTop: '14px', height: '400px', maxWidth: '100%'}}
            />
            <Carousel.Caption style={{backgroundColor: 'rgba(0, 0, 0, 0.7)'}}>
                <h3 >Learn with passion</h3>
                <p>Be able to learn and master new programming languages</p>
            </Carousel.Caption>
        </Carousel.Item>
    </Carousel>
    </>
    </div>
    </div>
    <div id="scrollspyHeading2" style={{backgroundColor: 'rgba(190, 231, 212, 0.7)'}} className="full-screen-section programming">
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '50px'}}>
        <div  >
            <h3>Learning with <span style={{color: '#FF8C00'}}>Certflix</span></h3>
            <p style={{width: '19rem'}}>We provide high-quality courses designed to help you master new programming languages and enhance your career opportunities.
              After completing a course, you will have the knowledge and skills needed to succeed in your chosen field. With Certflix, you can learn at your own pace, on your own schedule, and in your own time zone.
             
            </p>
        </div>
        <div style={{marginLeft: '0.5rem'}} >
            <img
                src={img5}
                className="img-fluid"
                alt="Learning Image"
                style={{height: '19.5rem', width: '19.5rem'}}
            />
        </div>
       </div>
        <div style={{display: 'flex', justifyContent: 'space-between'}}  >
        <div style={{marginRight: '0.5rem'}} >
            <img
                src={img4}
                className="img-fluid"
                alt="Learning Image"
                style={{height: '19.5rem', width: '19.5rem'}}
            />
        </div>
        <div >
            <h3>Interactive Learning</h3>
            <p style={{width: '19rem'}}>We offer interactive quizzes, coding challenges, and more to ensure you understand the concepts you learn.
              Our interactive learning platform allows you to practice and test your knowledge in a fun and engaging way.
            </p>
        </div>
        </div>
    </div>
    <div id="scrollspyHeading3"style={{backgroundColor: 'aliceblue'}} className="full-screen-section">
  <HomeCerts onAuthRedirect={handleAuthRedirect} />
  </div>
  <div id="scrollspyHeading5"  style={{ backgroundColor: '#e9f6ef' }} className="full-screen-section">

    {/* <div  className="my-5 text-center" style={{maxWidth:'1200px', marginTop: '30px'}}>
        <h3>Things You Can Do with <span style={{color: '#FF8C00'}}>Certflix</span></h3>
        <ul className="list-unstyled">
            <li><i className="fas fa-check-circle"></i> Access a wide variety of programming courses.</li>
            <li><i className="fas fa-check-circle"></i> Earn certificates for completing courses.</li>
            <li><i className="fas fa-check-circle"></i> Track your progress with personalized dashboards.</li>
        </ul>
    </div> */}
    
 
    <div className="my-5 text-center" >
        <h2>User Reviews</h2>
        <h6>What our students have to say about <span style={{color: '#FF8C00'}}>Certflix</span></h6>
        <div style={{paddingTop: '30px'}}>
          <h5 > 
            
          </h5>
        </div>
        <div className="d-flex  " style={{maxWidth:'1200px', marginTop: '30px'}}>
     
            <div className="card" style={{ width: '18rem', height:"15rem", marginRight: '20px' }}>
                <div className="card-body my-5">
                    <p className="card-text">`Certflix helped me learn Python in just a few weeks. Highly recommend!`</p>
                    <footer className="blockquote-footer">John Doe</footer>
                </div>
            </div>
            <div className="card" style={{ width: '16rem', marginRight: '20px' }}>
                <div className="card-body my-5" >
                    <p className="card-text">`The interactive lessons and quizzes made learning fun and easy!`</p>
                    <footer className="blockquote-footer">Jane Smith</footer>
                </div>
            </div>
            <div className="card" style={{ width: '18rem' }}>
                <div className="card-body my-5">
                    <p className="card-text">`Thanks to Certflix, I got my first job as a developer!`</p>
                    <footer className="blockquote-footer">Michael Lee</footer>
                </div>
            </div>
        </div>
    </div>
</div>
<div id="scrollspyHeading6" style={{backgroundColor: 'aliceblue'}} className="full-screen-section">
          <h1  style={{textAlign: 'center',color: '#607d8b',marginBottom: '50px'}}>Join the <span style={{color: '#FF8C00'}}>Certflix</span> Community</h1>
          <h5 style={{textAlign: 'center',color: '#607d8b',marginBottom: '30px'}}>Sign up today and start your journey!</h5>
                    <button
                        onClick={() => { setShowModal(true); setActiveTab('signup'); }}
                        className='green-button'
                    >
                        Register
                    </button>
                    </div>
         <footer className="footer">
  <div className="container">
    <div className="row">
      <div className="col-md-4 text-center">
        <h4 className="footer-heading">About Certflix</h4>
        <p className="footer-text">
          Certflix is a platform that allows you to learn and earn certificates.
        </p>
      </div>
      <div className="col-md-4 text-center">
        <h4 className="footer-heading">Quick Links</h4>
        <ul className="footer-links">
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a target="_blank" href="/contactus">Contact</a></li>
        </ul>
      </div>
      <div className="col-md-4 text-center">
        <h4 className="footer-heading">Follow Us</h4>
        <ul className="footer-social-links">
          <li><a target="_blank" href="https://www.facebook.com"><i className="fab fa-facebook-f"></i> <FaFacebook />Facebook</a></li>
          <li><a href="#"><i className="fab fa-twitter"></i><FaTwitter /> Twitter</a></li>
          <li><a href="#"><i className="fab fa-instagram"></i><FaInstagram /> Instagram</a></li>
        </ul>
      </div>
    </div>
  </div>
</footer>
         <div style={{marginBottom: '52px'}}></div>
         <div className="modal-container">
         <Modal
    show={showModal2}
    onHide={() => setShowModal2(false)}
    centered
    dialogClassName="second-modal"
    size='lg'
    aria-describedby="modal-1"
    
  >
         <Modal.Body style={{width: '60rem', background: 'aliceblue', margin: '0 ', borderRadius: '7px' }}>
         <>
    <Carousel className='crsl'  style={{margin:'0px auto',maxWidth: '60rem', color: '#607d8b' , boxShadow: '0 6px 10px rgba(0, 0, 0, 0.4)', marginBottom: '2rem', marginTop: '0rem'}}>
        <Carousel.Item interval={10000} style={{marginTop: '-30px'}}>
        <img
                className="d-block w-100"
                src={img7}
                alt="Third slide"
                style={{paddingTop: '14px'}}
                height={550}
                width={1000}

            />
            <Carousel.Caption style={{backgroundColor: 'rgba(0, 0, 0, 0.7)'}}>
                <h3>Create the future</h3>
                <p>In the age of information, knowledge is power, and Certflix is here to empower you</p>
            </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item interval={10000} style={{marginTop: '-30px'}}> 
        <img
                className="d-block w-100"
                src={img6}
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
                src={img8}
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
    {/* <button onClick={navigate('/authpage')} style={{marginBottom: '1rem'}} className='green-button'>Get Started</button> */}
    </>
    </Modal.Body>
  </Modal>
  <Modal
    show={showModal}
    onHide={() => setShowModal(false)}
    centered
    dialogClassName="custom-modal"
    
  >
    <Modal.Body style={{ background: 'aliceblue', margin: '0 ', borderRadius: '7px' }}>
    <div style={{background:'aliceblue',marginBottom:'1.5rem', margin:'0px', display: 'flex', justifyContent: 'center' }}>
        <button
            className={`buttonSign ${activeTab === 'signin' ? 'Bon' : 'Boff'}`}
            onClick={() => setActiveTab('signin')}
            style={{
                border: 'none',
                padding: '10px 20px',
                cursor: 'pointer',
                color: activeTab === 'signin' ? 'white' : '#333',
                transition: 'background-color 0.3s ease',
            }}
        >
            Sign In
        </button>
        <button
            className={`buttonSign ${activeTab === 'signup' ? 'Bon' : 'Boff'}`}
            onClick={() => setActiveTab('signup')}
            style={{
                border: 'none',
                padding: '10px 20px',
                cursor: 'pointer',
                color: activeTab === 'signup' ? 'white' : '#333',
                transition: 'background-color 0.3s ease',
            }}
        >
            Sign Up
        </button>
    </div>
      {errorMessage && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
        {errorMessage}
      </div>
      )}
      {activeTab === 'signin' ? (
        <form onSubmit={handleLogin} style={{margin:'0 auto', background: 'aliceblue',color: '#607d8b' }}>
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
              style={{width: '27rem', backgroundColor: 'rgba(225, 203, 185, 0.5)', color: '#607d8b',boxShadow: '0 6px 10px rgba(0, 0, 0, 0.4)'}}
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
              style={{width: '27rem', backgroundColor: 'rgba(225, 203, 185, 0.5)', color: '#607d8b',boxShadow: '0 6px 10px rgba(0, 0, 0, 0.4)'}}
            />
          </div>
          <button className='regButton' style={{margin:'0 auto',marginTop: '15px', width: '27rem ',padding: '10px', background: 'linear-gradient(32deg, rgb(169, 106, 106) 45%, rgba(183,121,37,1) 100%)',border: '1px solid rgba(89, 107, 99, 0.4)', borderRadius: '5px',color: 'aliceblue', boxShadow: '0 6px 10px rgba(0, 0, 0, 0.1)' }}  type="submit">
            Sign In
          </button>
        </form>
      ) : (
        <form  onSubmit={(e) => {
          e.preventDefault(); // Prevent default form submission behavior
          handleRegister(e);
        }}  style={{margin:'0 auto', background: 'aliceblue',color: '#607d8b' }}>
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
              style={{width: '27rem', backgroundColor: 'rgba(225, 203, 185, 0.5)', color: '#607d8b',boxShadow: '0 6px 10px rgba(0, 0, 0, 0.4)'}}
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
              style={{width: '27rem',backgroundColor: 'rgba(225, 203, 185, 0.5)', color: '#607d8b',boxShadow: '0 6px 10px rgba(0, 0, 0, 0.4)'}}
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
              style={{width: '27rem', backgroundColor: 'rgba(225, 203, 185, 0.5)', color: '#607d8b',boxShadow: '0 6px 10px rgba(0, 0, 0, 0.4)'}}
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
              style={{width: '27rem', backgroundColor: 'rgba(225, 203, 185, 0.5)', color: '#607d8b',boxShadow: '0 6px 10px rgba(0, 0, 0, 0.4)'}}
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
              style={{width: '27rem', backgroundColor: 'rgba(225, 203, 185, 0.5)', color: '#607d8b',boxShadow: '0 6px 10px rgba(0, 0, 0, 0.4)', marginBottom: '15px'}}
            />
          </div>
          <button className='regButton' style={{margin:'0 auto',alignSelf: 'center',padding: '10px ', width: '27rem ', background: 'linear-gradient(32deg, rgb(169, 106, 106) 45%, rgba(183,121,37,1) 100%)',border: '1px solid rgba(89, 107, 99, 0.4)', borderRadius: '5px',color: 'aliceblue', boxShadow: '0 6px 10px rgba(0, 0, 0, 0.1)' }} type="submit">
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