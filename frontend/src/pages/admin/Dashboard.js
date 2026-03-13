import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import { clearAdminToken } from "../../utils/adminAuth";

export default function Dashboard() {
  function logout() {
    clearAdminToken();
    window.location.href = "/admin/login";
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-extrabold">Admin Dashboard</h2>
          <Button className="bg-black" onClick={logout}>Logout</Button>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link to="/admin/posts"><Button className="w-full">Manage Posts</Button></Link>
          <Link to="/admin/profile"><Button className="w-full bg-black">Manage Profile Section</Button></Link>
          <Link to="/admin/about"><Button className="w-full bg-black">Manage About Section</Button></Link>
          <Link to="/admin/achievements"><Button className="w-full bg-black">Manage Achievements</Button></Link>
          <Link to="/admin/certifications"><Button className="w-full">Manage Certifications & Awards</Button></Link>
          <Link to="/admin/gallery"><Button className="w-full">Manage Gallery</Button></Link>
          <Link to="/admin/countries"><Button className="w-full">Manage Countries</Button></Link>
          <Link to="/admin/media-coverage"><Button className="w-full">Manage Media Coverage</Button></Link>
          <Link to="/admin/inbox"><Button className="w-full">Manage Contact & Messages</Button></Link>

        </div>
      </div>
    </div>
  );
}
