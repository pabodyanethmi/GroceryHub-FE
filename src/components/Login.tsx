import React from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";

const Login = () => {
  const { setShowUserLogin, setUser, setIsSeller, navigate } = useAppContext();
  const [state, setState] = React.useState("login");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const onSumbitHandler = async (event) => {
    try {
      event.preventDefault();

      const { data } = await axios.post(`/api/v1/auth/${state}`, {
        name,
        email,
        password,
      });

      if (data.success || data.user || data.data) {
        const loggedUser = data.user || data.data;
        setUser(loggedUser);

        const isAdminOrSeller =
          loggedUser?.role === "ADMIN" ||
          loggedUser?.role === "SELLER" ||
          loggedUser?.roles?.includes("ADMIN") ||
          loggedUser?.roles?.includes("SELLER") ||
          loggedUser?.Roles?.includes("ADMIN") ||
          loggedUser?.Roles?.includes("SELLER");

        if (isAdminOrSeller) {
          setIsSeller(true);
          navigate("/seller"); 
        } else {
          setIsSeller(false);
          navigate("/"); 
        }

        toast.success(
          data.message ||
            (state === "register" ? "Account Created!" : "Logged in!"),
        );
        setShowUserLogin(false);
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Server error");
    }
  };

  return (
    <div
      onClick={() => setShowUserLogin(false)}
      className="fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center text-sm text-gray-600 bg-black/50"
    >
      <form
        onSubmit={onSumbitHandler}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] text-gray-500 rounded-lg shadow-xl border border-gray-200 bg-white"
      >
        <p className="text-2xl font-medium m-auto">
          <span className="text-primary">User</span>{" "}
          {state === "login" ? "Login" : "Sign Up"}
        </p>
        {state === "register" && (
          <div className="w-full">
            <p>Name</p>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="Enter your name"
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
              type="text"
              required
            />
          </div>
        )}
        <div className="w-full ">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Email"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            type="email"
            required
          />
        </div>
        <div className="w-full ">
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Password"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            type="password"
            required
          />
        </div>
        {state === "register" ? (
          <p>
            Already have account?{" "}
            <span
              onClick={() => setState("login")}
              className="text-primary cursor-pointer"
            >
              click here
            </span>
          </p>
        ) : (
          <p>
            Create an account?{" "}
            <span
              onClick={() => setState("register")}
              className="text-primary cursor-pointer"
            >
              click here
            </span>
          </p>
        )}
        <button className="bg-primary hover:bg-primary-dull transition-all text-white w-full py-2 rounded-md cursor-pointer">
          {state === "register" ? "Create Account" : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
