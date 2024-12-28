import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '/MVC/PersonalProject/personalproject.client/AuthService';
// import OflineHeader from '../components/OflineHeader';
import { useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { Modal, Button, Carousel, Container } from 'react-bootstrap';
import {FaRegUserCircle } from 'react-icons/fa';
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
 

  const [transparent, setTransparent] = useState(false);
    const navigate = useNavigate();

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
          const response = await AuthService.register(username, email, password, firstName, lastName);
          if (response) {
              navigate('/login');
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
          const token = await AuthService.login(username, password);
          await revalidateAuth();
          navigate('/dashboard');
      } catch (error) {
          setErrorMessage(error.message);
      }
  };

  return (
    <>

<>
      {transparent === false ? (
        <header className="header">
            <>
                <a className="header-notTransparent" href="/"><h1>Certflix</h1></a>
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
            
            <Button
                        onClick={() => { setShowModal(true); setActiveTab('signup'); }}
                        className='green-button'
                    >
                        <FaRegUserCircle />
                    </Button>
    </header>
        )}
       </>

  
    <div  className="text-center my-5" style={{margin:'0px 0px 0px 0px', color: '#607d8b ', boxShadow: '0 0px 0px rgba(0, 0, 0, 0.4)'}}>
        <h1>Welcome to < span style={{color: '#FF8C00'}}>Certflix</span></h1>
        <h3 className="my-3">
            Learning to code is like learning a new language. The more you practice, the easier it becomes.
        </h3>
    </div>
   
    

   
    
    <Carousel style={{margin:'0px auto', boxShadow: '0 6px 10px rgba(0, 0, 0, 0.4)', backgroundColor: '#819b8c',maxWidth:'900px', maxHeight:'600px'}}>
        <Carousel.Item interval={10000} style={{marginTop: '-30px'}}>
        <img
                className="d-block w-100"
                src={img1}
                alt="Third slide"
                
                height={480}
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
                height={480}
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
                height={480}
            />
            <Carousel.Caption style={{backgroundColor: 'rgba(0, 0, 0, 0.7)'}}>
                <h3 >Learn with passion</h3>
                <p>Be able to learn and master new programming languages</p>
            </Carousel.Caption>
        </Carousel.Item>
    </Carousel>
    
         <div style={{borderBottom: '2px solid #607d8b', borderRadius: '0px', marginTop: '60px', maxWidth:'1200px',paddingTop: '30px'}}></div>

    <div className="d-flex justify-content-between align-items-center my-5" style={{maxWidth:'1200px'}}>
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

    <div style={{borderBottom: '2px solid #607d8b', borderRadius: '0px', marginTop: '-31px', maxWidth:'1200px'}}></div>

    <div className="d-flex justify-content-between align-items-center my-5" style={{maxWidth:'1200px'}}>
        <div className="col-md-6">
            <img
                src={img4}
                className="img-fluid"
                alt="Learning Image"
            />
        </div>
        <div className="col-md-6">
            <h3>Interactive Learning</h3>
            <p>We offer interactive quizzes, coding challenges, and more to ensure you understand the concepts you learn.</p>
        </div>
    </div>

    <div style={{borderBottom: '2px solid #607d8b', borderRadius: '0px', marginTop: '-20px',paddingTop: '30px', marginBottom: '100px', maxWidth:'1200px'}}></div>

    <div className="my-5 text-center" style={{maxWidth:'1200px'}}>
        <h3>Things You Can Do with <span style={{color: '#FF8C00'}}>Certflix</span></h3>
        <ul className="list-unstyled">
            <li><i className="fas fa-check-circle"></i> Access a wide variety of programming courses.</li>
            <li><i className="fas fa-check-circle"></i> Earn certificates for completing courses.</li>
            <li><i className="fas fa-check-circle"></i> Track your progress with personalized dashboards.</li>
        </ul>
    </div>
    <div style={{borderBottom: '2px solid #607d8b', borderRadius: '0px', marginTop: '-20px', maxWidth:'1200px',paddingTop: '30px'}}></div>
 
    <div className="my-5 text-center" >
        <h3>User Reviews</h3>
        <div className="d-flex justify-content-around" style={{maxWidth:'1200px'}}>
     
            <div className="card" style={{ width: '18rem' }}>
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

    <div style={{borderBottom: '2px solid #607d8b', borderRadius: '0px', marginTop: '60px', maxWidth:'1200px',paddingTop: '30px', marginBottom: '110px'}}></div>
          
    <div className="d-flex justify-content-center my-5" style={{display: 'flex', flexWrap: 'wrap'}}>
                <div className="card" style={{ width: '18rem', margin: '10px', backgroundColor: '#e9f6ef', color: '#607d8b',boxShadow: '0 6px 10px rgba(0, 0, 0, 0.4)' }}>
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
         
          <Modal show={showModal} onHide={() => setShowModal(false)} centered  dialogClassName="custom-modal" style={{margin: '0 auto'}}>
                {/* <Modal.Header closeButton  style={{border:'none',marginTop: '-50px' ,marginBottom: '-50px'}}>
                    <Modal.Title >{activeTab === 'signin' ? 'Sign In' : 'Sign Up'}</Modal.Title>
                </Modal.Header> */}
                <Modal.Body >
                    <div style={{marginBottom: '20px', marginLeft:'92px', marginTop:'-50px',border:'none'}}>
                        <Button
                            variant={activeTab === 'signin' ? 'success' : 'outline-success'}
                            onClick={() => setActiveTab('signin')}
                            
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

                    {errorMessage && <p style={{ color: 'red' }} >{errorMessage}</p>}

                    {activeTab === 'signin' ? (
                        <form onSubmit={handleLogin} style={{border:'none', width:'100%'}}>
                            <div style={{ marginBottom: '-40px',marginTop: '-50px', }}>
                                <label htmlFor="username">Username:</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div style={{border:'none', width:'100%'}}>
                                <label htmlFor="password">Password:</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    
                                />
                            </div>
                            <button style={{marginBottom: '-160px',marginTop: '-130px', marginLeft:'20px'}} className="btn btn-outline-success" type="submit">Sign In</button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister}>
                          <div style={{ marginBottom: '-40px',marginTop: '-50px', }}>
                            <label htmlFor="firstName">First Name:</label>
                            <input
                              type="text"
                              id="firstName"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                            />
                          </div>
                          <div style={{ marginBottom: '-40px'}}>
                            <label htmlFor="lastName">Last Name:</label>
                            <input
                              type="text"
                              id="lastName"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                            />
                          </div>
                            <div style={{ marginBottom: '-40px'}}>
                                <label htmlFor="username">Username:</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div style={{ marginBottom: '-40px'}}>
                                <label htmlFor="email">Email:</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div style={{ marginBottom: '-40px'}}>
                                <label htmlFor="password">Password:</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <button style={{ marginTop: '3rem', marginBottom: '-3.2rem' , marginLeft:'20px'}}  className="btn btn-outline-success " type="submit">Sign Up</button>
                        </form>
                    )}
                </Modal.Body>
            </Modal>
           
      </>
  );
};


export default HomePage;