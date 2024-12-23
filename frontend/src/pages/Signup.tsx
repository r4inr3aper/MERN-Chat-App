import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { StoreContext } from "../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signup: React.FC = () => {
  const storeContext = useContext(StoreContext);
  const navigate = useNavigate();

  if (!storeContext) {
    throw new Error("StoreContext is not available.");
  }

  const { url, setToken, token } = storeContext;

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [currState, setCurrState] = useState<"login" | "sign up">("login");

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validateFields = () => {
    if (currState === "sign up" && !data.name.trim()) {
      toast.error("Name is required.");
      return false;
    }
    if (!data.email.trim()) {
      toast.error("Email is required.");
      return false;
    }
    if (!data.password.trim()) {
      toast.error("Password is required.");
      return false;
    }
    if (data.password.length < 6) {
      toast.error("Password must be of minimum 6 characters.");
      return false;
    }
    return true;
  };

  const onSubmitHandler = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateFields()) {
      return;
    }

    const endpoint =
      currState === "login" ? "/api/user/login" : "/api/user/signup";
    const requestData =
      currState === "login"
        ? { email: data.email, password: data.password }
        : { name: data.name, email: data.email, password: data.password };

    try {
      const response = await axios.post(`${url}${endpoint}`, requestData, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.success) {
        setToken(response.data.token);
        toast.success("Logged in successfully!");
        navigate("/");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center"
      style={{
        backgroundImage: "url('https://wallpaperaccess.com/full/2454628.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <ToastContainer />
      <form
        onSubmit={onSubmitHandler}
        className="bg-[#404048]/90 p-6 rounded-lg w-[90%] max-w-md space-y-6 shadow-lg"
      >
        <h2 className="text-lg font-semibold capitalize text-white">
          {currState}
        </h2>
        {currState === "sign up" && (
          <input
            type="text"
            name="name"
            value={data.name}
            onChange={onChangeHandler}
            placeholder="Your name"
            required
            className="w-full p-2 rounded text-white bg-[#1c1d22] focus:outline-none"
          />
        )}
        <input
          type="email"
          name="email"
          value={data.email}
          onChange={onChangeHandler}
          placeholder="Your email"
          required
          className="w-full p-2 rounded text-white bg-[#1c1d22] focus:outline-none"
        />
        <input
          type="password"
          name="password"
          value={data.password}
          onChange={onChangeHandler}
          placeholder="Your password"
          required
          className="w-full p-2 rounded text-white bg-[#1c1d22] focus:outline-none"
        />
        <button
          type="submit"
          className="w-full bg-[#277ecd] text-white py-2 rounded hover:bg-blue-600 transition"
        >
          {currState === "sign up" ? "Create Account" : "Login"}
        </button>
        <p className="text-center text-sm text-white">
          {currState === "login" ? (
            <>
              Create a new account?{" "}
              <span
                className="text-white cursor-pointer underline"
                onClick={() => setCurrState("sign up")}
              >
                Click here
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                className="text-white cursor-pointer underline"
                onClick={() => setCurrState("login")}
              >
                Login here
              </span>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

export default Signup;
