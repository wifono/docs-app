import { useState, useEffect } from "react";
import "../styles/AuthModal.scss";
import axios from "axios";
import toast from "react-hot-toast";

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

        {tab === "login" ? <LoginForm onClose={onClose} /> : <RegisterForm onSwitchToLogin={() => setTab("login")} />}
      </div>
    </div>
  );
}


function LoginForm({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/auth/login", {
        email,
        password,
      });
      toast.success("Prihlásenie úspešné!");
      console.log(response.data); 
      localStorage.setItem("access_token", response.data.accessToken);
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Prihlásenie zlyhalo");
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Nastala neznáma chyba");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
    {loading && <div className="text-gray-500 text-sm text-center">Loading...</div>}
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded border-gray-700 focus:border-blue-600 focus:outline-none" placeholder="Email" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 rounded border-gray-700 focus:border-blue-600 focus:outline-none mb-2" type="password" placeholder="Password" />
      <button className="bg-green-600 w-1/3 self-center text-white py-2 rounded hover:bg-green-700">
        Prihlásiť sa
      </button>
    </form>
    </>
  );
}

function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      toast.error("Vyplňte všetky polia");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Heslá sa nezhodujú");
      return;
    }

    if (!consent) {
      toast.error("Musíte súhlasiť so spracovaním osobných údajov");
      return;
    }

    setLoading(true);

    try {
      await axios.post("http://localhost:3000/users/register", {
        email,
        password,
      });

      toast.success("Registrácia úspešná! Prosím prihláste sa.");
      onSwitchToLogin();
      
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Registrácia zlyhala");
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Nastala neznáma chyba");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      
      <input 
        className="border p-2 rounded border-gray-700 focus:border-blue-600 focus:outline-none" 
        placeholder="Email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
      />
      <input 
        className="border p-2 rounded border-gray-700 focus:border-blue-600 focus:outline-none" 
        type="password" 
        placeholder="Heslo" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input 
        className="border p-2 rounded border-gray-700 focus:border-blue-600 focus:outline-none" 
        type="password" 
        placeholder="Heslo znovu" 
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <label className="flex items-center space-x-2 cursor-pointer">
        <input 
          type="checkbox" 
          id="agree" 
          className="peer hidden" 
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span className="w-4 h-4 border border-gray-400 rounded-sm bg-gray-800 peer-checked:bg-primary peer-checked:border-primary transition-colors"></span>
        <span className="text-sm text-gray-300">Súhlasím so spracovaním osobných údajov</span>
      </label>
      <button 
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white py-2 rounded hover:bg-green-700 self-center mb-2 disabled:opacity-50 disabled:cursor-not-allowed px-8"
      >
        {loading ? "Registrujem..." : "Registrovať sa"}
      </button>
    </form>
  );
}
