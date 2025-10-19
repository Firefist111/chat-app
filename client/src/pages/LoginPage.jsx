import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/Authcontext";
const LoginPage = () => {
  const [currState, setCurrState] = useState("Login");
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [dataSubmitted, setDataSubmitted] = useState(false);

  const { login } = useContext(AuthContext);

  const onSubmitHandler = (e) => {
    e.preventDefault();

    // Step 1: First click on "Sign Up" → show bio input
    if (currState === "Sign Up" && !dataSubmitted) {
      setDataSubmitted(true);
      return;
    }

    // Step 2: Actually call login/signup function
    const credentials = { fullname, email, password, bio };

    login(
      currState === "Sign Up" ? "signup" : "login",
      credentials
    );
  };

  return (
    <div className="flex justify-center items-center w-[100vw] h-[100vh] p-20 backdrop-blur-3xl bg-cover gap-[20vw]">
      {/* Left */}
      <div>
        <img
          src={assets.logo_big}
          alt="Logo"
          className="w-[min(30vw,250px)]"
        />
      </div>

      {/* Right */}
      <form
        onSubmit={onSubmitHandler}
        className="fieldset bg-white/10 relative backdrop-blur-2xl border-base-300 rounded-box w-[350px] border px-7 py-10 text-xl"
      >
        <legend className="fieldset-legend text-4xl mb-2">{currState}</legend>

        {/* Email */}
        <label className="label">Email</label>
        <input
          type="email"
          className="input mb-4 w-full"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          required
        />

        {/* Full Name (only for Sign Up) */}
        {currState === "Sign Up" && (
          <>
            <label className="label">Full Name</label>
            <input
              type="text"
              className="input mb-4 w-full"
              placeholder="Full Name"
              onChange={(e) => setFullname(e.target.value)}
              value={fullname}
              required
            />
          </>
        )}

        {/* Password */}
        <label className="label">Password</label>
        <input
          type="password"
          className="input w-full mb-4"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          required
        />

        {/* Bio (only after first signup click) */}
        {dataSubmitted && currState === "Sign Up" && (
          <>
            <label className="label">Bio</label>
            <textarea
              value={bio}
              placeholder="Enter a bio"
              required
              rows={4}
              onChange={(e) => setBio(e.target.value)}
              className="textarea textarea-bordered w-full mb-4"
            ></textarea>
          </>
        )}

        {/* Submit button */}
        <button
          className="btn btn-neutral mt-4 bg-violet-500 w-full text-white"
          type="submit"
        >
          {currState}
        </button>

        {/* Toggle between Login and Sign Up */}
        {currState === "Login" ? (
          <p className="text-lg text-white/50 mt-4">
            Don't have an account?{" "}
            <span
              className="underline text-white cursor-pointer"
              onClick={() => {
                setCurrState("Sign Up");
                setDataSubmitted(false);
              }}
            >
              Sign Up
            </span>
          </p>
        ) : (
          <p className="text-lg text-white/50 mt-4">
            Already have an account?{" "}
            <span
              onClick={() => {
                setCurrState("Login");
                setDataSubmitted(false);
              }}
              className="text-white underline cursor-pointer"
            >
              Login
            </span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPage;
