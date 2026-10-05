import { useState, useContext, useRef } from "react";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Camera,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";

const API_URL = "http://localhost:5000";

export default function Profile() {
  const { user, updateProfile, uploadAvatar, removeAvatar } =
    useContext(AuthContext);
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
  });

  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageData, setMessageData] = useState({
    type: "success",
    title: "",
    message: "",
  });

  const showMessage = (type, title, message) => {
    setMessageData({ type, title, message });
    setShowMessageModal(true);
  };

  // ============================================
  // ✅ Handle Profile Update
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
      });

      showMessage(
        "success",
        "Profile Updated!",
        "Your profile has been updated successfully.",
      );
    } catch (error) {
      showMessage(
        "error",
        "Update Failed",
        error.response?.data?.message || "Failed to update profile",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ✅ Handle Avatar Upload
  // ============================================
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage("error", "File Too Large", "Image must be under 5 MB");
      return;
    }

    // Validate type
    if (!file.type.startsWith("image/")) {
      showMessage("error", "Invalid File", "Please select an image file");
      return;
    }

    setUploadingAvatar(true);

    try {
      await uploadAvatar(file);
      showMessage(
        "success",
        "Avatar Updated!",
        "Your profile photo has been updated.",
      );
    } catch (error) {
      showMessage(
        "error",
        "Upload Failed",
        error.response?.data?.message || "Failed to upload photo",
      );
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ============================================
  // ✅ Handle Avatar Remove
  // ============================================
  const handleRemoveAvatar = async () => {
    if (!window.confirm("Remove your profile photo?")) return;

    setUploadingAvatar(true);
    try {
      await removeAvatar();
      showMessage(
        "success",
        "Photo Removed",
        "Your profile photo has been removed.",
      );
    } catch (error) {
      showMessage(
        "error",
        "Failed",
        error.response?.data?.message || "Failed to remove photo",
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ============================================
  // ✅ Get Avatar URL
  // ============================================
  const getAvatarUrl = () => {
    if (user?.avatar) {
      return `${API_URL}${user.avatar}`;
    }
    return null;
  };

  // ============================================
  // ✅ Get Initials
  // ============================================
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // ============================================
  // ✅ Member Since
  // ============================================
  const getMemberSince = () => {
    const date = user?.createdAt ? new Date(user.createdAt) : new Date();
    return date.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const avatarUrl = getAvatarUrl();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information
          </p>
        </div>

        {/* Profile Header */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 gradient-primary opacity-10 rounded-full blur-3xl" />

          <div className="relative flex flex-col items-center text-center">
            {/* Avatar with upload */}
            <div className="relative group mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-28 h-28 rounded-full overflow-hidden relative shadow-2xl"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full gradient-primary flex items-center justify-center">
                    <span className="text-4xl text-white font-bold">
                      {getInitials(user?.name)}
                    </span>
                  </div>
                )}

                {/* Uploading overlay */}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </motion.div>

              {/* Camera button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 w-10 h-10 gradient-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition disabled:opacity-50"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>

              {/* Remove button */}
              {avatarUrl && !uploadingAvatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute top-0 right-0 w-8 h-8 bg-destructive rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Name & Member Since */}
            <h2 className="text-2xl font-bold">{user?.name || "User"}</h2>
            <p className="text-muted-foreground">
              Premium Member since {getMemberSince()}
            </p>

            {/* Quick info */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Member</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="w-4 h-4" />
                <span>Premium Plan</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Edit Profile Form */}
        <Card>
          <h3 className="text-lg font-semibold mb-5">Edit Profile</h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              icon={<User className="w-4 h-4" />}
              placeholder="Enter your full name"
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={user?.email || ""}
              icon={<Mail className="w-4 h-4" />}
              disabled
              className="cursor-not-allowed opacity-60"
            />
            <p className="text-xs text-muted-foreground -mt-3">
              Email cannot be changed
            </p>

            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
              icon={<Phone className="w-4 h-4" />}
              placeholder="10-digit mobile number"
              maxLength={10}
            />

            <Input
              label="Location"
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              icon={<MapPin className="w-4 h-4" />}
              placeholder="City, Country"
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows="3"
                maxLength={200}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                placeholder="Tell us about yourself..."
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.bio.length}/200
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={loading} className="flex-1">
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    name: user?.name || "",
                    phone: user?.phone || "",
                    location: user?.location || "",
                    bio: user?.bio || "",
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        {/* Account Info */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Account Information</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Email</span>
              </div>
              <span className="text-sm font-medium">{user?.email}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Joined</span>
              </div>
              <span className="text-sm font-medium">
                {new Date(user?.createdAt).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Message Modal */}
      <AnimatePresence>
        {showMessageModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMessageModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="w-full max-w-sm"
              >
                <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        delay: 0.15,
                        stiffness: 200,
                      }}
                      className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 ${
                        messageData.type === "success"
                          ? "bg-green-500/10"
                          : "bg-red-500/10"
                      }`}
                    >
                      {messageData.type === "success" ? (
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                      ) : (
                        <XCircle className="w-10 h-10 text-red-500" />
                      )}
                    </motion.div>

                    <h3 className="text-2xl font-bold mb-2">
                      {messageData.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      {messageData.message}
                    </p>

                    <Button
                      className="w-full"
                      onClick={() => setShowMessageModal(false)}
                    >
                      OK
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
}
