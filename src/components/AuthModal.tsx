import { useState, useEffect } from "react";
import "../styles/AuthModal.scss";

interface AuthModalProps {
  open: boolean;
  mode: "login" | "register";
  onClose: () => void;
}

export default function AuthModal({ open, mode, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">(mode);

  useEffect(() => {
    setTab(mode);
  }, [mode]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">

      <div className="registration-form rounded-xl shadow-xl  p-6 animate-fadeIn">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {tab === "login" ? "Prihlásenie" : "Registrácia"}
          </h2>

          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("login")}
            className={`px-4 py-2 rounded-full transition-colors duration-200 ${
              tab === "login"
                ? "bg-primary text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Prihlásenie
          </button>

          <button
            onClick={() => setTab("register")}
            className={`px-4 py-2 rounded-full transition-colors duration-200 ${
              tab === "register"
                ? "bg-primary text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Registrácia
          </button>
        </div>

        {tab === "login" ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}


function LoginForm() {
  return (
    <form className="flex flex-col gap-4">
      <input className="border p-2 rounded border-gray-700 focus:border-blue-600 focus:outline-none" placeholder="Email" />
      <input className="border p-2 rounded border-gray-700 focus:border-blue-600 focus:outline-none mb-2" type="password" placeholder="Password" />
      <button className="bg-green-600 w-1/3 self-center text-white py-2 rounded hover:bg-green-700">
        Prihlásiť sa
      </button>
    </form>
  );
}

function RegisterForm() {
  return (
    <form className="flex flex-col gap-4">
      <input className="border p-2 rounded border-gray-700 focus:border-blue-600 focus:outline-none" placeholder="Email" />
      <input className="border p-2 rounded border-gray-700 focus:border-blue-600 focus:outline-none" type="password" placeholder="Heslo" />
      <input className="border p-2 rounded border-gray-700 focus:border-blue-600 focus:outline-none" type="password" placeholder="Heslo znovu" />
      <label className="flex items-center space-x-2 cursor-pointer">
        <input type="checkbox" id="agree" className="peer hidden" />
        <span className="w-4 h-4 border border-gray-400 rounded-sm bg-gray-800 peer-checked:bg-primary peer-checked:border-primary transition-colors"></span>
        <span className="text-sm text-gray-300">Suhlasím so zpracovávaním osobných údajov</span>
      </label>
      <button className="bg-green-600 text-white py-2 rounded hover:bg-green-700 self-center mb-2">
        Register
      </button>
    </form>
  );
}
