
import OflineHeader from "../components/OflineHeader";
const HomePage = () => {
  return (
    <div>
       <OflineHeader />
      <h1>Welcome to the App</h1>
      <p>
        Please <a href="/login">login</a> or <a href="/register">register</a> to access the app.
      </p>
    </div>
  );
};

export default HomePage;