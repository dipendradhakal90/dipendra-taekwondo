import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Button from "../../components/ui/Button";
import { AuthAPI } from "../../services/auth.service";
import { setAdminToken } from "../../utils/adminAuth";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const data = await AuthAPI.login({ email, password });
      setAdminToken(data.token);
      toast.success("Welcome back!");
      nav("/admin/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-black/[0.04] to-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md rounded-3xl border border-black/10 bg-white shadow-soft p-6"
      >
        <div className="text-sm text-black/60">Admin Panel</div>
        <h1 className="text-2xl font-extrabold mt-1">
          Sign in<span className="text-brand-500">.</span>
        </h1>

        <form onSubmit={onSubmit} className="mt-6 grid gap-3">
          <input
            className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button className="w-full bg-brand-500">Login</Button>
          <p className="text-xs text-black/50">Only site owner can access CMS.</p>
        </form>
      </motion.div>
    </div>
  );
}
