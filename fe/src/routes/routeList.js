import HomePage from "../pages/HomePage";
import Signup from "../pages/Signup";
import Signin from "../pages/Signin";


export default [
  {
    path: '/signup',
    page: <Signup />,
    public:true
  },
  {
    path: '/signin',
    page: <Signin />,
    public:true
  },
  {
    path: '/',
    page: <HomePage />,
    public:false
  }
]