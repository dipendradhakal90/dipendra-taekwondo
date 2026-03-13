// frontend/src/components/common/SocialShare.js
import { Copy } from "lucide-react";
import toast from "react-hot-toast";
import { useDarkMode } from "../../context/DarkModeContext";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function SocialShare({ title, url, description }) {
  const { isDark } = useDarkMode();
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A${encodedUrl}`,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const openShare = (link) => {
    window.open(link, "_blank", "width=600,height=400");
  };

  return (
    <div className="flex items-center gap-2">
      <span className={cx("text-xs font-semibold", isDark ? "text-white/50" : "text-black/50")}>Share:</span>
      <div className="flex gap-2">
        <button
          onClick={() => openShare(shareLinks.facebook)}
          className="p-2 hover:bg-blue-500/10 rounded-lg transition"
          title="Share on Facebook"
        >
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </button>
        <button
          onClick={() => openShare(shareLinks.twitter)}
          className="p-2 hover:bg-cyan-500/10 rounded-lg transition"
          title="Share on Twitter"
        >
          <svg className="w-4 h-4 text-cyan-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
          </svg>
        </button>
        <button
          onClick={() => openShare(shareLinks.linkedin)}
          className="p-2 hover:bg-blue-700/10 rounded-lg transition"
          title="Share on LinkedIn"
        >
          <svg className="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.725-2.004 1.428-.103.249-.129.597-.129.946v5.431h-3.554v-11h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 8.855c-1.144 0-2.083-.931-2.083-2.087 0-1.156.939-2.087 2.083-2.087 1.141 0 2.082.931 2.082 2.087 0 1.156-.941 2.087-2.082 2.087zm1.782 11.596H3.555V9.452h3.564v10.999zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
          </svg>
        </button>
        <button
          onClick={() => openShare(shareLinks.whatsapp)}
          className="p-2 hover:bg-green-500/10 rounded-lg transition"
          title="Share on WhatsApp"
        >
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a6.963 6.963 0 00-3.429.920l-.24.144H5.896l.734 2.404.604 1.975.404 1.32c.197.652.878 1.134 1.577 1.134h.003c.504 0 .98-.247 1.279-.641l.02-.028c.29-.394.668-.966.975-1.52.094-.167.19-.337.28-.505.048.029.094.071.152.104.386.232.94.568 1.336.796.174.104.326.195.463.274 1.239.747 2.81 1.694 3.765 2.76 1.228 1.38 1.616 3.073 1.077 4.743-.534 1.664-2.154 2.832-3.927 2.832-.45 0-.895-.058-1.324-.173 2.77-1.39 4.63-4.27 4.63-7.574 0-4.68-3.823-8.497-8.509-8.497" />
          </svg>
        </button>
        <button
          onClick={copyToClipboard}
          className="p-2 hover:bg-black/5 rounded-lg transition"
          title="Copy link"
        >
          <Copy size={16} className={isDark ? "text-white/60" : "text-black/60"} />
        </button>
      </div>
    </div>
  );
}
