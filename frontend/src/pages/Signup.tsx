import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { StoreContext } from "../context/StoreContext";
import { useNavigate } from "react-router-dom";

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

  const onSubmitHandler = async (event: React.FormEvent) => {
    event.preventDefault();

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
        navigate("/");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-10 bg-black bg-opacity-50 flex items-center justify-center">
      <form
        onSubmit={onSubmitHandler}
        className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md space-y-6"
      >
        <h2 className="text-lg font-semibold capitalize">{currState}</h2>
        {currState === "sign up" && (
          <input
            type="text"
            name="name"
            value={data.name}
            onChange={onChangeHandler}
            placeholder="Your name"
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        )}
        <input
          type="email"
          name="email"
          value={data.email}
          onChange={onChangeHandler}
          placeholder="Your email"
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="password"
          name="password"
          value={data.password}
          onChange={onChangeHandler}
          placeholder="Your password"
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="w-full bg-red-500 text-white py-2 rounded"
        >
          {currState === "sign up" ? "Create Account" : "Login"}
        </button>
        <p className="text-center text-sm">
          {currState === "login" ? (
            <>
              Create a new account?{" "}
              <span
                className="text-red-500 cursor-pointer"
                onClick={() => setCurrState("sign up")}
              >
                Click here
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                className="text-red-500 cursor-pointer"
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
